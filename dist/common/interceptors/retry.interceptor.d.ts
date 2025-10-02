import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiRetryService } from '../services/api-retry.service';
export interface RetryInterceptorOptions {
    maxRetries?: number;
    delayMs?: number;
    retryCondition?: (error: any) => boolean;
    enableCircuitBreaker?: boolean;
    circuitBreakerKey?: string;
}
export declare class RetryInterceptor implements NestInterceptor {
    private readonly apiRetryService;
    private readonly logger;
    constructor(apiRetryService: ApiRetryService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private handleRetryableError;
    private getRetryOptions;
    private shouldApplyRetry;
}
export declare function Retry(options?: RetryInterceptorOptions): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare function NaverApiRetry(apiName?: string): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
