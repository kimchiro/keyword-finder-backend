import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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

enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
  state: CircuitBreakerState;
}

@Injectable()
export class ApiRetryService {
  private readonly logger = new Logger(ApiRetryService.name);
  private readonly circuitBreakers = new Map<string, CircuitBreakerStats>();
  
  private readonly defaultRetryConfig: Required<RetryConfig> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    nonRetryableStatusCodes: [400, 401, 403, 404, 422],
    retryCondition: (error: AxiosError) => {
      return !error.response || this.defaultRetryConfig.retryableStatusCodes.includes(error.response.status);
    },
  };

  private readonly defaultCircuitBreakerConfig: Required<CircuitBreakerConfig> = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1분
    monitoringPeriod: 300000, // 5분
  };

  constructor(private configService: ConfigService) {}

  /**
   * 지수 백오프 알고리즘을 사용한 API 재시도 실행
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = {},
    circuitBreakerKey?: string,
    circuitBreakerConfig: CircuitBreakerConfig = {}
  ): Promise<AxiosResponse<T>> {
    const retryConfig = { ...this.defaultRetryConfig, ...config };
    const cbConfig = { ...this.defaultCircuitBreakerConfig, ...circuitBreakerConfig };

    // 서킷 브레이커 체크
    if (circuitBreakerKey && this.isCircuitBreakerOpen(circuitBreakerKey, cbConfig)) {
      throw new Error(`Circuit breaker is OPEN for ${circuitBreakerKey}`);
    }

    let lastError: AxiosError | Error;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        this.logger.debug(`API 호출 시도 ${attempt + 1}/${retryConfig.maxRetries + 1}`);
        
        const result = await requestFn();
        
        // 성공 시 서킷 브레이커 상태 업데이트
        if (circuitBreakerKey) {
          this.recordSuccess(circuitBreakerKey);
        }
        
        if (attempt > 0) {
          this.logger.log(`✅ API 호출 성공 (${attempt + 1}번째 시도)`);
        }
        
        return result;
      } catch (error) {
        lastError = error as AxiosError;
        
        // 서킷 브레이커 실패 기록
        if (circuitBreakerKey) {
          this.recordFailure(circuitBreakerKey);
        }

        // 재시도 가능한 오류인지 확인
        if (!this.shouldRetry(lastError as AxiosError, retryConfig) || attempt === retryConfig.maxRetries) {
          this.logger.error(`❌ API 호출 최종 실패 (${attempt + 1}번째 시도): ${lastError.message}`);
          break;
        }

        // 지수 백오프 딜레이 계산
        const delay = this.calculateDelay(attempt, retryConfig);
        this.logger.warn(`⏳ API 재시도 대기: ${delay}ms (${attempt + 1}번째 시도 실패)`);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 네이버 API 전용 재시도 메서드
   */
  async executeNaverApiWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    apiName: string
  ): Promise<AxiosResponse<T>> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      retryCondition: (error: AxiosError) => {
        // 네이버 API 특화 재시도 조건
        if (!error.response) return true; // 네트워크 오류
        
        const status = error.response.status;
        
        // 4xx 오류는 재시도하지 않음 (인증, 권한, 잘못된 요청 등)
        if (status >= 400 && status < 500) {
          if (status === 429) return true; // Rate Limit은 재시도
          return false;
        }
        
        // 5xx 오류는 재시도
        return status >= 500;
      },
    };

    const circuitBreakerConfig: CircuitBreakerConfig = {
      failureThreshold: 3,
      resetTimeout: 30000, // 30초
      monitoringPeriod: 180000, // 3분
    };

    return this.executeWithRetry(
      requestFn,
      retryConfig,
      `naver-api-${apiName}`,
      circuitBreakerConfig
    );
  }

  /**
   * 재시도 가능한 오류인지 판단
   */
  private shouldRetry(error: AxiosError, config: Required<RetryConfig>): boolean {
    // 커스텀 재시도 조건이 있으면 사용
    if (config.retryCondition) {
      return config.retryCondition(error);
    }

    // 네트워크 오류 (응답 없음)
    if (!error.response) {
      return true;
    }

    const status = error.response.status;

    // 명시적으로 재시도하지 않을 상태 코드
    if (config.nonRetryableStatusCodes.includes(status)) {
      return false;
    }

    // 재시도 가능한 상태 코드
    return config.retryableStatusCodes.includes(status);
  }

  /**
   * 지수 백오프 딜레이 계산
   */
  private calculateDelay(attempt: number, config: Required<RetryConfig>): number {
    // 지수 백오프: baseDelay * (2 ^ attempt) + 랜덤 지터
    const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 0-1초 랜덤 지터
    const totalDelay = Math.min(exponentialDelay + jitter, config.maxDelay);
    
    return Math.floor(totalDelay);
  }

  /**
   * 딜레이 함수
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 서킷 브레이커 상태 확인
   */
  private isCircuitBreakerOpen(key: string, config: Required<CircuitBreakerConfig>): boolean {
    const stats = this.getCircuitBreakerStats(key);
    const now = Date.now();

    switch (stats.state) {
      case CircuitBreakerState.CLOSED:
        return false;

      case CircuitBreakerState.OPEN:
        // 리셋 타임아웃이 지났으면 HALF_OPEN으로 전환
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

  /**
   * 서킷 브레이커 성공 기록
   */
  private recordSuccess(key: string): void {
    const stats = this.getCircuitBreakerStats(key);
    stats.successes++;

    if (stats.state === CircuitBreakerState.HALF_OPEN) {
      // HALF_OPEN 상태에서 성공하면 CLOSED로 전환
      stats.state = CircuitBreakerState.CLOSED;
      stats.failures = 0;
      this.logger.log(`✅ Circuit breaker ${key}: HALF_OPEN → CLOSED`);
    }
  }

  /**
   * 서킷 브레이커 실패 기록
   */
  private recordFailure(key: string): void {
    const stats = this.getCircuitBreakerStats(key);
    const config = this.defaultCircuitBreakerConfig;
    
    stats.failures++;
    stats.lastFailureTime = Date.now();

    if (stats.state === CircuitBreakerState.CLOSED && 
        stats.failures >= config.failureThreshold) {
      // 실패 임계값 도달 시 OPEN으로 전환
      stats.state = CircuitBreakerState.OPEN;
      this.logger.warn(`🚨 Circuit breaker ${key}: CLOSED → OPEN (${stats.failures} failures)`);
    } else if (stats.state === CircuitBreakerState.HALF_OPEN) {
      // HALF_OPEN 상태에서 실패하면 다시 OPEN으로
      stats.state = CircuitBreakerState.OPEN;
      this.logger.warn(`🚨 Circuit breaker ${key}: HALF_OPEN → OPEN`);
    }
  }

  /**
   * 서킷 브레이커 통계 조회
   */
  private getCircuitBreakerStats(key: string): CircuitBreakerStats {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        failures: 0,
        successes: 0,
        lastFailureTime: 0,
        state: CircuitBreakerState.CLOSED,
      });
    }
    return this.circuitBreakers.get(key)!;
  }

  /**
   * 서킷 브레이커 상태 조회 (모니터링용)
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerStats> {
    const status: Record<string, CircuitBreakerStats> = {};
    this.circuitBreakers.forEach((stats, key) => {
      status[key] = { ...stats };
    });
    return status;
  }

  /**
   * 서킷 브레이커 리셋 (관리용)
   */
  resetCircuitBreaker(key: string): void {
    const stats = this.getCircuitBreakerStats(key);
    stats.failures = 0;
    stats.successes = 0;
    stats.lastFailureTime = 0;
    stats.state = CircuitBreakerState.CLOSED;
    this.logger.log(`🔄 Circuit breaker ${key} 리셋됨`);
  }
}
