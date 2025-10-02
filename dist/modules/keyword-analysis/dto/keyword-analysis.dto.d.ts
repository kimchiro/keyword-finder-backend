export declare class AnalyzeKeywordDto {
    keyword: string;
    analysisDate?: string;
}
export declare class KeywordAnalysisResponseDto {
    success: boolean;
    message: string;
    data: {
        analytics: any;
        relatedKeywords: any[];
        chartData: {
            searchTrends: any[];
            monthlyRatios: any[];
        };
    };
}
export declare class GetAnalysisResponseDto {
    success: boolean;
    message: string;
    data: {
        analytics: any;
        relatedKeywords: any[];
        chartData: any;
    };
}
