import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordAnalysisController } from './keyword-analysis.controller';
import { KeywordAnalysisService } from './keyword-analysis.service';
import { TransactionService } from '../../common/services/transaction.service';
import { AppConfigService } from '../../config/app.config';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../../database/entities/related-keywords.entity';
import { SearchTrends } from '../../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../../database/entities/monthly-search-ratios.entity';
import { KeywordCollectionLogs } from '../../database/entities/keyword-collection-logs.entity';
import { 
  KeywordAnalysisDomainService, 
  KeywordDataService, 
  ChartDataService 
} from './domain/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Keyword,
      KeywordAnalytics,
      RelatedKeywords,
      SearchTrends,
      MonthlySearchRatios,
      KeywordCollectionLogs,
    ]),
  ],
  controllers: [KeywordAnalysisController],
  providers: [
    KeywordAnalysisService,
    KeywordAnalysisDomainService,
    KeywordDataService,
    ChartDataService,
    TransactionService,
    AppConfigService,
  ],
  exports: [KeywordAnalysisService],
})
export class KeywordAnalysisModule {}
