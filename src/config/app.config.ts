import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 애플리케이션 설정 관리 서비스
 * 환경변수를 타입 안전하게 관리하고 기본값을 제공합니다.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // 서버 설정
  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // 데이터베이스 설정
  get dbHost(): string {
    return this.configService.get<string>('DB_HOST');
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT');
  }

  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME');
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD');
  }

  get dbDatabase(): string {
    return this.configService.get<string>('DB_DATABASE');
  }

  // 네이버 API 설정
  get naverClientId(): string {
    return this.configService.get<string>('NAVER_CLIENT_ID');
  }

  get naverClientSecret(): string {
    return this.configService.get<string>('NAVER_CLIENT_SECRET');
  }

  get naverApiBaseUrl(): string {
    return this.configService.get<string>('NAVER_API_BASE_URL', 'https://openapi.naver.com');
  }

  // API 제한 설정
  get apiTimeoutMs(): number {
    return this.configService.get<number>('API_TIMEOUT_MS', 10000);
  }

  get apiExtendedTimeoutMs(): number {
    return this.configService.get<number>('API_EXTENDED_TIMEOUT_MS', 15000);
  }

  get apiRetryCount(): number {
    return this.configService.get<number>('API_RETRY_COUNT', 3);
  }

  get apiRetryDelayMs(): number {
    return this.configService.get<number>('API_RETRY_DELAY_MS', 1000);
  }

  // 스크래핑 설정
  get scrapingMaxResults(): number {
    return this.configService.get<number>('SCRAPING_MAX_RESULTS', 50);
  }

  get scrapingMaxKeywordsPerType(): number {
    return this.configService.get<number>('SCRAPING_MAX_KEYWORDS_PER_TYPE', 10);
  }

  get scrapingPageTimeoutMs(): number {
    return this.configService.get<number>('SCRAPING_PAGE_TIMEOUT_MS', 30000);
  }

  get scrapingDelayMs(): number {
    return this.configService.get<number>('SCRAPING_DELAY_MS', 1000);
  }

  // 날짜 범위 설정
  get defaultStartDate(): string {
    return this.configService.get<string>('DEFAULT_START_DATE', '2024-01-01');
  }

  get defaultEndDate(): string {
    return this.configService.get<string>('DEFAULT_END_DATE', '2024-12-31');
  }

  // 브라우저 풀 설정
  get browserPoolSize(): number {
    return this.configService.get<number>('BROWSER_POOL_SIZE', 3);
  }

  get browserIdleTimeoutMs(): number {
    return this.configService.get<number>('BROWSER_IDLE_TIMEOUT_MS', 60000);
  }

  // Rate Limiting 설정
  get rateLimitTtl(): number {
    return this.configService.get<number>('RATE_LIMIT_TTL', 60);
  }

  get rateLimitMax(): number {
    return this.configService.get<number>('RATE_LIMIT_MAX', 100);
  }

  /**
   * 네이버 API 키 검증
   * @returns API 키가 설정되어 있는지 여부
   */
  validateNaverApiKeys(): boolean {
    const clientId = this.naverClientId;
    const clientSecret = this.naverClientSecret;
    
    if (!clientId || !clientSecret) {
      throw new Error('네이버 API 키가 설정되지 않았습니다. NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 확인해주세요.');
    }
    
    return true;
  }

  /**
   * 데이터베이스 설정 검증
   * @returns 데이터베이스 설정이 올바른지 여부
   */
  validateDatabaseConfig(): boolean {
    const requiredFields = [
      { key: 'DB_HOST', value: this.dbHost },
      { key: 'DB_PORT', value: this.dbPort },
      { key: 'DB_USERNAME', value: this.dbUsername },
      { key: 'DB_PASSWORD', value: this.dbPassword },
      { key: 'DB_DATABASE', value: this.dbDatabase },
    ];

    const missingFields = requiredFields
      .filter(field => !field.value)
      .map(field => field.key);

    if (missingFields.length > 0) {
      throw new Error(`데이터베이스 설정이 누락되었습니다: ${missingFields.join(', ')}`);
    }

    return true;
  }

  /**
   * 전체 설정 검증
   * 애플리케이션 시작 시 호출되어야 합니다.
   */
  validateAllConfigs(): void {
    try {
      this.validateDatabaseConfig();
      this.validateNaverApiKeys();
      
      console.log('✅ 모든 환경변수 검증이 완료되었습니다.');
      console.log(`🚀 서버가 포트 ${this.port}에서 ${this.nodeEnv} 모드로 시작됩니다.`);
    } catch (error) {
      console.error('❌ 환경변수 검증 실패:', error.message);
      throw error;
    }
  }

  /**
   * 설정 요약 정보 반환
   * 디버깅 및 로깅 목적으로 사용
   */
  getConfigSummary(): Record<string, any> {
    return {
      server: {
        port: this.port,
        nodeEnv: this.nodeEnv,
      },
      database: {
        host: this.dbHost,
        port: this.dbPort,
        database: this.dbDatabase,
        // 보안상 username, password는 제외
      },
      api: {
        timeoutMs: this.apiTimeoutMs,
        extendedTimeoutMs: this.apiExtendedTimeoutMs,
        retryCount: this.apiRetryCount,
        retryDelayMs: this.apiRetryDelayMs,
      },
      scraping: {
        maxResults: this.scrapingMaxResults,
        maxKeywordsPerType: this.scrapingMaxKeywordsPerType,
        pageTimeoutMs: this.scrapingPageTimeoutMs,
        delayMs: this.scrapingDelayMs,
      },
      dateRange: {
        defaultStartDate: this.defaultStartDate,
        defaultEndDate: this.defaultEndDate,
      },
      browser: {
        poolSize: this.browserPoolSize,
        idleTimeoutMs: this.browserIdleTimeoutMs,
      },
      rateLimit: {
        ttl: this.rateLimitTtl,
        max: this.rateLimitMax,
      },
    };
  }
}
