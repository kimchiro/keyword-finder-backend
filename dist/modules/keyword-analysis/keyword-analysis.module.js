"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const keyword_analysis_controller_1 = require("./keyword-analysis.controller");
const keyword_analysis_service_1 = require("./keyword-analysis.service");
const transaction_service_1 = require("../../common/services/transaction.service");
const app_config_1 = require("../../config/app.config");
const keyword_entity_1 = require("../../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../../database/entities/keyword-analytics.entity");
const related_keywords_entity_1 = require("../../database/entities/related-keywords.entity");
const search_trends_entity_1 = require("../../database/entities/search-trends.entity");
const monthly_search_ratios_entity_1 = require("../../database/entities/monthly-search-ratios.entity");
const keyword_collection_logs_entity_1 = require("../../database/entities/keyword-collection-logs.entity");
const services_1 = require("./domain/services");
let KeywordAnalysisModule = class KeywordAnalysisModule {
};
exports.KeywordAnalysisModule = KeywordAnalysisModule;
exports.KeywordAnalysisModule = KeywordAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                keyword_entity_1.Keyword,
                keyword_analytics_entity_1.KeywordAnalytics,
                related_keywords_entity_1.RelatedKeywords,
                search_trends_entity_1.SearchTrends,
                monthly_search_ratios_entity_1.MonthlySearchRatios,
                keyword_collection_logs_entity_1.KeywordCollectionLogs,
            ]),
        ],
        controllers: [keyword_analysis_controller_1.KeywordAnalysisController],
        providers: [
            keyword_analysis_service_1.KeywordAnalysisService,
            services_1.KeywordAnalysisDomainService,
            services_1.KeywordDataService,
            services_1.ChartDataService,
            transaction_service_1.TransactionService,
            app_config_1.AppConfigService,
        ],
        exports: [keyword_analysis_service_1.KeywordAnalysisService],
    })
], KeywordAnalysisModule);
//# sourceMappingURL=keyword-analysis.module.js.map