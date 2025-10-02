import { Injectable } from '@nestjs/common';
import { Keyword, AnalysisDate } from '../value-objects';
import { KeywordDataService } from './keyword-data.service';
import { ChartDataService } from './chart-data.service';
import { KeywordAnalysisAggregate } from '../aggregates/keyword-analysis.aggregate';

// 키워드 분석 도메인 서비스 - 네이버 API 결과 저장 및 조회 (단순화됨)
@Injectable()
export class KeywordAnalysisDomainService {
  constructor(
    private keywordDataService: KeywordDataService,
    private chartDataService: ChartDataService,
  ) {}

  // 키워드 분석 실행 - 네이버 API 결과를 직접 저장
  async analyzeKeyword(
    keywordValue: string,
    analysisDateValue?: string,
    naverApiData?: any,
    relatedKeywordsData?: any[],
  ): Promise<KeywordAnalysisAggregate> {
    console.log(`📊 키워드 분석 시작: ${keywordValue}`);

    // Value Object 생성
    const keyword = new Keyword(keywordValue);
    const analysisDate = new AnalysisDate(analysisDateValue);

    // 기존 분석 데이터 확인
    const existingAnalytics = await this.keywordDataService.findKeywordAnalyticsByDate(
      keyword,
      analysisDate,
    );

    if (existingAnalytics) {
      console.log(`⚠️ 키워드 '${keywordValue}'에 대한 분석 데이터가 이미 존재합니다. 기존 데이터를 반환합니다.`);
      try {
        return await this.getExistingAnalysis(keyword, analysisDate);
      } catch (error) {
        console.warn(`⚠️ 기존 데이터 조회 실패, 새로 생성합니다: ${error.message}`);
        // 기존 데이터 조회에 실패하면 새로 생성
      }
    }

    // 네이버 API 결과를 직접 저장 (계산 로직 제거)
    const analytics = await this.keywordDataService.saveKeywordAnalytics(
      keyword,
      analysisDate,
      naverApiData,
    );

    // 연관 키워드 데이터 저장
    const relatedKeywords = await this.keywordDataService.saveRelatedKeywords(
      keyword,
      analysisDate,
      relatedKeywordsData || [],
    );

    // 차트 데이터 저장 (네이버 API 결과 직접 사용)
    const chartData = await this.chartDataService.saveChartData(
      keyword,
      analysisDate,
      naverApiData,
    );

    console.log(`✅ 키워드 분석 완료: ${keywordValue}`);

    return new KeywordAnalysisAggregate(
      keyword,
      analysisDate,
      analytics,
      relatedKeywords,
      chartData,
    );
  }

  // 키워드 분석 데이터 조회
  async getKeywordAnalysis(keywordValue: string): Promise<{
    success: boolean;
    data: KeywordAnalysisAggregate | null;
  }> {
    console.log(`📊 키워드 분석 데이터 조회: ${keywordValue}`);

    try {
      const keyword = new Keyword(keywordValue);
      
      // 최신 분석 데이터 조회
      const analytics = await this.keywordDataService.findKeywordAnalytics(keyword);

      if (!analytics) {
        return {
          success: false,
          data: null,
        };
      }

      const analysisDate = new AnalysisDate(analytics.analysisDate);
      const aggregate = await this.getExistingAnalysis(keyword, analysisDate);

      return {
        success: true,
        data: aggregate,
      };
    } catch (error) {
      console.error('❌ KeywordAnalysisDomainService.getKeywordAnalysis 오류:', error);
      throw error;
    }
  }

  // 분석된 키워드 목록 조회
  async getAnalyzedKeywords(): Promise<any[]> {
    try {
      return await this.keywordDataService.findAnalyzedKeywords();
    } catch (error) {
      console.error('❌ KeywordAnalysisDomainService.getAnalyzedKeywords 오류:', error);
      throw error;
    }
  }

