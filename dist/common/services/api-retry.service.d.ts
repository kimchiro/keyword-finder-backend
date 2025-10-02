import { ConfigService } from '@nestjs/config';
import { AxiosResponse, AxiosError } from 'axios';
export interface RetryConfig {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableStatusCodes?: number[];
    nonRetryableStatusCodes?: number[];
    retryCondition?: (error: AxiosError) => boolean;
}
export interface CircuitBreakerConfig {
    failureThreshold?: number;
    resetTimeout?: number;
    monitoringPeriod?: number;
}
declare enum CircuitBreakerState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerStats {
    failures: number;
    successes: number;
    lastFailureTime: number;
    state: CircuitBreakerState;
}
export declare class ApiRetryService {
    private configService;
    private readonly logger;
    private readonly circuitBreakers;
    private readonly defaultRetryConfig;
    private readonly defaultCircuitBreakerConfig;
    constructor(configService: ConfigService);
    executeWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>, config?: RetryConfig, circuitBreakerKey?: string, circuitBreakerConfig?: CircuitBreakerConfig): Promise<AxiosResponse<T>>;
    executeNaverApiWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>, apiName: string): Promise<AxiosResponse<T>>;
    private shouldRetry;
    private calculateDelay;
    private sleep;
    private isCircuitBreakerOpen;
    private recordSuccess;
    private recordFailure;
    private getCircuitBreakerStats;
    getCircuitBreakerStatus(): Record<string, CircuitBreakerStats>;
    resetCircuitBreaker(key: string): void;
}
export {};
