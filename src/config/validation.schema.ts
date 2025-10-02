import { IsString, IsNumber, IsOptional, Min, Max, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 환경변수 검증 스키마
 * 애플리케이션 시작 시 필수 환경변수들을 검증합니다.
 */
export class EnvironmentVariables {
  // 서버 설정
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT?: number = 3000;

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  // 데이터베이스 설정
  @IsString()
  DB_HOST: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  // 네이버 API 설정
  @IsString()
  NAVER_CLIENT_ID: string;

  @IsString()
  NAVER_CLIENT_SECRET: string;

  @IsOptional()
  @IsUrl()
  NAVER_API_BASE_URL?: string = 'https://openapi.naver.com';

  // API 제한 설정
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(60000)
  API_TIMEOUT_MS?: number = 10000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(60000)
  API_EXTENDED_TIMEOUT_MS?: number = 15000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(10)
  API_RETRY_COUNT?: number = 3;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(100)
  @Max(10000)
  API_RETRY_DELAY_MS?: number = 1000;

  // 스크래핑 설정
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  SCRAPING_MAX_RESULTS?: number = 50;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  SCRAPING_MAX_KEYWORDS_PER_TYPE?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1000)
  @Max(60000)
  SCRAPING_PAGE_TIMEOUT_MS?: number = 30000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(100)
  @Max(5000)
  SCRAPING_DELAY_MS?: number = 1000;

  // 날짜 범위 설정
  @IsOptional()
  @IsString()
  DEFAULT_START_DATE?: string = '2024-01-01';

  @IsOptional()
  @IsString()
  DEFAULT_END_DATE?: string = '2024-12-31';

  // 브라우저 풀 설정
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(10)
  BROWSER_POOL_SIZE?: number = 3;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(10000)
  @Max(300000)
  BROWSER_IDLE_TIMEOUT_MS?: number = 60000;

  // Rate Limiting 설정
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1000)
  RATE_LIMIT_TTL?: number = 60;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(1000)
  RATE_LIMIT_MAX?: number = 100;
}

/**
 * 환경변수 검증 함수
 * @param config 환경변수 객체
 * @returns 검증된 환경변수 객체
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const { validateSync } = require('class-validator');
  const { plainToClass } = require('class-transformer');
  
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    }).join('\n');
    
    throw new Error(`환경변수 검증 실패:\n${errorMessages}`);
  }
  
  return validatedConfig;
}
