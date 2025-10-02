import { Keyword } from './keyword.entity';
export declare enum CollectionType {
    TRENDING = "trending",
    SMARTBLOCK = "smartblock",
    RELATED_SEARCH = "related_search"
}
export declare class KeywordCollectionLogs {
    id: number;
    baseQueryId: number;
    collectedKeywordId: number;
    baseQueryEntity: Keyword;
    collectedKeywordEntity: Keyword;
    collectionType: CollectionType;
    rankPosition: number;
    collectedAt: Date;
}
