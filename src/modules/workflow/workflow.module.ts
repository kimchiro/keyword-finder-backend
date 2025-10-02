import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { NaverApiModule } from '../naver-api/naver-api.module';
import { ScrapingModule } from '../scraping/scraping.module';
import { KeywordAnalysisModule } from '../keyword-analysis/keyword-analysis.module';
import { AppConfigService } from '../../config/app.config';

@Module({
  imports: [
    NaverApiModule,
    ScrapingModule,
    KeywordAnalysisModule,
  ],
  controllers: [WorkflowController],
  providers: [WorkflowService, AppConfigService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
