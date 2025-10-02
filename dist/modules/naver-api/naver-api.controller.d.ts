import { NaverApiService } from './naver-api.service';
import { SingleKeywordFullDataDto, MultipleKeywordsLimitedDataDto, SingleKeywordFullDataResponseDto, MultipleKeywordsLimitedDataResponseDto, BlogSearchResponseDto } from './dto/naver-api.dto';
export declare class NaverApiController {
    private readonly naverApiService;
    constructor(naverApiService: NaverApiService);
    searchBlog(query: string, display?: number, start?: number, sort?: string): Promise<BlogSearchResponseDto>;
    getContentCounts(query: string): Promise<{
        success: boolean;
        message: string;
        data: {
            keyword: string;
            searchedAt: Date;
            counts: {
                blogs: any;
                cafes: any;
                total: any;
            };
        };
    }>;
    getContentCountsAndSave(query: string): Promise<{
        success: boolean;
        message: string;
        data: {
            keyword: string;
            searchedAt: Date;
            counts: {
                blogs: any;
                cafes: any;
                total: any;
            };
            savedToDatabase: {
                id: number;
                analysisDate: Date;
                monthlyContentBlog: number;
                monthlyContentCafe: number;
                monthlyContentAll: number;
            };
        };
    }>;
    getSingleKeywordFullData(request: SingleKeywordFullDataDto): Promise<SingleKeywordFullDataResponseDto>;
    getMultipleKeywordsLimitedData(request: MultipleKeywordsLimitedDataDto): Promise<MultipleKeywordsLimitedDataResponseDto>;
}
