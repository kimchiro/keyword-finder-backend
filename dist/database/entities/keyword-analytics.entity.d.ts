import { Keyword } from './keyword.entity';
export declare class KeywordAnalytics {
    id: number;
    keywordId: number;
    keywordEntity: Keyword;
    monthlySearchPc: number;
    monthlySearchMobile: number;
    monthlySearchTotal: number;
    monthlyContentBlog: number;
    monthlyContentCafe: number;
    monthlyContentAll: number;
    estimatedSearchYesterday: number;
    estimatedSearchEndMonth: number;
    saturationIndexBlog: number;
    saturationIndexCafe: number;
    saturationIndexAll: number;
    analysisDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
