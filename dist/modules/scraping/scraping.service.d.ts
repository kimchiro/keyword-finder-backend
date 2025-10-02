import { Repository } from 'typeorm';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordCollectionLogs } from '../../database/entities/keyword-collection-logs.entity';
import { ScrapeKeywordsDto } from './dto/scraping.dto';
import { BrowserPoolService } from '../../common/services/browser-pool.service';
import { AppConfigService } from '../../config/app.config';
export declare class ScrapingService {
    private keywordRepository;
    private keywordCollectionLogsRepository;
    private browserPoolService;
    private appConfig;
    constructor(keywordRepository: Repository<Keyword>, keywordCollectionLogsRepository: Repository<KeywordCollectionLogs>, browserPoolService: BrowserPoolService, appConfig: AppConfigService);
    scrapeKeywords(scrapeDto: ScrapeKeywordsDto): Promise<{
        query: string;
        totalKeywords: number;
        executionTime: number;
        categories: {
            [key: string]: number;
        };
        keywords: {
            keyword: string;
            category: "smartblock" | "related_search" | "autosuggest" | "related";
            rank: number;
            source: string;
            competition: "low" | "medium" | "high";
            similarity: "low" | "medium" | "high";
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
        logs: KeywordCollectionLogs[];
        total: number;
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
    }>;
    private findOrCreateKeyword;
    private saveCollectionLogs;
}
