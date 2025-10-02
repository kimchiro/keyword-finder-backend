import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordCollectionLogs } from '../../database/entities/keyword-collection-logs.entity';
import { AppConfigService } from '../../config/app.config';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Keyword, KeywordCollectionLogs]),
    CommonModule,
  ],
  controllers: [ScrapingController],
  providers: [ScrapingService, AppConfigService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
