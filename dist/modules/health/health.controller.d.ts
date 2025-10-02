import { HealthService } from './health.service';
import { ApiRetryService } from '../../common/services/api-retry.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
export declare class HealthController {
    private readonly healthService;
    private readonly apiRetryService;
    private readonly rateLimitGuard;
    constructor(healthService: HealthService, apiRetryService: ApiRetryService, rateLimitGuard: RateLimitGuard);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: any;
    }>;
    getCircuitBreakerStatus(): {
        success: boolean;
        message: string;
        data: {
            circuitBreakers: Record<string, import("../../common/services/api-retry.service").CircuitBreakerStats>;
            timestamp: string;
        };
    };
    getRateLimitStatus(): {
        success: boolean;
        message: string;
        data: {
            rateLimits: Record<string, import("../../common/guards/rate-limit.guard").RateLimitEntry & {
                remainingTime: number;
            }>;
            timestamp: string;
        };
    };
    getApiMetrics(): {
        success: boolean;
        message: string;
        data: {
            circuitBreaker: {
                successRate: string;
                totalServices: number;
                totalFailures: number;
                totalSuccesses: number;
                openCircuits: number;
                halfOpenCircuits: number;
                closedCircuits: number;
            };
            rateLimit: {
                totalKeys: number;
                totalRequests: number;
                activeWindows: number;
            };
            timestamp: string;
        };
    };
    resetCircuitBreaker(key: string): {
        success: boolean;
        message: string;
        timestamp: string;
    };
    resetRateLimit(key: string): {
        success: boolean;
        message: string;
        timestamp: string;
    };
}
