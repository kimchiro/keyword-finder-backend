import { Global, Module } from '@nestjs/common';
import { ApiRetryService } from './services/api-retry.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
// 데이터베이스 의존성이 있는 서비스들은 제외

@Global()
@Module({
  providers: [
    ApiRetryService,
    RateLimitGuard,
  ],
  exports: [
    ApiRetryService,
    RateLimitGuard,
  ],
})
export class CommonModule {}
