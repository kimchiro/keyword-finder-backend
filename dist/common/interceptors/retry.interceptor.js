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
var RetryInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryInterceptor = void 0;
exports.Retry = Retry;
exports.NaverApiRetry = NaverApiRetry;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_retry_service_1 = require("../services/api-retry.service");
let RetryInterceptor = RetryInterceptor_1 = class RetryInterceptor {
    constructor(apiRetryService) {
        this.apiRetryService = apiRetryService;
        this.logger = new common_1.Logger(RetryInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const options = this.getRetryOptions(context);
        if (!this.shouldApplyRetry(request, options)) {
            return next.handle();
        }
        const circuitBreakerKey = options.circuitBreakerKey ||
            `${request.method}-${request.url}`;
        return next.handle().pipe((0, operators_1.catchError)((error) => {
            if (error instanceof common_1.HttpException) {
                const status = error.getStatus();
                if (status === 429 || status >= 500) {
                    return this.handleRetryableError(error, options, circuitBreakerKey);
                }
                return (0, rxjs_1.throwError)(() => error);
            }
            return this.handleRetryableError(error, options, circuitBreakerKey);
        }));
    }
    handleRetryableError(error, options, circuitBreakerKey) {
        const maxRetries = options.maxRetries || 3;
        const delayMs = options.delayMs || 1000;
        this.logger.warn(`🔄 재시도 가능한 오류 발생: ${error.message}`);
        if (options.enableCircuitBreaker) {
            const cbStatus = this.apiRetryService.getCircuitBreakerStatus();
            const stats = cbStatus[circuitBreakerKey];
            if (stats?.state === 'OPEN') {
                this.logger.error(`🚨 Circuit breaker OPEN: ${circuitBreakerKey}`);
                return (0, rxjs_1.throwError)(() => new common_1.HttpException('Service temporarily unavailable (Circuit breaker OPEN)', common_1.HttpStatus.SERVICE_UNAVAILABLE));
            }
        }
        return (0, rxjs_1.throwError)(() => error).pipe((0, operators_1.retry)({
            count: maxRetries,
            delay: (error, retryCount) => {
                const exponentialDelay = delayMs * Math.pow(2, retryCount - 1);
                const jitter = Math.random() * 1000;
                const totalDelay = Math.min(exponentialDelay + jitter, 8000);
                this.logger.debug(`⏳ 재시도 대기: ${totalDelay}ms (${retryCount}/${maxRetries})`);
                return new rxjs_1.Observable(subscriber => {
                    setTimeout(() => {
                        subscriber.next(null);
                        subscriber.complete();
                    }, totalDelay);
                });
            },
            resetOnSuccess: true,
        }), (0, operators_1.catchError)((finalError) => {
            this.logger.error(`❌ 최종 재시도 실패: ${finalError.message}`);
            if (options.enableCircuitBreaker) {
            }
            return (0, rxjs_1.throwError)(() => finalError);
        }));
    }
    getRetryOptions(context) {
        const handler = context.getHandler();
        const classRef = context.getClass();
        const handlerOptions = Reflect.getMetadata('retry-options', handler) || {};
        const classOptions = Reflect.getMetadata('retry-options', classRef) || {};
        return {
            maxRetries: 3,
            delayMs: 1000,
            enableCircuitBreaker: true,
            ...classOptions,
            ...handlerOptions,
        };
    }
    shouldApplyRetry(request, options) {
        if (request.method !== 'GET') {
            return false;
        }
        const excludePaths = ['/health', '/metrics'];
        if (excludePaths.some(path => request.url.includes(path))) {
            return false;
        }
        return true;
    }
};
exports.RetryInterceptor = RetryInterceptor;
exports.RetryInterceptor = RetryInterceptor = RetryInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_retry_service_1.ApiRetryService])
], RetryInterceptor);
function Retry(options = {}) {
    return function (target, propertyKey, descriptor) {
        if (propertyKey && descriptor) {
            Reflect.defineMetadata('retry-options', options, descriptor.value);
        }
        else {
            Reflect.defineMetadata('retry-options', options, target);
        }
    };
}
function NaverApiRetry(apiName) {
    return Retry({
        maxRetries: 3,
        delayMs: 1000,
        enableCircuitBreaker: true,
        circuitBreakerKey: apiName ? `naver-api-${apiName}` : undefined,
        retryCondition: (error) => {
            if (error instanceof common_1.HttpException) {
                const status = error.getStatus();
                return status === 429 || status >= 500;
            }
            return true;
        },
    });
}
//# sourceMappingURL=retry.interceptor.js.map