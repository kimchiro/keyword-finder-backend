import { KeywordAnalysisDomainService } from './domain';
export declare class KeywordAnalysisService {
    private keywordAnalysisDomainService;
    constructor(keywordAnalysisDomainService: KeywordAnalysisDomainService);
    analyzeKeyword(keyword: string, analysisDate?: string, naverApiData?: any, relatedKeywordsData?: any[]): Promise<{
        analytics: any;
        relatedKeywords: any[];
        chartData: {
            searchTrends: any[];
            monthlyRatios: any[];
        };
    }>;
    getKeywordAnalysis(keyword: string): Promise<{
        success: boolean;
        data: {
            analytics: any;
            relatedKeywords: any[];
            chartData: {
                searchTrends: any[];
                monthlyRatios: any[];
            };
        };
    }>;
    getAnalyzedKeywords(): Promise<any[]>;
    saveScrapingData(query: string, scrapingData: any): Promise<any>;
    getScrapedKeywords(query: string): Promise<any[]>;
}
