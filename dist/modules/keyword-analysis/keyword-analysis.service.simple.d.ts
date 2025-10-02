import { Repository } from 'typeorm';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';
export declare class KeywordAnalysisService {
    private keywordRepository;
    private keywordAnalyticsRepository;
    constructor(keywordRepository: Repository<Keyword>, keywordAnalyticsRepository: Repository<KeywordAnalytics>);
    getServiceStatus(): Promise<{
        status: string;
        keywordCount: number;
        analyticsCount: number;
        timestamp: string;
    }>;
    getKeywords(limit?: number): Promise<{
        success: boolean;
        data: Keyword[];
        count: number;
        timestamp: string;
    }>;
    addKeyword(keyword: string): Promise<{
        success: boolean;
        message: string;
        data: Keyword;
    }>;
}
