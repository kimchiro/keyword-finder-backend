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
      type: 'mysql',
      host: this.configService.get('MYSQL_HOST', 'localhost'),
      port: this.configService.get('MYSQL_PORT', 3306),
      username: this.configService.get('MYSQL_USER', 'root'),
      password: this.configService.get('MYSQL_PASSWORD'),
      database: this.configService.get('MYSQL_DATABASE', 'keyword_finder'),
      charset: 'utf8mb4',
      entities: [
        Keyword,
        KeywordAnalytics,
        RelatedKeywords,
        SearchTrends,
        MonthlySearchRatios,
        KeywordCollectionLogs,
      ],
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: false,
      synchronize: false,
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}
