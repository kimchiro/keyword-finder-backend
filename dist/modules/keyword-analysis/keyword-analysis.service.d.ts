import { KeywordAnalysisDomainService } from './domain';
export declare class KeywordAnalysisService {
    private keywordAnalysisDomainService;
    constructor(keywordAnalysisDomainService: KeywordAnalysisDomainService);
    analyzeKeyword(keyword: string, analysisDate?: string, naverApiData?: any, relatedKeywordsData?: any[]): Promise<{
        analytics: import("../../database/entities/keyword-analytics.entity").KeywordAnalytics;
        relatedKeywords: import("../../database/entities/related-keywords.entity").RelatedKeywords[];
        chartData: {
            searchTrends: import("../../database/entities/search-trends.entity").SearchTrends[];
            monthlyRatios: import("../../database/entities/monthly-search-ratios.entity").MonthlySearchRatios[];
        };
    }>;
    getKeywordAnalysis(keyword: string): Promise<{
        success: boolean;
        data: {
            analytics: import("../../database/entities/keyword-analytics.entity").KeywordAnalytics;
            relatedKeywords: import("../../database/entities/related-keywords.entity").RelatedKeywords[];
            chartData: {
                searchTrends: import("../../database/entities/search-trends.entity").SearchTrends[];
                monthlyRatios: import("../../database/entities/monthly-search-ratios.entity").MonthlySearchRatios[];
            };
        };
    }>;
    getAnalyzedKeywords(): Promise<any[]>;
    saveScrapingData(query: string, scrapingData: any): Promise<any>;
    getScrapedKeywords(query: string): Promise<any[]>;
}
