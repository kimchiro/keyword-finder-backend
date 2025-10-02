"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApiRetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRetryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
var CircuitBreakerState;
(function (CircuitBreakerState) {
    CircuitBreakerState["CLOSED"] = "CLOSED";
    CircuitBreakerState["OPEN"] = "OPEN";
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitBreakerState || (CircuitBreakerState = {}));
let ApiRetryService = ApiRetryService_1 = class ApiRetryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ApiRetryService_1.name);
        this.circuitBreakers = new Map();
        this.defaultRetryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 8000,
            retryableStatusCodes: [408, 429, 500, 502, 503, 504],
            nonRetryableStatusCodes: [400, 401, 403, 404, 422],
            retryCondition: (error) => {
                return !error.response || this.defaultRetryConfig.retryableStatusCodes.includes(error.response.status);
            },
        };
        this.defaultCircuitBreakerConfig = {
            failureThreshold: 5,
            resetTimeout: 60000,
            monitoringPeriod: 300000,
        };
    }
    async executeWithRetry(requestFn, config = {}, circuitBreakerKey, circuitBreakerConfig = {}) {
        const retryConfig = { ...this.defaultRetryConfig, ...config };
        const cbConfig = { ...this.defaultCircuitBreakerConfig, ...circuitBreakerConfig };
        if (circuitBreakerKey && this.isCircuitBreakerOpen(circuitBreakerKey, cbConfig)) {
            throw new Error(`Circuit breaker is OPEN for ${circuitBreakerKey}`);
        }
        let lastError;
        for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
            try {
                this.logger.debug(`API 호출 시도 ${attempt + 1}/${retryConfig.maxRetries + 1}`);
                const result = await requestFn();
                if (circuitBreakerKey) {
                    this.recordSuccess(circuitBreakerKey);
                }
                if (attempt > 0) {
                    this.logger.log(`✅ API 호출 성공 (${attempt + 1}번째 시도)`);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                if (circuitBreakerKey) {
                    this.recordFailure(circuitBreakerKey);
                }
                if (!this.shouldRetry(lastError, retryConfig) || attempt === retryConfig.maxRetries) {
                    this.logger.error(`❌ API 호출 최종 실패 (${attempt + 1}번째 시도): ${lastError.message}`);
                    break;
                }
                const delay = this.calculateDelay(attempt, retryConfig);
                this.logger.warn(`⏳ API 재시도 대기: ${delay}ms (${attempt + 1}번째 시도 실패)`);
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    async executeNaverApiWithRetry(requestFn, apiName) {
        const retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 8000,
            retryCondition: (error) => {
                if (!error.response)
                    return true;
                const status = error.response.status;
                if (status >= 400 && status < 500) {
                    if (status === 429)
                        return true;
                    return false;
                }
                return status >= 500;
            },
        };
        const circuitBreakerConfig = {
            failureThreshold: 3,
            resetTimeout: 30000,
            monitoringPeriod: 180000,
        };
        return this.executeWithRetry(requestFn, retryConfig, `naver-api-${apiName}`, circuitBreakerConfig);
    }
    shouldRetry(error, config) {
        if (config.retryCondition) {
            return config.retryCondition(error);
        }
        if (!error.response) {
            return true;
        }
        const status = error.response.status;
        if (config.nonRetryableStatusCodes.includes(status)) {
            return false;
        }
        return config.retryableStatusCodes.includes(status);
    }
    calculateDelay(attempt, config) {
        const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        const totalDelay = Math.min(exponentialDelay + jitter, config.maxDelay);
        return Math.floor(totalDelay);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    isCircuitBreakerOpen(key, config) {
        const stats = this.getCircuitBreakerStats(key);
        const now = Date.now();
        switch (stats.state) {
            case CircuitBreakerState.CLOSED:
                return false;
            case CircuitBreakerState.OPEN:
                if (now - stats.lastFailureTime >= config.resetTimeout) {
                    stats.state = CircuitBreakerState.HALF_OPEN;
                    this.logger.log(`🔄 Circuit breaker ${key}: OPEN → HALF_OPEN`);
                    return false;
                }
                return true;
            case CircuitBreakerState.HALF_OPEN:
                return false;
            default:
                return false;
        }
    }
    recordSuccess(key) {
        const stats = this.getCircuitBreakerStats(key);
        stats.successes++;
        if (stats.state === CircuitBreakerState.HALF_OPEN) {
            stats.state = CircuitBreakerState.CLOSED;
            stats.failures = 0;
            this.logger.log(`✅ Circuit breaker ${key}: HALF_OPEN → CLOSED`);
        }
    }
    recordFailure(key) {
        const stats = this.getCircuitBreakerStats(key);
        const config = this.defaultCircuitBreakerConfig;
        stats.failures++;
        stats.lastFailureTime = Date.now();
        if (stats.state === CircuitBreakerState.CLOSED &&
            stats.failures >= config.failureThreshold) {
            stats.state = CircuitBreakerState.OPEN;
            this.logger.warn(`🚨 Circuit breaker ${key}: CLOSED → OPEN (${stats.failures} failures)`);
        }
        else if (stats.state === CircuitBreakerState.HALF_OPEN) {
            stats.state = CircuitBreakerState.OPEN;
            this.logger.warn(`🚨 Circuit breaker ${key}: HALF_OPEN → OPEN`);
        }
    }
    getCircuitBreakerStats(key) {
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, {
                failures: 0,
                successes: 0,
                lastFailureTime: 0,
                state: CircuitBreakerState.CLOSED,
            });
        }
        return this.circuitBreakers.get(key);
    }
    getCircuitBreakerStatus() {
        const status = {};
        this.circuitBreakers.forEach((stats, key) => {
            status[key] = { ...stats };
        });
        return status;
    }
    resetCircuitBreaker(key) {
        const stats = this.getCircuitBreakerStats(key);
        stats.failures = 0;
        stats.successes = 0;
        stats.lastFailureTime = 0;
        stats.state = CircuitBreakerState.CLOSED;
        this.logger.log(`🔄 Circuit breaker ${key} 리셋됨`);
    }
};
exports.ApiRetryService = ApiRetryService;
exports.ApiRetryService = ApiRetryService = ApiRetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiRetryService);
//# sourceMappingURL=api-retry.service.js.map