import { Keyword } from './keyword.entity';
export declare enum SimilarityScore {
    LOW = "\uB0AE\uC74C",
    MEDIUM = "\uBCF4\uD1B5",
    HIGH = "\uB192\uC74C"
}
export declare class RelatedKeywords {
    id: number;
    baseKeywordId: number;
    relatedKeywordId: number;
    baseKeywordEntity: Keyword;
    relatedKeywordEntity: Keyword;
    monthlySearchVolume: number;
    blogCumulativePosts: number;
    similarityScore: SimilarityScore;
    rankPosition: number;
    analysisDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
