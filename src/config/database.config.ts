import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Keyword } from '../database/entities/keyword.entity';
import { KeywordAnalytics } from '../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../database/entities/related-keywords.entity';
import { SearchTrends } from '../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../database/entities/monthly-search-ratios.entity';
import { KeywordCollectionLogs } from '../database/entities/keyword-collection-logs.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE', 'keyword_finder'),
      entities: [
        Keyword,
        KeywordAnalytics,
        RelatedKeywords,
        SearchTrends,
        MonthlySearchRatios,
        KeywordCollectionLogs,
      ],
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: true,
      synchronize: false,
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}
