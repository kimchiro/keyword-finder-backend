import { KeywordAnalytics } from '../../../../database/entities/keyword-analytics.entity';
import { RelatedKeywords } from '../../../../database/entities/related-keywords.entity';
import { SearchTrends } from '../../../../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../../../../database/entities/monthly-search-ratios.entity';
import { Keyword, AnalysisDate } from '../value-objects';

// 키워드 분석 집합체 - 키워드 분석과 관련된 모든 데이터를 하나의 단위로 관리
export class KeywordAnalysisAggregate {
  private readonly _keyword: Keyword;
  private readonly _analysisDate: AnalysisDate;
  private readonly _analytics: KeywordAnalytics;
  private readonly _relatedKeywords: RelatedKeywords[];
  private readonly _chartData: {
    searchTrends: SearchTrends[];
    monthlyRatios: MonthlySearchRatios[];
  };

  constructor(
    keyword: Keyword,
    analysisDate: AnalysisDate,
    analytics: KeywordAnalytics,
    relatedKeywords: RelatedKeywords[],
    chartData: {
      searchTrends: SearchTrends[];
      monthlyRatios: MonthlySearchRatios[];
    },
  ) {
    this._keyword = keyword;
    this._analysisDate = analysisDate;
    this._analytics = analytics;
    this._relatedKeywords = relatedKeywords;
    this._chartData = chartData;
  }

  // Getters
  get keyword(): Keyword {
    return this._keyword;
  }

  get analysisDate(): AnalysisDate {
    return this._analysisDate;
  }

  get analytics(): KeywordAnalytics {
    return this._analytics;
  }

  get relatedKeywords(): RelatedKeywords[] {
    return [...this._relatedKeywords];
  }

  get chartData() {
    return {
      searchTrends: [...this._chartData.searchTrends],
      monthlyRatios: [...this._chartData.monthlyRatios],
    };
  }

  // 검색량 정보 반환 - 단순한 객체로 반환
  get searchVolume(): {
    pc: number;
    mobile: number;
    total: number;
    pcRatio: number;
    mobileRatio: number;
  } {
    const pc = this._analytics.monthlySearchPc;
    const mobile = this._analytics.monthlySearchMobile;
    const total = pc + mobile;
    
    return {
      pc,
      mobile,
      total,
      pcRatio: total > 0 ? Math.round((pc / total) * 100) : 0,
      mobileRatio: total > 0 ? Math.round((mobile / total) * 100) : 0,
    };
  }

  // 연관 키워드 개수
  get relatedKeywordCount(): number {
    return this._relatedKeywords.length;
  }

  // 상위 연관 키워드 반환 (상위 N개)
  getTopRelatedKeywords(limit: number = 10): RelatedKeywords[] {
    return this._relatedKeywords
      .slice(0, limit)
      .map(keyword => ({ ...keyword }));
  }

  // 월별 검색 트렌드 요약
  getMonthlyTrendSummary(): {
    averageRatio: number;
    maxRatio: number;
    minRatio: number;
    trendDirection: 'up' | 'down' | 'stable';
  } {
    const ratios = this._chartData.monthlyRatios.map(item => item.searchRatio);
    
    if (ratios.length === 0) {
      return {
        averageRatio: 0,
        maxRatio: 0,
        minRatio: 0,
        trendDirection: 'stable',
      };
    }

    const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    const maxRatio = Math.max(...ratios);
    const minRatio = Math.min(...ratios);

    // 트렌드 방향 계산 (최근 3개월 vs 이전 3개월)
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (ratios.length >= 6) {
      const recentAvg = ratios.slice(-3).reduce((sum, ratio) => sum + ratio, 0) / 3;
      const previousAvg = ratios.slice(-6, -3).reduce((sum, ratio) => sum + ratio, 0) / 3;
      
      if (recentAvg > previousAvg * 1.1) {
        trendDirection = 'up';
      } else if (recentAvg < previousAvg * 0.9) {
        trendDirection = 'down';
      }
    }

    return {
      averageRatio: Math.round(averageRatio * 100) / 100,
      maxRatio,
      minRatio,
      trendDirection,
    };
  }

  // 분석 결과를 DTO 형태로 변환 (keyword 문자열 포함)
  toDto(): {
    analytics: any;
    relatedKeywords: any[];
    chartData: {
      searchTrends: any[];
      monthlyRatios: any[];
    };
  } {
    return {
      analytics: this._analytics,
      relatedKeywords: this.relatedKeywords,
      chartData: this.chartData,
    };
  }

  // 집합체 유효성 검증
  validate(): boolean {
    try {
      // 키워드와 분석 날짜 검증
      if (!this._keyword || !this._analysisDate) {
        return false;
      }

      // 분석 데이터 존재 여부 확인
      if (!this._analytics) {
        return false;
      }


      // 분석 날짜 일치성 확인
      const analyticsDate = new AnalysisDate(this._analytics.analysisDate);
      if (!this._analysisDate.isSameDay(analyticsDate)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
