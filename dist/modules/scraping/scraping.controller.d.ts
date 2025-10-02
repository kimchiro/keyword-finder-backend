import { ScrapingService } from './scraping.service';
import { ScrapeKeywordsDto, ScrapeKeywordsResponseDto, GetCollectionLogsResponseDto } from './dto/scraping.dto';
export declare class ScrapingController {
    private readonly scrapingService;
    constructor(scrapingService: ScrapingService);
    scrapeKeywords(scrapeDto: ScrapeKeywordsDto): Promise<ScrapeKeywordsResponseDto>;
    getCollectionLogs(query?: string, page?: number, limit?: number): Promise<GetCollectionLogsResponseDto>;
    getScrapingStats(days?: number): Promise<{
        success: boolean;
        message: string;
        data: {
            period: string;
            dailyStats: unknown[];
            typeStats: any;
            totalKeywords: unknown;
        };
    }>;
    getBrowserPoolStatus(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalInstances: number;
            activeInstances: number;
            inactiveInstances: number;
            maxPoolSize: number;
            instances: {
                id: string;
                isActive: boolean;
                lastUsed: Date;
                createdAt: Date;
                age: number;
            }[];
        };
    }>;
}
