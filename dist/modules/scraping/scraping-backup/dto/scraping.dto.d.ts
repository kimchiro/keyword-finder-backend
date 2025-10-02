export declare class ScrapeKeywordsDto {
    query: string;
    types?: string[];
    maxResults?: number;
}
export declare class ScrapeKeywordsResponseDto {
    success: boolean;
    message: string;
    data: {
        query: string;
        totalKeywords: number;
        executionTime: number;
        categories: {
            [key: string]: number;
        };
        keywords: Array<{
            keyword: string;
            category: string;
            rank: number;
            source: string;
        }>;
    };
}
export declare class GetCollectionLogsResponseDto {
    success: boolean;
    message: string;
    data: {
        logs: any[];
        total: number;
        page: number;
        limit: number;
    };
}
