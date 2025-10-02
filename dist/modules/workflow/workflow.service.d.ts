import { NaverApiService } from '../naver-api/naver-api.service';
import { ScrapingService } from '../scraping/scraping.service';
import { KeywordAnalysisService } from '../keyword-analysis/keyword-analysis.service';
import { AppConfigService } from '../../config/app.config';
export interface WorkflowResult {
    success: boolean;
    data: {
        query: string;
        scrapingData: any;
        naverApiData: any;
        contentCountsData: any;
        analysisData: any;
        chartData: {
            searchTrends: any[];
            monthlyRatios: any[];
        };
        topKeywords: string[];
        keywordsWithRank: Array<{
            keyword: string;
            originalRank: number;
            category: string;
            source: string;
        }>;
        executionTime: number;
        timestamp: string;
    };
    message: string;
}
export declare class WorkflowService {
    private readonly naverApiService;
    private readonly scrapingService;
    private readonly keywordAnalysisService;
    private readonly appConfig;
    constructor(naverApiService: NaverApiService, scrapingService: ScrapingService, keywordAnalysisService: KeywordAnalysisService, appConfig: AppConfigService);
    executeCompleteWorkflow(query: string): Promise<WorkflowResult>;
    checkWorkflowHealth(): Promise<{
        success: boolean;
        services: {
            naverApi: boolean;
            scraping: boolean;
            keywordAnalysis: boolean;
        };
        message: string;
    }>;
}
