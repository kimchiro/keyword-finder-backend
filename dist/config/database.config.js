"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const keyword_entity_1 = require("../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../database/entities/keyword-analytics.entity");
const related_keywords_entity_1 = require("../database/entities/related-keywords.entity");
const search_trends_entity_1 = require("../database/entities/search-trends.entity");
const monthly_search_ratios_entity_1 = require("../database/entities/monthly-search-ratios.entity");
const keyword_collection_logs_entity_1 = require("../database/entities/keyword-collection-logs.entity");
let DatabaseConfig = class DatabaseConfig {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        return {
            type: 'mysql',
            host: this.configService.get('MYSQL_HOST', 'localhost'),
            port: this.configService.get('MYSQL_PORT', 3306),
            username: this.configService.get('MYSQL_USER', 'root'),
            password: this.configService.get('MYSQL_PASSWORD'),
            database: this.configService.get('MYSQL_DATABASE', 'keyword_finder'),
            charset: 'utf8mb4',
            entities: [
                keyword_entity_1.Keyword,
                keyword_analytics_entity_1.KeywordAnalytics,
                related_keywords_entity_1.RelatedKeywords,
                search_trends_entity_1.SearchTrends,
                monthly_search_ratios_entity_1.MonthlySearchRatios,
                keyword_collection_logs_entity_1.KeywordCollectionLogs,
            ],
            migrations: ['dist/database/migrations/*.js'],
            migrationsRun: false,
            synchronize: false,
            logging: this.configService.get('NODE_ENV') === 'development',
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfig);
//# sourceMappingURL=database.config.js.map