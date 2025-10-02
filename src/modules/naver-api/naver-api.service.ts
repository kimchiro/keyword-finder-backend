import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ApiRetryService } from '../../common/services/api-retry.service';
import { AppConfigService } from '../../config/app.config';
import { NAVER_API, API_RESPONSE } from '../../constants/api.constants';
import { KeywordDataService } from '../keyword-analysis/domain/services/keyword-data.service';
import { Keyword, AnalysisDate } from '../keyword-analysis/domain/value-objects';
import {
  SingleKeywordFullDataDto,
  MultipleKeywordsLimitedDataDto,
} from './dto/naver-api.dto';

@Injectable()
export class NaverApiService {
  constructor(
    private configService: ConfigService,
    private apiRetryService: ApiRetryService,
    private appConfig: AppConfigService,
    private keywordDataService: KeywordDataService,
  ) {
    // 애플리케이션 시작 시 네이버 API 키 검증
    this.appConfig.validateNaverApiKeys();
  }

  // 블로그 검색 (상위 10개 데이터)
  async searchBlogs(query: string, display = 10, start = 1, sort = 'sim') {
    try {
      console.log(`🔍 네이버 블로그 검색 API 호출: ${query}`);

      // API 재시도 시스템을 사용한 호출
      const response = await this.apiRetryService.executeNaverApiWithRetry(
        () => axios.get(`${this.appConfig.naverApiBaseUrl}${NAVER_API.ENDPOINTS.BLOG_SEARCH}.json`, {
          headers: {
            [NAVER_API.HEADERS.CLIENT_ID]: this.appConfig.naverClientId,
            [NAVER_API.HEADERS.CLIENT_SECRET]: this.appConfig.naverClientSecret,
            'User-Agent': NAVER_API.HEADERS.USER_AGENT,
          },
          params: {
            query,
            display,
            start,
            sort,
          },
          timeout: this.appConfig.apiTimeoutMs,
        }),
        'blog-search'
      );

      console.log(`✅ 네이버 블로그 검색 완료: ${response.data.items?.length || 0}개 결과`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ NaverApiService.searchBlogs 오류:', error);
      throw error;
    }
  }

  // 카페 검색 (콘텐츠 발행량 조회용)
  async searchCafes(query: string, display = 10, start = 1, sort = 'sim') {
    try {
      console.log(`☕ 네이버 카페 검색 API 호출: ${query}`);

      // API 재시도 시스템을 사용한 호출
      const response = await this.apiRetryService.executeNaverApiWithRetry(
        () => axios.get(`${this.appConfig.naverApiBaseUrl}/v1/search/cafearticle.json`, {
          headers: {
            [NAVER_API.HEADERS.CLIENT_ID]: this.appConfig.naverClientId,
            [NAVER_API.HEADERS.CLIENT_SECRET]: this.appConfig.naverClientSecret,
            'User-Agent': NAVER_API.HEADERS.USER_AGENT,
          },
          params: {
            query,
            display,
            start,
            sort,
          },
          timeout: this.appConfig.apiTimeoutMs,
        }),
        'cafe-search'
      );

      console.log(`✅ 네이버 카페 검색 완료: ${response.data.items?.length || 0}개 결과`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ NaverApiService.searchCafes 오류:', error);
      throw error;
    }
  }

  // 데이터랩 트렌드 조회
  async getDatalab(requestBody: any) {
    try {
      console.log(`📊 네이버 데이터랩 API 호출:`, requestBody);

      // API 재시도 시스템을 사용한 호출
      const response = await this.apiRetryService.executeNaverApiWithRetry(
        () => axios.post(
          `${this.appConfig.naverApiBaseUrl}${NAVER_API.ENDPOINTS.SEARCH_TREND}`,
          requestBody,
          {
            headers: {
              [NAVER_API.HEADERS.CLIENT_ID]: this.appConfig.naverClientId,
              [NAVER_API.HEADERS.CLIENT_SECRET]: this.appConfig.naverClientSecret,
              'Content-Type': NAVER_API.HEADERS.CONTENT_TYPE,
              'User-Agent': NAVER_API.HEADERS.USER_AGENT,
            },
            timeout: this.appConfig.apiExtendedTimeoutMs,
          },
        ),
        'datalab-search'
      );

      console.log(`✅ 네이버 데이터랩 조회 완료: ${response.data.results?.length || 0}개 결과`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ NaverApiService.getDatalab 오류:', error);
      throw error;
    }
  }

  // 1개 키워드 전체 검색 결과 (어제부터 작년 어제까지)
  async getSingleKeywordFullData(request: SingleKeywordFullDataDto) {
    try {
      console.log(`🔍 단일 키워드 전체 데이터 조회 시작: ${request.keyword}`);

      // 날짜 설정: 어제부터 작년 어제까지
      const { startDate, endDate } = this.getDateRange();
      console.log(`📅 검색 기간: ${startDate} ~ ${endDate}`);

      // 블로그 검색과 데이터랩 트렌드를 병렬로 조회
      const [blogSearchResult, datalabResult] = await Promise.all([
        this.searchBlogs(request.keyword, 10, 1, 'date'), // 상위 10개 결과, 날짜순 정렬
        // 트렌드 데이터
        this.getDatalab({
          startDate,
          endDate,
          timeUnit: 'month',
          keywordGroups: [
            {
              groupName: request.keyword,
              keywords: [request.keyword],
            },
          ],
        }),
      ]);

      console.log(`✅ 단일 키워드 전체 데이터 조회 완료: ${request.keyword}`);

      return {
        success: true,
        data: {
          keyword: request.keyword,
          blogSearch: blogSearchResult.data,
          datalab: datalabResult.data,
          searchPeriod: { startDate, endDate },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ NaverApiService.getSingleKeywordFullData 오류:', error);
      throw error;
    }
  }

  // 5개 키워드 검색 결과 (어제부터 작년 어제까지)
  async getMultipleKeywordsLimitedData(request: MultipleKeywordsLimitedDataDto) {
    try {
      console.log(`📊 다중 키워드 제한 데이터 조회 시작: ${request.keywords.join(', ')}`);

      if (request.keywords.length > 5) {
        throw new Error('키워드는 최대 5개까지만 요청할 수 있습니다.');
      }

      // 날짜 설정: 어제부터 작년 어제까지
      const { startDate, endDate } = this.getDateRange();

      // 각 키워드별로 데이터 조회
      const keywordResults = await Promise.all(
        request.keywords.map(async (keyword) => {
          try {
            // 트렌드 데이터만 조회 (발행량은 별도 API 사용)
            const datalabResult = await this.getDatalab({
              startDate,
              endDate,
              timeUnit: 'month',
              keywordGroups: [
                {
                  groupName: keyword,
                  keywords: [keyword],
                },
              ],
            });

            // 데이터 가공하여 필요한 정보만 추출 (발행량 제외)
            const processedData = this.processKeywordDataWithoutPublications(
              keyword,
              datalabResult.data
            );

            return processedData;
          } catch (error) {
            console.error(`❌ 키워드 "${keyword}" 처리 중 오류:`, error);
            return {
              keyword,
              monthlySearchVolume: 0,
              error: error.message,
            };
          }
        })
      );

      console.log(`✅ 다중 키워드 제한 데이터 조회 완료: ${request.keywords.length}개 키워드`);

      return {
        success: true,
        data: {
          keywords: request.keywords,
          results: keywordResults,
          searchPeriod: { startDate, endDate },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ NaverApiService.getMultipleKeywordsLimitedData 오류:', error);
      throw error;
    }
  }

  // 블로그와 카페 콘텐츠 발행량 조회
  async getContentCounts(query: string) {
    try {
      console.log(`📊 키워드 "${query}" 콘텐츠 수 조회 시작`);

      // 블로그와 카페 검색을 병렬로 실행 (결과 수만 필요하므로 display=1)
      const [blogResult, cafeResult] = await Promise.all([
        this.searchBlogs(query, 1, 1),
        this.searchCafes(query, 1, 1),
      ]);

      const contentCounts = {
        keyword: query,
        searchedAt: new Date(),
        counts: {
          blogs: blogResult.data.total || 0,      // 블로그 글 수
          cafes: cafeResult.data.total || 0,      // 카페 글 수
          total: (blogResult.data.total || 0) + (cafeResult.data.total || 0), // 전체 합계
        }
      };

      console.log(`✅ 콘텐츠 수 조회 완료:`, contentCounts.counts);
      return { success: true, data: contentCounts };

    } catch (error) {
      console.error('❌ NaverApiService.getContentCounts 오류:', error);
      throw error;
    }
  }

  // 콘텐츠 수 조회 및 데이터베이스 저장
  async getContentCountsAndSave(query: string) {
    try {
      console.log(`💾 키워드 "${query}" 콘텐츠 수 조회 및 저장 시작`);

      // 콘텐츠 수 조회
      const contentResult = await this.getContentCounts(query);
      
      // Value Objects 생성
      const keyword = new Keyword(query);
      const analysisDate = new AnalysisDate(); // 오늘 날짜로 생성
      
      // 데이터베이스에 저장
      const savedAnalytics = await this.keywordDataService.saveContentCounts(
        keyword,
        analysisDate,
        {
          blogs: contentResult.data.counts.blogs,
          cafes: contentResult.data.counts.cafes,
          total: contentResult.data.counts.total,
        }
      );

      console.log(`✅ 콘텐츠 수 데이터 저장 완료: ${query}`, {
        id: savedAnalytics.id,
        blogs: savedAnalytics.monthlyContentBlog,
        cafes: savedAnalytics.monthlyContentCafe,
        total: savedAnalytics.monthlyContentAll,
      });
      
      return { 
        success: true, 
        data: {
          keyword: query,
          searchedAt: contentResult.data.searchedAt,
          counts: contentResult.data.counts,
          savedToDatabase: {
            id: savedAnalytics.id,
            analysisDate: savedAnalytics.analysisDate,
            monthlyContentBlog: savedAnalytics.monthlyContentBlog,
            monthlyContentCafe: savedAnalytics.monthlyContentCafe,
            monthlyContentAll: savedAnalytics.monthlyContentAll,
          }
        },
        message: `키워드 "${query}" 콘텐츠 수 조회 및 데이터베이스 저장이 완료되었습니다.`
      };

    } catch (error) {
      console.error('❌ NaverApiService.getContentCountsAndSave 오류:', error);
      throw error;
    }
  }

  // 키워드 데이터 가공 (발행량 제외)
  private processKeywordDataWithoutPublications(
    keyword: string, 
    datalabData: any
  ) {
    try {
      // 월간검색량 계산 (데이터랩 트렌드 데이터에서 추출)
      const monthlySearchVolume = this.calculateMonthlySearchVolume(datalabData);

      console.log(`📊 키워드 "${keyword}" 데이터 가공 완료 (발행량 제외):`, {
        monthlySearchVolume,
      });

      return {
        keyword,
        monthlySearchVolume,
      };
    } catch (error) {
      console.error(`❌ 키워드 데이터 가공 오류 (${keyword}):`, error);
      return {
        keyword,
        monthlySearchVolume: 0,
      };
    }
  }

  // 키워드 데이터 가공 (기존 메서드 - 호환성 유지)
  private processKeywordData(
    keyword: string, 
    datalabData: any, 
    blogSearchData: any
  ) {
    try {
      // 월간검색량 계산 (데이터랩 트렌드 데이터에서 추출)
      const monthlySearchVolume = this.calculateMonthlySearchVolume(datalabData);
      
      // 누적발행량 추정 (블로그 검색 결과 total 값 활용)
      const cumulativePublications = blogSearchData.total || 0;

      console.log(`📊 키워드 "${keyword}" 데이터 가공 완료:`, {
        monthlySearchVolume,
        cumulativePublications,
      });

      return {
        keyword,
        monthlySearchVolume,
        cumulativePublications,
      };
    } catch (error) {
      console.error(`❌ 키워드 데이터 가공 오류 (${keyword}):`, error);
      return {
        keyword,
        monthlySearchVolume: 0,
        cumulativePublications: 0,
      };
    }
  }

  // 월간검색량 계산
  private calculateMonthlySearchVolume(datalabData: any): number {
    try {
      if (datalabData.results && datalabData.results.length > 0) {
        const latestData = datalabData.results[0].data;
        if (latestData && latestData.length > 0) {
          // 최근 데이터의 ratio 값을 기반으로 추정
          return latestData[latestData.length - 1].ratio * 100; // 임시 계산식
        }
      }
      return 0;
    } catch (error) {
      console.error('❌ 월간검색량 계산 오류:', error);
      return 0;
    }
  }

  // 날짜 범위 계산: 어제부터 작년 어제까지
  private getDateRange(): { startDate: string; endDate: string } {
    const today = new Date();
    
    // 어제 날짜 계산
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // 작년 어제 날짜 계산
    const lastYearYesterday = new Date(yesterday);
    lastYearYesterday.setFullYear(yesterday.getFullYear() - 1);
    
    // YYYY-MM-DD 형식으로 변환
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDate = formatDate(lastYearYesterday);
    const endDate = formatDate(yesterday);
    
    return { startDate, endDate };
  }
}