import { Repository } from 'typeorm';
import { TransactionService } from '../../../../common/services/transaction.service';
import { KeywordAnalytics } from '../../../../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../../../../database/entities/related-keywords.entity';
import { KeywordCollectionLogs } from '../../../../database/entities/keyword-collection-logs.entity';
import { Keyword as KeywordEntity } from '../../../../database/entities/keyword.entity';
import { Keyword, AnalysisDate } from '../value-objects';
export declare class KeywordDataService {
    private keywordAnalyticsRepository;
    private relatedKeywordsRepository;
    private keywordCollectionLogsRepository;
    private keywordRepository;
    private transactionService;
    constructor(keywordAnalyticsRepository: Repository<KeywordAnalytics>, relatedKeywordsRepository: Repository<RelatedKeywords>, keywordCollectionLogsRepository: Repository<KeywordCollectionLogs>, keywordRepository: Repository<KeywordEntity>, transactionService: TransactionService);
    saveKeywordAnalytics(keyword: Keyword, analysisDate: AnalysisDate, naverApiData?: any): Promise<KeywordAnalytics>;
    saveRelatedKeywords(baseKeyword: Keyword, analysisDate: AnalysisDate, relatedKeywordsData: any[]): Promise<RelatedKeywords[]>;
    findKeywordAnalytics(keyword: Keyword): Promise<KeywordAnalytics | null>;
    findKeywordAnalyticsByDate(keyword: Keyword, analysisDate: AnalysisDate): Promise<KeywordAnalytics | null>;
    findRelatedKeywords(keyword: Keyword, analysisDate: AnalysisDate): Promise<RelatedKeywords[]>;
    findAnalyzedKeywords(): Promise<any[]>;
    private extractNaverApiData;
    saveScrapedKeywords(keyword: Keyword, analysisDate: AnalysisDate, scrapingData: any): Promise<void>;
    findScrapedKeywords(keyword: Keyword): Promise<any[]>;
    saveContentCounts(keyword: Keyword, analysisDate: AnalysisDate, contentData: {
        blogs: number;
        cafes: number;
        total: number;
    }): Promise<KeywordAnalytics>;
}
