import { KeywordAnalytics } from '../../../../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../../../../database/entities/related-keywords.entity';
import { SearchTrends } from '../../../../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../../../../database/entities/monthly-search-ratios.entity';
import { Keyword, AnalysisDate } from '../value-objects';
export declare class KeywordAnalysisAggregate {
    private readonly _keyword;
    private readonly _analysisDate;
    private readonly _analytics;
    private readonly _relatedKeywords;
    private readonly _chartData;
    constructor(keyword: Keyword, analysisDate: AnalysisDate, analytics: KeywordAnalytics, relatedKeywords: RelatedKeywords[], chartData: {
        searchTrends: SearchTrends[];
        monthlyRatios: MonthlySearchRatios[];
    });
    get keyword(): Keyword;
    get analysisDate(): AnalysisDate;
    get analytics(): KeywordAnalytics;
    get relatedKeywords(): RelatedKeywords[];
    get chartData(): {
        searchTrends: SearchTrends[];
        monthlyRatios: MonthlySearchRatios[];
    };
    get searchVolume(): {
        pc: number;
        mobile: number;
        total: number;
        pcRatio: number;
        mobileRatio: number;
    };
    get relatedKeywordCount(): number;
    getTopRelatedKeywords(limit?: number): RelatedKeywords[];
    getMonthlyTrendSummary(): {
        averageRatio: number;
        maxRatio: number;
        minRatio: number;
        trendDirection: 'up' | 'down' | 'stable';
    };
    toDto(): {
        analytics: KeywordAnalytics;
        relatedKeywords: RelatedKeywords[];
        chartData: {
            searchTrends: SearchTrends[];
            monthlyRatios: MonthlySearchRatios[];
        };
    };
    validate(): boolean;
}
