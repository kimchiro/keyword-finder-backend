import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordAnalysisController } from './keyword-analysis.controller.simple';
import { KeywordAnalysisService } from './keyword-analysis.service.simple';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Keyword,
      KeywordAnalytics,
    ]),
  ],
  controllers: [KeywordAnalysisController],
  providers: [KeywordAnalysisService],
  exports: [KeywordAnalysisService],
})
export class KeywordAnalysisModule {}
