import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Keyword } from '../database/entities/keyword.entity';
import { KeywordAnalytics } from '../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../database/entities/related-keywords.entity';
import { SearchTrends } from '../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../database/entities/monthly-search-ratios.entity';
import { KeywordCollectionLogs } from '../database/entities/keyword-collection-logs.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'keyword_finder',
  entities: [
    Keyword,
    KeywordAnalytics,
    RelatedKeywords,
    SearchTrends,
    MonthlySearchRatios,
    KeywordCollectionLogs,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
