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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const health_service_1 = require("./health.service");
const api_retry_service_1 = require("../../common/services/api-retry.service");
const rate_limit_guard_1 = require("../../common/guards/rate-limit.guard");
let HealthController = class HealthController {
    constructor(healthService, apiRetryService, rateLimitGuard) {
        this.healthService = healthService;
        this.apiRetryService = apiRetryService;
        this.rateLimitGuard = rateLimitGuard;
    }
    check() {
        return this.healthService.check();
    }
    getCircuitBreakerStatus() {
        const circuitBreakers = this.apiRetryService.getCircuitBreakerStatus();
        return {
            success: true,
            message: '서킷 브레이커 상태 조회 완료',
            data: {
                circuitBreakers,
                timestamp: new Date().toISOString(),
            },
        };
    }
    getRateLimitStatus() {
        const rateLimits = this.rateLimitGuard.getRateLimitStatus();
        return {
            success: true,
            message: 'Rate Limit 상태 조회 완료',
            data: {
                rateLimits,
                timestamp: new Date().toISOString(),
            },
        };
    }
    getApiMetrics() {
        const circuitBreakers = this.apiRetryService.getCircuitBreakerStatus();
        const rateLimits = this.rateLimitGuard.getRateLimitStatus();
        const cbStats = Object.entries(circuitBreakers).reduce((acc, [key, stats]) => {
            acc.totalServices++;
            acc.totalFailures += stats.failures;
            acc.totalSuccesses += stats.successes;
            if (stats.state === 'OPEN')
                acc.openCircuits++;
            else if (stats.state === 'HALF_OPEN')
                acc.halfOpenCircuits++;
            else
                acc.closedCircuits++;
            return acc;
        }, {
            totalServices: 0,
            totalFailures: 0,
            totalSuccesses: 0,
            openCircuits: 0,
            halfOpenCircuits: 0,
            closedCircuits: 0,
        });
        const rlStats = Object.entries(rateLimits).reduce((acc, [key, stats]) => {
            acc.totalKeys++;
            acc.totalRequests += stats.count;
            if (stats.remainingTime > 0)
                acc.activeWindows++;
            return acc;
        }, {
            totalKeys: 0,
            totalRequests: 0,
            activeWindows: 0,
        });
        return {
            success: true,
            message: 'API 메트릭 조회 완료',
            data: {
                circuitBreaker: {
                    ...cbStats,
                    successRate: cbStats.totalSuccesses + cbStats.totalFailures > 0
                        ? (cbStats.totalSuccesses / (cbStats.totalSuccesses + cbStats.totalFailures) * 100).toFixed(2) + '%'
                        : '0%',
                },
                rateLimit: rlStats,
                timestamp: new Date().toISOString(),
            },
        };
    }
    resetCircuitBreaker(key) {
        this.apiRetryService.resetCircuitBreaker(key);
        return {
            success: true,
            message: `서킷 브레이커 '${key}'가 리셋되었습니다.`,
            timestamp: new Date().toISOString(),
        };
    }
    resetRateLimit(key) {
        const success = this.rateLimitGuard.resetRateLimit(key);
        return {
            success,
            message: success
                ? `Rate Limit '${key}'가 리셋되었습니다.`
                : `Rate Limit '${key}'를 찾을 수 없습니다.`,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '서비스 헬스체크',
        description: '서비스의 전반적인 상태를 확인합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '헬스체크 성공',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2025-09-21T08:30:00.000Z' },
                uptime: { type: 'number', example: 3600 },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('circuit-breaker'),
    (0, swagger_1.ApiOperation)({
        summary: '서킷 브레이커 상태 조회',
        description: '모든 서킷 브레이커의 현재 상태를 조회합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '서킷 브레이커 상태 조회 성공',
        schema: {
            type: 'object',
            properties: {
                circuitBreakers: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            failures: { type: 'number', example: 2 },
                            successes: { type: 'number', example: 10 },
                            lastFailureTime: { type: 'number', example: 1632211800000 },
                            state: { type: 'string', enum: ['CLOSED', 'OPEN', 'HALF_OPEN'] },
                        },
                    },
                },
                timestamp: { type: 'string', example: '2025-09-21T08:30:00.000Z' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getCircuitBreakerStatus", null);
__decorate([
    (0, common_1.Get)('rate-limit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Rate Limit 상태 조회',
        description: '현재 활성화된 Rate Limit 상태를 조회합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Rate Limit 상태 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getRateLimitStatus", null);
__decorate([
    (0, common_1.Get)('api-metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'API 메트릭 조회',
        description: 'API 재시도 시스템과 Rate Limiting의 종합 메트릭을 조회합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API 메트릭 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getApiMetrics", null);
__decorate([
    (0, common_1.Get)('reset-circuit-breaker/:key'),
    (0, swagger_1.ApiOperation)({
        summary: '서킷 브레이커 리셋',
        description: '특정 서킷 브레이커를 리셋합니다.'
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "resetCircuitBreaker", null);
__decorate([
    (0, common_1.Get)('reset-rate-limit/:key'),
    (0, swagger_1.ApiOperation)({
        summary: 'Rate Limit 리셋',
        description: '특정 Rate Limit을 리셋합니다.'
    }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "resetRateLimit", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService,
        api_retry_service_1.ApiRetryService,
        rate_limit_guard_1.RateLimitGuard])
], HealthController);
//# sourceMappingURL=health.controller.js.map