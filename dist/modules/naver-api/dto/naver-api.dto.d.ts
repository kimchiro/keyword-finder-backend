export declare class SingleKeywordFullDataDto {
    keyword: string;
}
export declare class MultipleKeywordsLimitedDataDto {
    keywords: string[];
}
export declare class BlogSearchResponseDto {
    success: boolean;
    message: string;
    data: {
        total: number;
        start: number;
        display: number;
        items: Array<{
            title: string;
            link: string;
            description: string;
            bloggername: string;
            bloggerlink: string;
            postdate: string;
        }>;
    };
}
export declare class SingleKeywordFullDataResponseDto {
    success: boolean;
    message: string;
    data: {
        keyword: string;
        blogSearch: {
            total: number;
            start: number;
            display: number;
            items: Array<{
                title: string;
                link: string;
                description: string;
                bloggername: string;
                bloggerlink: string;
                postdate: string;
            }>;
        };
        datalab: any;
        searchPeriod: {
            startDate: string;
            endDate: string;
        };
        timestamp: string;
    };
}
export declare class MultipleKeywordsLimitedDataResponseDto {
    success: boolean;
    message: string;
    data: {
        keywords: string[];
        results: Array<{
            keyword: string;
            monthlySearchVolume: number;
        }>;
        searchPeriod: {
            startDate: string;
            endDate: string;
        };
        timestamp: string;
    };
}
