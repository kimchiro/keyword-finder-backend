"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverApiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const naver_api_controller_1 = require("./naver-api.controller");
const naver_api_service_1 = require("./naver-api.service");
const common_module_1 = require("../../common/common.module");
const app_config_1 = require("../../config/app.config");
const keyword_data_service_1 = require("../keyword-analysis/domain/services/keyword-data.service");
const keyword_entity_1 = require("../../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../../database/entities/keyword-analytics.entity");
const related_keywords_entity_1 = require("../../database/entities/related-keywords.entity");
const keyword_collection_logs_entity_1 = require("../../database/entities/keyword-collection-logs.entity");
const transaction_service_1 = require("../../common/services/transaction.service");
let NaverApiModule = class NaverApiModule {
};
exports.NaverApiModule = NaverApiModule;
exports.NaverApiModule = NaverApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            common_module_1.CommonModule,
            typeorm_1.TypeOrmModule.forFeature([
                keyword_entity_1.Keyword,
                keyword_analytics_entity_1.KeywordAnalytics,
                related_keywords_entity_1.RelatedKeywords,
                keyword_collection_logs_entity_1.KeywordCollectionLogs,
            ]),
        ],
        controllers: [naver_api_controller_1.NaverApiController],
        providers: [
            naver_api_service_1.NaverApiService,
            app_config_1.AppConfigService,
            keyword_data_service_1.KeywordDataService,
            transaction_service_1.TransactionService,
        ],
        exports: [naver_api_service_1.NaverApiService],
    })
], NaverApiModule);
//# sourceMappingURL=naver-api.module.js.map