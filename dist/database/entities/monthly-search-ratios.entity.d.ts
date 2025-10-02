import { Keyword } from './keyword.entity';
export declare class MonthlySearchRatios {
    id: number;
    keywordId: number;
    keywordEntity: Keyword;
    monthNumber: number;
    searchRatio: number;
    analysisYear: number;
    createdAt: Date;
}
