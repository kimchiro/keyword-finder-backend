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
const keyword_analysis_controller_simple_1 = require("./keyword-analysis.controller.simple");
const keyword_analysis_service_simple_1 = require("./keyword-analysis.service.simple");
const keyword_entity_1 = require("../../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../../database/entities/keyword-analytics.entity");
let KeywordAnalysisModule = class KeywordAnalysisModule {
};
exports.KeywordAnalysisModule = KeywordAnalysisModule;
exports.KeywordAnalysisModule = KeywordAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                keyword_entity_1.Keyword,
                keyword_analytics_entity_1.KeywordAnalytics,
            ]),
        ],
        controllers: [keyword_analysis_controller_simple_1.KeywordAnalysisController],
        providers: [keyword_analysis_service_simple_1.KeywordAnalysisService],
        exports: [keyword_analysis_service_simple_1.KeywordAnalysisService],
    })
], KeywordAnalysisModule);
//# sourceMappingURL=keyword-analysis.module.simple.js.map