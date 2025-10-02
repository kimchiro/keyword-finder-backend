import { KeywordAnalysisService } from './keyword-analysis.service.simple';
export declare class KeywordAnalysisController {
    private readonly keywordAnalysisService;
    constructor(keywordAnalysisService: KeywordAnalysisService);
    getServiceStatus(): Promise<{
        success: boolean;
        message: string;
        data: {
            status: string;
            keywordCount: number;
            analyticsCount: number;
            timestamp: string;
        };
    }>;
    getKeywords(limit?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            data: import("../../database/entities/keyword.entity").Keyword[];
            count: number;
            timestamp: string;
        };
    }>;
    addKeyword(keyword: string): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            message: string;
            data: import("../../database/entities/keyword.entity").Keyword;
        };
    }>;
}
