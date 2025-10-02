import { Keyword } from './keyword.entity';
export declare enum PeriodType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"
}
export declare class SearchTrends {
    id: number;
    keywordId: number;
    keywordEntity: Keyword;
    periodType: PeriodType;
    periodValue: string;
    searchVolume: number;
    searchRatio: number;
    createdAt: Date;
}
