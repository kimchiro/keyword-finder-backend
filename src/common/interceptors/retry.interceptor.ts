import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, delay, mergeMap } from 'rxjs/operators';
import { ApiRetryService } from '../services/api-retry.service';

export interface RetryInterceptorOptions {
  maxRetries?: number;
  delayMs?: number;
  retryCondition?: (error: any) => boolean;
  enableCircuitBreaker?: boolean;
  circuitBreakerKey?: string;
}

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RetryInterceptor.name);

  constructor(private readonly apiRetryService: ApiRetryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const options = this.getRetryOptions(context);

    if (!this.shouldApplyRetry(request, options)) {
      return next.handle();
    }

    const circuitBreakerKey = options.circuitBreakerKey || 
      `${request.method}-${request.url}`;

    return next.handle().pipe(
      catchError((error) => {
        // HTTP 예외는 재시도하지 않음 (비즈니스 로직 오류)
        if (error instanceof HttpException) {
          const status = error.getStatus();
          
          // Rate Limit (429)이나 서버 오류 (5xx)만 재시도
          if (status === 429 || status >= 500) {
            return this.handleRetryableError(error, options, circuitBreakerKey);
          }
          
          return throwError(() => error);
        }

        // 네트워크 오류나 기타 시스템 오류는 재시도
        return this.handleRetryableError(error, options, circuitBreakerKey);
      })
    );
  }

  private handleRetryableError(
    error: any,
    options: RetryInterceptorOptions,
    circuitBreakerKey: string
  ): Observable<any> {
    const maxRetries = options.maxRetries || 3;
    const delayMs = options.delayMs || 1000;

    this.logger.warn(`🔄 재시도 가능한 오류 발생: ${error.message}`);

    // 서킷 브레이커 체크
    if (options.enableCircuitBreaker) {
      const cbStatus = this.apiRetryService.getCircuitBreakerStatus();
      const stats = cbStatus[circuitBreakerKey];
      
      if (stats?.state === 'OPEN') {
        this.logger.error(`🚨 Circuit breaker OPEN: ${circuitBreakerKey}`);
        return throwError(() => new HttpException(
          'Service temporarily unavailable (Circuit breaker OPEN)',
          HttpStatus.SERVICE_UNAVAILABLE
        ));
      }
    }

    return throwError(() => error).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          // 지수 백오프 딜레이 계산
          const exponentialDelay = delayMs * Math.pow(2, retryCount - 1);
          const jitter = Math.random() * 1000;
          const totalDelay = Math.min(exponentialDelay + jitter, 8000);

          this.logger.debug(`⏳ 재시도 대기: ${totalDelay}ms (${retryCount}/${maxRetries})`);

          return new Observable(subscriber => {
            setTimeout(() => {
              subscriber.next(null);
              subscriber.complete();
            }, totalDelay);
          });
        },
        resetOnSuccess: true,
      }),
      catchError((finalError) => {
        this.logger.error(`❌ 최종 재시도 실패: ${finalError.message}`);
        
        // 서킷 브레이커 실패 기록
        if (options.enableCircuitBreaker) {
          // ApiRetryService의 recordFailure 메서드 호출
          // (private 메서드이므로 별도 public 메서드 필요)
        }

        return throwError(() => finalError);
      })
    );
  }

  private getRetryOptions(context: ExecutionContext): RetryInterceptorOptions {
    // 메타데이터에서 재시도 옵션 추출
    const handler = context.getHandler();
    const classRef = context.getClass();

    // @Retry() 데코레이터에서 설정된 옵션 가져오기
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

  private shouldApplyRetry(request: any, options: RetryInterceptorOptions): boolean {
    // GET 요청만 재시도 (멱등성 보장)
    if (request.method !== 'GET') {
      return false;
    }

    // 특정 경로 제외
    const excludePaths = ['/health', '/metrics'];
    if (excludePaths.some(path => request.url.includes(path))) {
      return false;
    }

    return true;
  }
}

/**
 * 재시도 설정 데코레이터
 */
export function Retry(options: RetryInterceptorOptions = {}) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey && descriptor) {
      // 메서드 레벨 데코레이터
      Reflect.defineMetadata('retry-options', options, descriptor.value);
    } else {
      // 클래스 레벨 데코레이터
      Reflect.defineMetadata('retry-options', options, target);
    }
  };
}

/**
 * 네이버 API 전용 재시도 데코레이터
 */
export function NaverApiRetry(apiName?: string) {
  return Retry({
    maxRetries: 3,
    delayMs: 1000,
    enableCircuitBreaker: true,
    circuitBreakerKey: apiName ? `naver-api-${apiName}` : undefined,
    retryCondition: (error: any) => {
      // 네이버 API 특화 재시도 조건
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return status === 429 || status >= 500;
      }
      return true; // 네트워크 오류는 재시도
    },
  });
}
