import { KeywordDataService } from './keyword-data.service';
import { ChartDataService } from './chart-data.service';
import { KeywordAnalysisAggregate } from '../aggregates/keyword-analysis.aggregate';
export declare class KeywordAnalysisDomainService {
    private keywordDataService;
    private chartDataService;
    constructor(keywordDataService: KeywordDataService, chartDataService: ChartDataService);
    analyzeKeyword(keywordValue: string, analysisDateValue?: string, naverApiData?: any, relatedKeywordsData?: any[]): Promise<KeywordAnalysisAggregate>;
    getKeywordAnalysis(keywordValue: string): Promise<{
        success: boolean;
        data: KeywordAnalysisAggregate | null;
    }>;
    getAnalyzedKeywords(): Promise<any[]>;
    saveScrapingData(query: string, scrapingData: any): Promise<any>;
    getScrapedKeywords(query: string): Promise<any[]>;
    private getExistingAnalysis;
    private categorizeKeywords;
    private removeDuplicateKeywords;
}
