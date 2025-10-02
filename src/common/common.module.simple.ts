import { Global, Module } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { ApiRetryService } from './services/api-retry.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
// BrowserPoolService는 Vercel 서버리스 환경에서 문제가 될 수 있으므로 임시 제외

@Global()
@Module({
  providers: [
    // BrowserPoolService,  // Playwright 의존성으로 인해 임시 비활성화
    TransactionService, 
    ApiRetryService,
    RateLimitGuard,
  ],
  exports: [
    // BrowserPoolService,  // Playwright 의존성으로 인해 임시 비활성화
    TransactionService, 
    ApiRetryService,
    RateLimitGuard,
  ],
})
export class CommonModule {}
