import { ConfigService } from '@nestjs/config';
import { ScrapeKeywordsDto } from './dto/scraping.dto';
export declare class ScrapingService {
    private configService;
    constructor(configService: ConfigService);
    scrapeKeywords(scrapeDto: ScrapeKeywordsDto): Promise<{
        query: string;
        totalKeywords: number;
        executionTime: number;
        categories: {
            [key: string]: number;
        };
        keywords: {
            keyword: string;
            category: "related_search" | "autosuggest" | "related" | "smartblock";
            rank: number;
            source: string;
            competition: "medium" | "low" | "high";
            similarity: "medium" | "low" | "high";
        }[];
        collectionDetails: {
            [key: string]: {
                status: "success" | "no_content" | "error";
                message: string;
                count: number;
                pages?: number[];
            };
        };
    }>;
    getCollectionLogs(query?: string, page?: number, limit?: number): Promise<{
        logs: any;
        total: any;
        page: number;
        limit: number;
    }>;
    getScrapingStats(days?: number): Promise<{
        period: string;
        dailyStats: unknown[];
        typeStats: any;
        totalKeywords: unknown;
    }>;
    private performRealScraping;
    getBrowserPoolStatus(): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
    private findOrCreateKeyword;
    private saveCollectionLogs;
}
