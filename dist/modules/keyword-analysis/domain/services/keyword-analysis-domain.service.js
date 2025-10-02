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
exports.KeywordAnalysisDomainService = void 0;
const common_1 = require("@nestjs/common");
const value_objects_1 = require("../value-objects");
const keyword_data_service_1 = require("./keyword-data.service");
const chart_data_service_1 = require("./chart-data.service");
const keyword_analysis_aggregate_1 = require("../aggregates/keyword-analysis.aggregate");
let KeywordAnalysisDomainService = class KeywordAnalysisDomainService {
    constructor(keywordDataService, chartDataService) {
        this.keywordDataService = keywordDataService;
        this.chartDataService = chartDataService;
    }
    async analyzeKeyword(keywordValue, analysisDateValue, naverApiData, relatedKeywordsData) {
        console.log(`📊 키워드 분석 시작: ${keywordValue}`);
        const keyword = new value_objects_1.Keyword(keywordValue);
        const analysisDate = new value_objects_1.AnalysisDate(analysisDateValue);
        const existingAnalytics = await this.keywordDataService.findKeywordAnalyticsByDate(keyword, analysisDate);
        if (existingAnalytics) {
            console.log(`⚠️ 키워드 '${keywordValue}'에 대한 분석 데이터가 이미 존재합니다. 기존 데이터를 반환합니다.`);
            return await this.getExistingAnalysis(keyword, analysisDate);
        }
        const analytics = await this.keywordDataService.saveKeywordAnalytics(keyword, analysisDate, naverApiData);
        const relatedKeywords = await this.keywordDataService.saveRelatedKeywords(keyword, analysisDate, relatedKeywordsData || []);
        const chartData = await this.chartDataService.saveChartData(keyword, analysisDate, naverApiData);
        console.log(`✅ 키워드 분석 완료: ${keywordValue}`);
        return new keyword_analysis_aggregate_1.KeywordAnalysisAggregate(keyword, analysisDate, analytics, relatedKeywords, chartData);
    }
    async getKeywordAnalysis(keywordValue) {
        console.log(`📊 키워드 분석 데이터 조회: ${keywordValue}`);
        try {
            const keyword = new value_objects_1.Keyword(keywordValue);
            const analytics = await this.keywordDataService.findKeywordAnalytics(keyword);
            if (!analytics) {
                return {
                    success: false,
                    data: null,
                };
            }
            const analysisDate = new value_objects_1.AnalysisDate(analytics.analysisDate);
            const aggregate = await this.getExistingAnalysis(keyword, analysisDate);
            return {
                success: true,
                data: aggregate,
            };
        }
        catch (error) {
            console.error('❌ KeywordAnalysisDomainService.getKeywordAnalysis 오류:', error);
            throw error;
        }
    }
    async getAnalyzedKeywords() {
        try {
            return await this.keywordDataService.findAnalyzedKeywords();
        }
        catch (error) {
            console.error('❌ KeywordAnalysisDomainService.getAnalyzedKeywords 오류:', error);
            throw error;
        }
    }
    async saveScrapingData(query, scrapingData) {
        try {
            console.log(`💾 스크래핑 데이터 저장 시작: ${query}`);
            const keyword = new value_objects_1.Keyword(query);
            const analysisDate = new value_objects_1.AnalysisDate();
            await this.keywordDataService.saveScrapedKeywords(keyword, analysisDate, scrapingData);
            const allSavedKeywords = await this.keywordDataService.findScrapedKeywords(keyword);
            const uniqueKeywords = this.removeDuplicateKeywords(allSavedKeywords);
            const categories = this.categorizeKeywords(uniqueKeywords);
            const topKeywords = uniqueKeywords
                .sort((a, b) => a.rankPosition - b.rankPosition)
                .slice(0, 10)
                .map(k => k.keyword);
            const keywordsWithRank = uniqueKeywords
                .sort((a, b) => a.rankPosition - b.rankPosition)
                .map(k => ({
                keyword: k.keyword,
                originalRank: k.rankPosition,
                category: k.category,
                source: 'naver_scraping'
            }));
            const result = {
                query,
                keywords: uniqueKeywords,
                totalCount: uniqueKeywords.length,
                categories,
                topKeywords,
                keywordsWithRank,
                scrapingTime: scrapingData.executionTime || 0,
                timestamp: new Date().toISOString()
            };
            console.log(`✅ 스크래핑 데이터 저장 완료: ${query} (${uniqueKeywords.length}개 고유 키워드, 전체 ${allSavedKeywords.length}개에서 중복 제거)`);
            return result;
        }
        catch (error) {
            console.error('❌ KeywordAnalysisDomainService.saveScrapingData 오류:', error);
            throw error;
        }
    }
    async getScrapedKeywords(query) {
        try {
            console.log(`🔍 스크래핑 키워드 조회: ${query}`);
            const keyword = new value_objects_1.Keyword(query);
            const result = await this.keywordDataService.findScrapedKeywords(keyword);
            console.log(`✅ 스크래핑 키워드 조회 완료: ${result.length}개`);
            return result;
        }
        catch (error) {
            console.error('❌ KeywordAnalysisDomainService.getScrapedKeywords 오류:', error);
            throw error;
        }
    }
    async getExistingAnalysis(keyword, analysisDate) {
        const [analytics, relatedKeywords, chartData] = await Promise.all([
            this.keywordDataService.findKeywordAnalyticsByDate(keyword, analysisDate),
            this.keywordDataService.findRelatedKeywords(keyword, analysisDate),
            this.chartDataService.getChartData(keyword, analysisDate),
        ]);
        if (!analytics) {
            throw new Error(`키워드 '${keyword.value}'의 분석 데이터를 찾을 수 없습니다.`);
        }
        return new keyword_analysis_aggregate_1.KeywordAnalysisAggregate(keyword, analysisDate, analytics, relatedKeywords, chartData);
    }
    categorizeKeywords(keywords) {
        return keywords.reduce((acc, keyword) => {
            const category = keyword.category || 'unknown';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    }
    removeDuplicateKeywords(keywords) {
        const keywordMap = new Map();
        const sortedKeywords = keywords.sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
        for (const keyword of sortedKeywords) {
            const key = `${keyword.keyword}-${keyword.category}`;
            if (!keywordMap.has(key)) {
                keywordMap.set(key, keyword);
            }
        }
        return Array.from(keywordMap.values()).sort((a, b) => {
            if (a.category !== b.category) {
                if (a.category === 'smartblock')
                    return -1;
                if (b.category === 'smartblock')
                    return 1;
                return a.category.localeCompare(b.category);
            }
            return a.rankPosition - b.rankPosition;
        });
    }
};
exports.KeywordAnalysisDomainService = KeywordAnalysisDomainService;
exports.KeywordAnalysisDomainService = KeywordAnalysisDomainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [keyword_data_service_1.KeywordDataService,
        chart_data_service_1.ChartDataService])
], KeywordAnalysisDomainService);
//# sourceMappingURL=keyword-analysis-domain.service.js.map