import { ConfigService } from '@nestjs/config';
import { ApiRetryService } from '../../common/services/api-retry.service';
import { AppConfigService } from '../../config/app.config';
import { KeywordDataService } from '../keyword-analysis/domain/services/keyword-data.service';
import { SingleKeywordFullDataDto, MultipleKeywordsLimitedDataDto } from './dto/naver-api.dto';
export declare class NaverApiService {
    private configService;
    private apiRetryService;
    private appConfig;
    private keywordDataService;
    constructor(configService: ConfigService, apiRetryService: ApiRetryService, appConfig: AppConfigService, keywordDataService: KeywordDataService);
    searchBlogs(query: string, display?: number, start?: number, sort?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    searchCafes(query: string, display?: number, start?: number, sort?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getDatalab(requestBody: any): Promise<{
        success: boolean;
        data: any;
    }>;
    getSingleKeywordFullData(request: SingleKeywordFullDataDto): Promise<{
        success: boolean;
        data: {
            keyword: string;
            blogSearch: any;
            datalab: any;
            searchPeriod: {
                startDate: string;
                endDate: string;
            };
            timestamp: string;
        };
    }>;
    getMultipleKeywordsLimitedData(request: MultipleKeywordsLimitedDataDto): Promise<{
        success: boolean;
        data: {
            keywords: string[];
            results: ({
                keyword: string;
                monthlySearchVolume: number;
            } | {
                keyword: string;
                monthlySearchVolume: number;
                error: any;
            })[];
            searchPeriod: {
                startDate: string;
                endDate: string;
            };
            timestamp: string;
        };
    }>;
    getContentCounts(query: string): Promise<{
        success: boolean;
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
        message: string;
    }>;
    private processKeywordDataWithoutPublications;
    private processKeywordData;
    private calculateMonthlySearchVolume;
    private getDateRange;
}
