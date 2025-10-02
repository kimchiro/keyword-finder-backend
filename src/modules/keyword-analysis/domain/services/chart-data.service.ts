import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransactionService } from '../../../../common/services/transaction.service';
import { SearchTrends, PeriodType } from '../../../../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../../../../database/entities/monthly-search-ratios.entity';
import { Keyword, AnalysisDate } from '../value-objects';

// 차트 데이터 서비스 - 키워드 분석 차트 데이터의 저장/조회를 담당
@Injectable()
export class ChartDataService {
  constructor(
    @InjectRepository(SearchTrends)
    private searchTrendsRepository: Repository<SearchTrends>,
    @InjectRepository(MonthlySearchRatios)
    private monthlySearchRatiosRepository: Repository<MonthlySearchRatios>,
    private transactionService: TransactionService,
    private dataSource: DataSource,
  ) {}

  // 차트 데이터 저장 - 네이버 API 결과 직접 저장 (단순화)
  async saveChartData(
    keyword: Keyword,
    analysisDate: AnalysisDate,
    naverApiData?: any,
  ): Promise<{
    searchTrends: SearchTrends[];
    monthlyRatios: MonthlySearchRatios[];
  }> {
    return await this.transactionService.runInTransaction(async (queryRunner) => {
      // 키워드 엔티티 조회 또는 생성
      const KeywordEntity = await import('../../../../database/entities/keyword.entity').then(m => m.Keyword);
      let keywordEntity = await queryRunner.manager.getRepository(KeywordEntity).findOne({
        where: { keyword: keyword.value }
      });

      if (!keywordEntity) {
        keywordEntity = await queryRunner.manager.getRepository(KeywordEntity).save({
          keyword: keyword.value,
          status: 'active',
        });
      }

      // 기존 차트 데이터 삭제
      await this.clearExistingChartData(keywordEntity.id, analysisDate, queryRunner);

      // 네이버 API 데이터를 직접 변환하여 저장 (keywordId 포함)
      const chartDataToSave = this.extractChartDataFromNaverApi(keyword.value, analysisDate, naverApiData, keywordEntity.id);

      // 배치 UPSERT (중복 키 처리)
      if (chartDataToSave.searchTrends.length > 0) {
        await this.transactionService.batchUpsert(
          queryRunner,
          SearchTrends,
          chartDataToSave.searchTrends,
          ['keyword_id', 'period_type', 'period_value'], // 중복 감지 컬럼 (DB 컬럼명)
          ['search_volume', 'search_ratio'], // 업데이트할 컬럼 (DB 컬럼명)
          500
        );
      }

      if (chartDataToSave.monthlyRatios.length > 0) {
        await this.transactionService.batchUpsert(
          queryRunner,
          MonthlySearchRatios,
          chartDataToSave.monthlyRatios,
          ['keyword_id', 'month_number', 'analysis_year'], // 중복 감지 컬럼 (DB 컬럼명)
          ['search_ratio'], // 업데이트할 컬럼 (DB 컬럼명)
          500
        );
      }


      // 저장된 데이터 조회
      const [savedSearchTrends, savedMonthlyRatios] = await Promise.all([
        queryRunner.manager.getRepository(SearchTrends).find({
          where: { keywordId: keywordEntity.id, periodType: PeriodType.MONTHLY },
          order: { periodValue: 'ASC' },
        }),
        queryRunner.manager.getRepository(MonthlySearchRatios).find({
          where: { keywordId: keywordEntity.id, analysisYear: analysisDate.year },
          order: { monthNumber: 'ASC' },
        }),
      ]);

      return {
        searchTrends: savedSearchTrends,
        monthlyRatios: savedMonthlyRatios,
      };
    });
  }

  // 차트 데이터 조회 (keyword 문자열 포함)
  async getChartData(keyword: Keyword, analysisDate: AnalysisDate): Promise<{
    searchTrends: any[];
    monthlyRatios: any[];
  }> {
    const analysisDateStr = analysisDate.dateString;
    
    const [
      searchTrends,
      monthlyRatios,
    ] = await Promise.all([
      this.dataSource
        .getRepository(SearchTrends)
        .createQueryBuilder('st')
        .leftJoinAndSelect('st.keyword', 'k')
        .select(['st.id', 'st.keywordId', 'st.periodType', 'st.periodValue', 'st.searchVolume', 'st.searchRatio', 'st.createdAt', 'k.keyword'])
        .where('k.keyword = :keyword AND st.periodType = :periodType', { 
          keyword: keyword.value, 
          periodType: PeriodType.MONTHLY 
        })
        .orderBy('st.periodValue', 'ASC')
        .limit(12)
        .getMany(),

      this.dataSource
        .getRepository(MonthlySearchRatios)
        .createQueryBuilder('msr')
        .leftJoinAndSelect('msr.keyword', 'k')
        .select(['msr.id', 'msr.keywordId', 'msr.monthNumber', 'msr.searchRatio', 'msr.analysisYear', 'msr.createdAt', 'k.keyword'])
        .where('k.keyword = :keyword AND msr.analysisYear = :analysisYear', { 
          keyword: keyword.value, 
          analysisYear: analysisDate.year 
        })
        .orderBy('msr.monthNumber', 'ASC')
        .getMany(),

    ]);

    return {
      searchTrends,
      monthlyRatios,
    };
  }

  // 기존 차트 데이터 삭제
  private async clearExistingChartData(
    keywordId: number,
    analysisDate: AnalysisDate,
    queryRunner: any,
  ): Promise<void> {
    await Promise.all([
      this.transactionService.batchDelete(queryRunner, SearchTrends, { keywordId }),
      this.transactionService.batchDelete(queryRunner, MonthlySearchRatios, { keywordId, analysisYear: analysisDate.year }),
    ]);
  }

  // 네이버 API 데이터에서 차트 데이터 추출
  private extractChartDataFromNaverApi(
    keyword: string,
    analysisDate: AnalysisDate,
    naverApiData?: any,
    keywordId?: number,
  ): {
    searchTrends: any[];
    monthlyRatios: any[];
  } {
    const searchTrends: any[] = [];
    const monthlyRatios: any[] = [];

    try {
      // 네이버 데이터랩 데이터 처리
      if (naverApiData?.datalab?.results?.[0]?.data) {
        const datalabData = naverApiData.datalab.results[0].data;
        
        for (const dataPoint of datalabData) {
          // 검색 트렌드 데이터 - 네이버 API 결과 직접 사용
          searchTrends.push({
            keywordId,
            periodType: PeriodType.MONTHLY,
            periodValue: dataPoint.period,
            searchVolume: dataPoint.ratio,
            searchRatio: dataPoint.ratio,
          });

          // 월별 검색 비율 데이터
          const monthMatch = dataPoint.period.match(/-(\d{2})-/);
          if (monthMatch) {
            const monthNumber = parseInt(monthMatch[1]);
            monthlyRatios.push({
              keywordId,
              monthNumber,
              searchRatio: dataPoint.ratio,
              analysisYear: analysisDate.year,
            });
          }
        }
      }


    } catch (error) {
      console.error('❌ 네이버 API 차트 데이터 추출 오류:', error);
    }

    return {
      searchTrends,
      monthlyRatios,
    };
  }

}
