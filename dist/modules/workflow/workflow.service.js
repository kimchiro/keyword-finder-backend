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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const naver_api_service_1 = require("../naver-api/naver-api.service");
const scraping_service_1 = require("../scraping/scraping.service");
const keyword_analysis_service_1 = require("../keyword-analysis/keyword-analysis.service");
const app_config_1 = require("../../config/app.config");
let WorkflowService = class WorkflowService {
    constructor(naverApiService, scrapingService, keywordAnalysisService, appConfig) {
        this.naverApiService = naverApiService;
        this.scrapingService = scrapingService;
        this.keywordAnalysisService = keywordAnalysisService;
        this.appConfig = appConfig;
    }
    async executeCompleteWorkflow(query) {
        const startTime = Date.now();
        console.log(`🚀 워크플로우 시작: ${query}`);
        try {
            console.log(`🕷️ Step 1: 스크래핑 실행 (개수 제한 없음)`);
            const scrapingResult = await this.scrapingService.scrapeKeywords({
                query,
                types: ['smartblock', 'related_search'],
                maxResults: 999,
            });
            if (!scrapingResult || !scrapingResult.keywords) {
                throw new Error('스크래핑 데이터를 가져올 수 없습니다.');
            }
            console.log(`✅ 스크래핑 완료: ${scrapingResult.keywords.length}개 키워드`);
            console.log(`💾 Step 2: 스크래핑 데이터 DB 저장`);
            const savedScrapingData = await this.keywordAnalysisService.saveScrapingData(query, scrapingResult);
            console.log(`📊 Step 3: 네이버 API 호출 - "${query}" (블로그 + 데이터랩)`);
            const naverApiResult = await this.naverApiService.getSingleKeywordFullData({ keyword: query });
            console.log(`✅ 네이버 API 호출 완료`);
            console.log(`📊 Step 4: 콘텐츠 발행량 조회 및 저장 - "${query}"`);
            let contentCountsData = null;
            try {
                const contentCountsResult = await this.naverApiService.getContentCountsAndSave(query);
                contentCountsData = contentCountsResult.data;
                console.log(`✅ 콘텐츠 발행량 조회 및 저장 완료:`, contentCountsData);
            }
            catch (error) {
                console.error(`❌ 콘텐츠 발행량 조회 실패 (계속 진행):`, error);
                console.error(`❌ 오류 스택:`, error.stack);
            }
            console.log(`📊 Step 5: 키워드 분석 데이터 저장`);
            let analysisData = null;
            try {
                console.log(`🔍 analyzeKeyword 호출 시작: query=${query}, naverApiData=${!!naverApiResult.data}`);
                const analysisResult = await this.keywordAnalysisService.analyzeKeyword(query, undefined, naverApiResult.data);
                analysisData = analysisResult;
                console.log(`✅ 키워드 분석 데이터 저장 완료:`, analysisResult);
            }
            catch (error) {
                console.error(`❌ 키워드 분석 데이터 저장 실패:`, error);
                console.error(`❌ 오류 스택:`, error.stack);
            }
            const executionTime = (Date.now() - startTime) / 1000;
            console.log(`🎉 워크플로우 완료: ${query} (${executionTime}초)`);
            console.log(`🔍 최종 contentCountsData:`, contentCountsData);
            console.log(`🔍 analysisData 상태:`, analysisData ? '존재' : 'null');
            console.log(`🔍 analysisData.data:`, analysisData?.data);
            console.log(`🔍 analysisData.data.chartData:`, analysisData?.data?.chartData);
            const chartData = {
                searchTrends: analysisData?.data?.chartData?.searchTrends || [],
                monthlyRatios: analysisData?.data?.chartData?.monthlyRatios || [],
            };
            console.log(`🔍 최종 chartData:`, chartData);
            const result = {
                success: true,
                data: {
                    query,
                    scrapingData: savedScrapingData,
                    naverApiData: naverApiResult.data,
                    contentCountsData: contentCountsData,
                    analysisData: analysisData,
                    chartData: chartData,
                    topKeywords: savedScrapingData?.topKeywords || [],
                    keywordsWithRank: savedScrapingData?.keywordsWithRank || [],
                    executionTime,
                    timestamp: new Date().toISOString(),
                },
                message: `키워드 "${query}" 분석이 완료되었습니다.`,
            };
            console.log(`📤 워크플로우 응답 데이터 키들:`, Object.keys(result.data));
            return result;
        }
        catch (error) {
            const executionTime = (Date.now() - startTime) / 1000;
            console.error('❌ 워크플로우 실행 실패:', error);
            return {
                success: false,
                data: {
                    query,
                    scrapingData: null,
                    naverApiData: null,
                    contentCountsData: null,
                    analysisData: null,
                    chartData: {
                        searchTrends: [],
                        monthlyRatios: [],
                    },
                    topKeywords: [],
                    keywordsWithRank: [],
                    executionTime,
                    timestamp: new Date().toISOString(),
                },
                message: `키워드 "${query}" 분석 중 오류가 발생했습니다: ${error.message}`,
            };
        }
    }
    async checkWorkflowHealth() {
        console.log('🔍 워크플로우 상태 체크 시작');
        const healthChecks = await Promise.allSettled([
            this.naverApiService.getSingleKeywordFullData({ keyword: '테스트' }).catch(() => false),
            this.scrapingService.getScrapingStats().catch(() => false),
            this.keywordAnalysisService.getKeywordAnalysis('테스트').catch(() => false),
        ]);
        const serviceStatus = {
            naverApi: healthChecks[0].status === 'fulfilled' && healthChecks[0].value !== false,
            scraping: healthChecks[1].status === 'fulfilled' && healthChecks[1].value !== false,
            keywordAnalysis: healthChecks[2].status === 'fulfilled' && healthChecks[2].value !== false,
        };
        const allHealthy = Object.values(serviceStatus).every(status => status);
        console.log('✅ 워크플로우 상태 체크 완료:', serviceStatus);
        return {
            success: allHealthy,
            services: serviceStatus,
            message: allHealthy
                ? '모든 서비스가 정상 작동 중입니다.'
                : '일부 서비스에 문제가 있습니다.',
        };
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [naver_api_service_1.NaverApiService,
        scraping_service_1.ScrapingService,
        keyword_analysis_service_1.KeywordAnalysisService,
        app_config_1.AppConfigService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map