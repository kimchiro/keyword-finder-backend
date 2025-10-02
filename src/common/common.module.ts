import { Global, Module } from '@nestjs/common';
import { BrowserPoolService } from './services/browser-pool.service';
import { TransactionService } from './services/transaction.service';
import { ApiRetryService } from './services/api-retry.service';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Global()
@Module({
  providers: [
    BrowserPoolService, 
    TransactionService, 
    ApiRetryService,
    RateLimitGuard,
  ],
  exports: [
    BrowserPoolService, 
    TransactionService, 
    ApiRetryService,
    RateLimitGuard,
  ],
})
export class CommonModule {}