  // 스크래핑 데이터 저장 및 반환
  async saveScrapingData(query: string, scrapingData: any): Promise<any> {
    try {
      console.log(`💾 스크래핑 데이터 저장 시작: ${query}`);
      
      const keyword = new Keyword(query);
      const analysisDate = new AnalysisDate();
      
      // 스크래핑된 키워드 데이터를 데이터베이스에 저장
      await this.keywordDataService.saveScrapedKeywords(keyword, analysisDate, scrapingData);
      
      // 저장된 데이터를 조회해서 반환
      const allSavedKeywords = await this.keywordDataService.findScrapedKeywords(keyword);
      
      // 중복 제거: 최신 데이터만 유지 (키워드 + 카테고리 조합으로 중복 제거)
      const uniqueKeywords = this.removeDuplicateKeywords(allSavedKeywords);
      
      // 카테고리별 통계 계산
      const categories = this.categorizeKeywords(uniqueKeywords);
      
      // 상위 키워드 추출 (순위순으로 정렬 후 상위 10개)
      const topKeywords = uniqueKeywords
        .sort((a, b) => a.rankPosition - b.rankPosition)
        .slice(0, 10)
        .map(k => k.keyword);
      
      // 순위와 함께 키워드 정보 구성
      const keywordsWithRank = uniqueKeywords
        .sort((a, b) => a.rankPosition - b.rankPosition)
        .map(k => ({
          keyword: k.keyword,
          originalRank: k.rankPosition,
          category: k.category,
          source: 'naver_scraping'
        }));
      
      const result = {
        query,
        keywords: uniqueKeywords,
        totalCount: uniqueKeywords.length,
        categories,
        topKeywords,
        keywordsWithRank,
        scrapingTime: scrapingData.executionTime || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ 스크래핑 데이터 저장 완료: ${query} (${uniqueKeywords.length}개 고유 키워드, 전체 ${allSavedKeywords.length}개에서 중복 제거)`);
      return result;
    } catch (error) {
      console.error('❌ KeywordAnalysisDomainService.saveScrapingData 오류:', error);
      throw error;
    }
  }

  // 저장된 스크래핑 키워드 조회
  async getScrapedKeywords(query: string): Promise<any[]> {
    try {
      console.log(`🔍 스크래핑 키워드 조회: ${query}`);
      
      const keyword = new Keyword(query);
      const result = await this.keywordDataService.findScrapedKeywords(keyword);
      
      console.log(`✅ 스크래핑 키워드 조회 완료: ${result.length}개`);
      return result;
    } catch (error) {
      console.error('❌ KeywordAnalysisDomainService.getScrapedKeywords 오류:', error);
      throw error;
    }
  }


  // 기존 분석 데이터 조회
  private async getExistingAnalysis(
    keyword: Keyword,
    analysisDate: AnalysisDate,
  ): Promise<KeywordAnalysisAggregate> {
    console.log(`🔍 기존 분석 데이터 조회 시작: ${keyword.value} (${analysisDate.value})`);
    
    try {
      const [analytics, relatedKeywords, chartData] = await Promise.all([
        this.keywordDataService.findKeywordAnalyticsByDate(keyword, analysisDate),
        this.keywordDataService.findRelatedKeywords(keyword, analysisDate),
        this.chartDataService.getChartData(keyword, analysisDate),
      ]);

      console.log(`🔍 기존 데이터 조회 결과:`, {
        analytics: analytics ? `존재 (ID: ${analytics.id})` : '없음',
        relatedKeywordsCount: relatedKeywords?.length || 0,
        chartDataSearchTrends: chartData?.searchTrends?.length || 0,
        chartDataMonthlyRatios: chartData?.monthlyRatios?.length || 0,
      });

      if (!analytics) {
        throw new Error(`키워드 '${keyword.value}'의 분석 데이터를 찾을 수 없습니다.`);
      }

      return new KeywordAnalysisAggregate(
        keyword,
        analysisDate,
        analytics,
        relatedKeywords,
        chartData,
      );
    } catch (error) {
      console.error(`❌ 기존 분석 데이터 조회 실패: ${keyword.value}`, error);
      throw error;
    }
  }

  // 키워드 카테고리별 통계 계산
  private categorizeKeywords(keywords: any[]): { [key: string]: number } {
    return keywords.reduce((acc, keyword) => {
      const category = keyword.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  // 중복 키워드 제거 (키워드 + 카테고리 조합으로 중복 제거, 최신 데이터 유지)
  private removeDuplicateKeywords(keywords: any[]): any[] {
    const keywordMap = new Map<string, any>();
    
    // 최신 데이터부터 처리 (collectedAt 기준 내림차순 정렬)
    const sortedKeywords = keywords.sort((a, b) => 
      new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime()
    );
    
    for (const keyword of sortedKeywords) {
      const key = `${keyword.keyword}-${keyword.category}`;
      
      // 이미 존재하지 않는 경우에만 추가 (최신 데이터가 우선)
      if (!keywordMap.has(key)) {
        keywordMap.set(key, keyword);
      }
    }
    
    // Map에서 값들을 배열로 변환하고 순위순으로 정렬
    return Array.from(keywordMap.values()).sort((a, b) => {
      // 카테고리별로 먼저 정렬 (smartblock 우선)
      if (a.category !== b.category) {
        if (a.category === 'smartblock') return -1;
        if (b.category === 'smartblock') return 1;
        return a.category.localeCompare(b.category);
      }
      // 같은 카테고리 내에서는 순위순 정렬
      return a.rankPosition - b.rankPosition;
    });
  }
}
