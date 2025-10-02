import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaverApiController } from './naver-api.controller';
import { NaverApiService } from './naver-api.service';
import { CommonModule } from '../../common/common.module';
import { AppConfigService } from '../../config/app.config';
import { KeywordDataService } from '../keyword-analysis/domain/services/keyword-data.service';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../../database/entities/related-keywords.entity';
import { KeywordCollectionLogs } from '../../database/entities/keyword-collection-logs.entity';
import { TransactionService } from '../../common/services/transaction.service';

@Module({
  imports: [
    ConfigModule, 
    CommonModule,
    TypeOrmModule.forFeature([
      Keyword,
      KeywordAnalytics,
      RelatedKeywords,
      KeywordCollectionLogs,
    ]),
  ],
  controllers: [NaverApiController],
  providers: [
    NaverApiService, 
    AppConfigService, 
    KeywordDataService,
    TransactionService,
  ],
  exports: [NaverApiService],
})
export class NaverApiModule {}
