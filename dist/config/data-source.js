"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const keyword_entity_1 = require("../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../database/entities/keyword-analytics.entity");
const related_keywords_entity_1 = require("../database/entities/related-keywords.entity");
const search_trends_entity_1 = require("../database/entities/search-trends.entity");
const monthly_search_ratios_entity_1 = require("../database/entities/monthly-search-ratios.entity");
const keyword_collection_logs_entity_1 = require("../database/entities/keyword-collection-logs.entity");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'keyword_finder',
    entities: [
        keyword_entity_1.Keyword,
        keyword_analytics_entity_1.KeywordAnalytics,
        related_keywords_entity_1.RelatedKeywords,
        search_trends_entity_1.SearchTrends,
        monthly_search_ratios_entity_1.MonthlySearchRatios,
        keyword_collection_logs_entity_1.KeywordCollectionLogs,
    ],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=data-source.js.map