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
exports.KeywordAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("./domain");
let KeywordAnalysisService = class KeywordAnalysisService {
    constructor(keywordAnalysisDomainService) {
        this.keywordAnalysisDomainService = keywordAnalysisDomainService;
    }
    async analyzeKeyword(keyword, analysisDate, naverApiData, relatedKeywordsData) {
        try {
            const aggregate = await this.keywordAnalysisDomainService.analyzeKeyword(keyword, analysisDate, naverApiData, relatedKeywordsData);
            return aggregate.toDto();
        }
        catch (error) {
            console.error('❌ KeywordAnalysisService.analyzeKeyword 오류:', error);
            throw error;
        }
    }
    async getKeywordAnalysis(keyword) {
        try {
            const result = await this.keywordAnalysisDomainService.getKeywordAnalysis(keyword);
            if (!result.success || !result.data) {
                return {
                    success: false,
                    data: { analytics: null, relatedKeywords: [], chartData: null },
                };
            }
            return {
                success: true,
                data: result.data.toDto(),
            };
        }
        catch (error) {
            console.error('❌ KeywordAnalysisService.getKeywordAnalysis 오류:', error);
            throw error;
        }
    }
    async getAnalyzedKeywords() {
        try {
            return await this.keywordAnalysisDomainService.getAnalyzedKeywords();
        }
        catch (error) {
            console.error('❌ KeywordAnalysisService.getAnalyzedKeywords 오류:', error);
            throw error;
        }
    }
    async saveScrapingData(query, scrapingData) {
        try {
            return await this.keywordAnalysisDomainService.saveScrapingData(query, scrapingData);
        }
        catch (error) {
            console.error('❌ KeywordAnalysisService.saveScrapingData 오류:', error);
            throw error;
        }
    }
    async getScrapedKeywords(query) {
        try {
            return await this.keywordAnalysisDomainService.getScrapedKeywords(query);
        }
        catch (error) {
            console.error('❌ KeywordAnalysisService.getScrapedKeywords 오류:', error);
            throw error;
        }
    }
};
exports.KeywordAnalysisService = KeywordAnalysisService;
exports.KeywordAnalysisService = KeywordAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_1.KeywordAnalysisDomainService])
], KeywordAnalysisService);
//# sourceMappingURL=keyword-analysis.service.js.map