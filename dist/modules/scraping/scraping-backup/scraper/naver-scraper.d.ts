import { BrowserPoolService } from '../../../common/services/browser-pool.service';
export interface ScrapedKeyword {
    keyword: string;
    category: 'autosuggest' | 'related' | 'smartblock' | 'related_search';
    rank?: number;
    competition?: 'low' | 'medium' | 'high';
    source?: string;
    similarity?: 'low' | 'medium' | 'high';
    relatedData?: any;
}
export interface ScrapingResult {
    keywords: ScrapedKeyword[];
    message: string;
    status: 'success' | 'no_content' | 'error';
    count?: number;
    pages?: number[];
}
export declare class NaverScraper {
    private browserPoolService;
    private session;
    constructor(browserPoolService: BrowserPoolService);
    initialize(): Promise<void>;
    close(): Promise<void>;
    private get page();
    scrapeSmartBlockData(query: string): Promise<ScrapingResult>;
    scrapeRelatedSearchKeywords(query: string): Promise<ScrapingResult>;
    private scrapeRelatedFromPage;
    scrapeAllKeywords(query: string, types?: string[]): Promise<{
        keywords: ScrapedKeyword[];
        collectionDetails: {
            [key: string]: {
                status: 'success' | 'no_content' | 'error';
                message: string;
                count: number;
                pages?: number[];
            };
        };
    }>;
    private estimateCompetition;
    private calculateSimilarity;
    private isValidKeyword;
    private isBlacklistedKeyword;
    private calculateSimilarityScore;
    private isValidRelatedKeyword;
}
