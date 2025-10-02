import { KeywordAnalytics } from './keyword-analytics.entity';
import { RelatedKeywords } from './related-keywords.entity';
import { KeywordCollectionLogs } from './keyword-collection-logs.entity';
export declare class Keyword {
    id: number;
    keyword: string;
    status: 'active' | 'inactive' | 'archived';
    createdAt: Date;
    updatedAt: Date;
    analytics: KeywordAnalytics[];
    relatedKeywords: RelatedKeywords[];
    collectionLogs: KeywordCollectionLogs[];
}
