import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export interface RateLimitConfig {
  windowMs?: number;    // 시간 윈도우 (밀리초)
  maxRequests?: number; // 최대 요청 수
  keyGenerator?: (request: any) => string; // 키 생성 함수
  skipIf?: (request: any) => boolean; // 스킵 조건
  message?: string;     // 제한 시 메시지
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    // 5분마다 만료된 엔트리 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const config = this.getRateLimitConfig(context);

    if (!config || (config.skipIf && config.skipIf(request))) {
      return true;
    }

    const key = this.generateKey(request, config);
    const now = Date.now();
    const windowMs = config.windowMs || 60000; // 기본 1분
    const maxRequests = config.maxRequests || 100; // 기본 100회

    let entry = this.store.get(key);

    if (!entry || now >= entry.resetTime) {
      // 새로운 윈도우 시작
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(key, entry);
      
      this.logger.debug(`새로운 Rate Limit 윈도우 시작: ${key} (1/${maxRequests})`);
      return true;
    }

    if (entry.count >= maxRequests) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      
      this.logger.warn(`Rate Limit 초과: ${key} (${entry.count}/${maxRequests}), 재시도까지 ${remainingTime}초`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: config.message || 'Too many requests',
          retryAfter: remainingTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    this.logger.debug(`Rate Limit 카운트 증가: ${key} (${entry.count}/${maxRequests})`);
    
    return true;
  }

  private getRateLimitConfig(context: ExecutionContext): RateLimitConfig | null {
    const handler = context.getHandler();
    const classRef = context.getClass();

    // 메서드 레벨 설정이 클래스 레벨 설정보다 우선
    const handlerConfig = this.reflector.get<RateLimitConfig>('rate-limit', handler);
    const classConfig = this.reflector.get<RateLimitConfig>('rate-limit', classRef);

    return handlerConfig || classConfig || null;
  }

  private generateKey(request: any, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    // 기본 키 생성: IP + User-Agent + 경로
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const path = request.route?.path || request.url;

    return `${ip}:${userAgent}:${path}`;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Rate Limit 스토어 정리: ${cleanedCount}개 엔트리 삭제`);
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * 현재 Rate Limit 상태 조회 (모니터링용)
   */
  getRateLimitStatus(): Record<string, RateLimitEntry & { remainingTime: number }> {
    const now = Date.now();
    const status: Record<string, RateLimitEntry & { remainingTime: number }> = {};

    this.store.forEach((entry, key) => {
      status[key] = {
        ...entry,
        remainingTime: Math.max(0, entry.resetTime - now),
      };
    });

    return status;
  }

  /**
   * 특정 키의 Rate Limit 리셋 (관리용)
   */
  resetRateLimit(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * 모든 Rate Limit 리셋 (관리용)
   */
  resetAllRateLimits(): void {
    this.store.clear();
    this.logger.log('모든 Rate Limit 리셋됨');
  }
}

/**
 * Rate Limit 설정 데코레이터
 */
export const RateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      // 메서드 레벨 데코레이터
      Reflect.defineMetadata('rate-limit', config, descriptor.value);
    } else {
      // 클래스 레벨 데코레이터
      Reflect.defineMetadata('rate-limit', config, target);
    }
  };
};

/**
 * 네이버 API 전용 Rate Limit 데코레이터
 */
export const NaverApiRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return RateLimit({
    maxRequests,
    windowMs,
    keyGenerator: (request) => {
      // 네이버 API는 클라이언트 ID별로 제한
      const clientId = request.headers['x-naver-client-id'] || 'default';
      const ip = request.headers['x-forwarded-for']?.split(',')[0] || 
                request.connection?.remoteAddress || 'unknown';
      return `naver-api:${clientId}:${ip}`;
    },
    message: '네이버 API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
  });
};

/**
 * IP별 Rate Limit 데코레이터
 */
export const IpRateLimit = (maxRequests = 1000, windowMs = 60000) => {
  return RateLimit({
    maxRequests,
    windowMs,
    keyGenerator: (request) => {
      const ip = request.headers['x-forwarded-for']?.split(',')[0] || 
                request.connection?.remoteAddress || 'unknown';
      return `ip:${ip}`;
    },
    message: 'IP별 요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
  });
};

/**
 * 사용자별 Rate Limit 데코레이터 (인증된 사용자용)
 */
export const UserRateLimit = (maxRequests = 500, windowMs = 60000) => {
  return RateLimit({
    maxRequests,
    windowMs,
    keyGenerator: (request) => {
      const userId = request.user?.id || request.headers['x-user-id'] || 'anonymous';
      return `user:${userId}`;
    },
    skipIf: (request) => {
      // 관리자는 Rate Limit 제외
      return request.user?.role === 'admin';
    },
    message: '사용자별 요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
  });
};
