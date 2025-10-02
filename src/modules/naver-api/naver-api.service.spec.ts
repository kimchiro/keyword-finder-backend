import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NaverApiService } from './naver-api.service';
import { ApiRetryService } from '../../common/services/api-retry.service';
import { AppConfigService } from '../../config/app.config';
import { KeywordDataService } from '../keyword-analysis/domain/services/keyword-data.service';
import { Keyword, AnalysisDate } from '../keyword-analysis/domain/value-objects';

describe('NaverApiService', () => {
  let service: NaverApiService;
  let apiRetryService: ApiRetryService;
  let appConfigService: AppConfigService;
  let keywordDataService: KeywordDataService;

  const mockApiRetryService = {
    executeNaverApiWithRetry: jest.fn(),
  };

  const mockAppConfigService = {
    validateNaverApiKeys: jest.fn(),
    naverApiBaseUrl: 'https://openapi.naver.com',
    naverClientId: 'test_client_id',
    naverClientSecret: 'test_client_secret',
    apiTimeoutMs: 10000,
    apiExtendedTimeoutMs: 15000,
  };

  const mockKeywordDataService = {
    saveContentCounts: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaverApiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ApiRetryService,
          useValue: mockApiRetryService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        {
          provide: KeywordDataService,
          useValue: mockKeywordDataService,
        },
      ],
    }).compile();

    service = module.get<NaverApiService>(NaverApiService);
    apiRetryService = module.get<ApiRetryService>(ApiRetryService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
    keywordDataService = module.get<KeywordDataService>(KeywordDataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchBlogs', () => {
    it('네이버 블로그 검색 API를 성공적으로 호출해야 함', async () => {
      // Given
      const query = '맛집';
      const display = 10;
      const start = 1;
      const sort = 'sim';

      const mockApiResponse = {
        data: {
          total: 1000,
          start: 1,
          display: 10,
          items: [
            {
              title: '서울 <b>맛집</b> 추천',
              link: 'https://blog.naver.com/test1',
              description: '서울의 유명한 맛집들을 소개합니다.',
              bloggername: '맛집탐험가',
              bloggerlink: 'https://blog.naver.com/foodie',
              postdate: '20250921',
            },
            {
              title: '부산 <b>맛집</b> 베스트',
              link: 'https://blog.naver.com/test2',
              description: '부산 여행 시 꼭 가봐야 할 맛집들',
              bloggername: '여행러버',
              bloggerlink: 'https://blog.naver.com/traveler',
              postdate: '20250920',
            },
          ],
        },
      };

      mockApiRetryService.executeNaverApiWithRetry.mockResolvedValue(mockApiResponse);

      // When
      const result = await service.searchBlogs(query, display, start, sort);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(1000);
      expect(result.data.items).toHaveLength(2);
      expect(result.data.items[0].title).toContain('맛집');
      expect(mockApiRetryService.executeNaverApiWithRetry).toHaveBeenCalledTimes(1);
    });

    it('API 호출 실패 시 에러를 발생시켜야 함', async () => {
      // Given
      const query = '맛집';
      mockApiRetryService.executeNaverApiWithRetry.mockRejectedValue(new Error('API 호출 실패'));

      // When & Then
      await expect(service.searchBlogs(query)).rejects.toThrow('API 호출 실패');
    });
  });

  describe('searchCafes', () => {
    it('네이버 카페 검색 API를 성공적으로 호출해야 함', async () => {
      // Given
      const query = '맛집';
      const mockApiResponse = {
        data: {
          total: 500,
          start: 1,
          display: 10,
          items: [
            {
              title: '카페 <b>맛집</b> 추천',
              link: 'https://cafe.naver.com/test1',
              description: '카페에서 추천하는 맛집들',
              cafename: '맛집카페',
              cafeurl: 'https://cafe.naver.com/foodcafe',
            },
          ],
        },
      };

      mockApiRetryService.executeNaverApiWithRetry.mockResolvedValue(mockApiResponse);

      // When
      const result = await service.searchCafes(query);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.total).toBe(500);
      expect(result.data.items).toHaveLength(1);
      expect(mockApiRetryService.executeNaverApiWithRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDatalab', () => {
    it('네이버 데이터랩 API를 성공적으로 호출해야 함', async () => {
      // Given
      const requestBody = {
        startDate: '2024-09-22',
        endDate: '2025-09-22',
        timeUnit: 'month',
        keywordGroups: [
          {
            groupName: '맛집',
            keywords: ['맛집'],
          },
        ],
      };

      const mockApiResponse = {
        data: {
          startDate: '2024-09-22',
          endDate: '2025-09-22',
          timeUnit: 'month',
          results: [
            {
              title: '맛집',
              keywords: ['맛집'],
              data: [
                { period: '2024-09-01', ratio: 100 },
                { period: '2024-10-01', ratio: 95 },
                { period: '2024-11-01', ratio: 110 },
              ],
            },
          ],
        },
      };

      mockApiRetryService.executeNaverApiWithRetry.mockResolvedValue(mockApiResponse);

      // When
      const result = await service.getDatalab(requestBody);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].title).toBe('맛집');
      expect(result.data.results[0].data).toHaveLength(3);
      expect(mockApiRetryService.executeNaverApiWithRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSingleKeywordFullData', () => {
    it('1개 키워드 전체 데이터를 성공적으로 조회해야 함', async () => {
      // Given
      const request = { keyword: '맛집' };
      
      // Mock searchBlogs
      jest.spyOn(service, 'searchBlogs').mockResolvedValue({
        success: true,
        data: {
          total: 1000,
          start: 1,
          display: 10,
          items: [
            {
              title: '서울 맛집 추천',
              link: 'https://blog.naver.com/test1',
              description: '서울의 유명한 맛집들을 소개합니다.',
              bloggername: '맛집탐험가',
              bloggerlink: 'https://blog.naver.com/foodie',
              postdate: '20250921',
            },
          ],
        },
      });

      // Mock getDatalab
      jest.spyOn(service, 'getDatalab').mockResolvedValue({
        success: true,
        data: {
          startDate: '2024-09-22',
          endDate: '2025-09-22',
          timeUnit: 'month',
          results: [
            {
              title: '맛집',
              keywords: ['맛집'],
              data: [
                { period: '2024-09-01', ratio: 100 },
                { period: '2024-10-01', ratio: 95 },
              ],
            },
          ],
        },
      });

      // When
      const result = await service.getSingleKeywordFullData(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.keyword).toBe('맛집');
      expect(result.data.blogSearch).toBeDefined();
      expect(result.data.datalab).toBeDefined();
      expect(result.data.searchPeriod).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
    });

    it('API 호출 실패 시 에러를 발생시켜야 함', async () => {
      // Given
      const request = { keyword: '맛집' };
      jest.spyOn(service, 'searchBlogs').mockRejectedValue(new Error('블로그 검색 실패'));

      // When & Then
      await expect(service.getSingleKeywordFullData(request)).rejects.toThrow('블로그 검색 실패');
    });
  });

  describe('getMultipleKeywordsLimitedData', () => {
    it('5개 키워드 제한 데이터를 성공적으로 조회해야 함', async () => {
      // Given
      const request = { keywords: ['맛집', '카페', '레스토랑'] };
      
      // Mock getDatalab
      jest.spyOn(service, 'getDatalab').mockResolvedValue({
        success: true,
        data: {
          startDate: '2024-09-22',
          endDate: '2025-09-22',
          timeUnit: 'month',
          results: [
            {
              title: '맛집',
              keywords: ['맛집'],
              data: [
                { period: '2024-09-01', ratio: 100 },
              ],
            },
          ],
        },
      });

      // Mock searchBlogs
      jest.spyOn(service, 'searchBlogs').mockResolvedValue({
        success: true,
        data: {
          total: 1000,
          start: 1,
          display: 1,
          items: [],
        },
      });

      // When
      const result = await service.getMultipleKeywordsLimitedData(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.keywords).toEqual(['맛집', '카페', '레스토랑']);
      expect(result.data.results).toHaveLength(3);
      expect(result.data.searchPeriod).toBeDefined();
      expect(result.data.timestamp).toBeDefined();
    });

    it('5개 초과 키워드 요청 시 에러를 발생시켜야 함', async () => {
      // Given
      const request = { keywords: ['맛집', '카페', '레스토랑', '음식점', '디저트', '베이커리'] };

      // When & Then
      await expect(service.getMultipleKeywordsLimitedData(request)).rejects.toThrow(
        '키워드는 최대 5개까지만 요청할 수 있습니다.'
      );
    });
  });

  describe('getContentCounts', () => {
    it('콘텐츠 발행량을 성공적으로 조회해야 함', async () => {
      // Given
      const query = '맛집';
      
      // Mock searchBlogs
      jest.spyOn(service, 'searchBlogs').mockResolvedValue({
        success: true,
        data: { total: 1000, start: 1, display: 1, items: [] },
      });

      // Mock searchCafes
      jest.spyOn(service, 'searchCafes').mockResolvedValue({
        success: true,
        data: { total: 500, start: 1, display: 1, items: [] },
      });

      // When
      const result = await service.getContentCounts(query);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.keyword).toBe('맛집');
      expect(result.data.counts.blogs).toBe(1000);
      expect(result.data.counts.cafes).toBe(500);
      expect(result.data.counts.total).toBe(1500);
      expect(result.data.searchedAt).toBeDefined();
    });
  });

  describe('getContentCountsAndSave', () => {
    it('콘텐츠 발행량을 조회하고 데이터베이스에 저장해야 함', async () => {
      // Given
      const query = '맛집';
      
      // Mock getContentCounts
      jest.spyOn(service, 'getContentCounts').mockResolvedValue({
        success: true,
        data: {
          keyword: '맛집',
          searchedAt: new Date(),
          counts: {
            blogs: 1000,
            cafes: 500,
            total: 1500,
          },
        },
      });

      // Mock keywordDataService.saveContentCounts
      const mockSavedAnalytics = {
        id: 1,
        analysisDate: new Date(),
        monthlyContentBlog: 1000,
        monthlyContentCafe: 500,
        monthlyContentAll: 1500,
      };
      mockKeywordDataService.saveContentCounts.mockResolvedValue(mockSavedAnalytics);

      // When
      const result = await service.getContentCountsAndSave(query);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.keyword).toBe('맛집');
      expect(result.data.counts.blogs).toBe(1000);
      expect(result.data.counts.cafes).toBe(500);
      expect(result.data.counts.total).toBe(1500);
      expect(result.data.savedToDatabase).toBeDefined();
      expect(result.data.savedToDatabase.id).toBe(1);
      expect(mockKeywordDataService.saveContentCounts).toHaveBeenCalledWith(
        expect.any(Keyword),
        expect.any(AnalysisDate),
        {
          blogs: 1000,
          cafes: 500,
          total: 1500,
        }
      );
    });

    it('데이터베이스 저장 실패 시 에러를 발생시켜야 함', async () => {
      // Given
      const query = '맛집';
      
      jest.spyOn(service, 'getContentCounts').mockResolvedValue({
        success: true,
        data: {
          keyword: '맛집',
          searchedAt: new Date(),
          counts: { blogs: 1000, cafes: 500, total: 1500 },
        },
      });

      mockKeywordDataService.saveContentCounts.mockRejectedValue(new Error('데이터베이스 저장 실패'));

      // When & Then
      await expect(service.getContentCountsAndSave(query)).rejects.toThrow('데이터베이스 저장 실패');
    });
  });

  describe('getDateRange', () => {
    it('어제부터 작년 어제까지의 날짜 범위를 올바르게 계산해야 함', () => {
      // Given
      const today = new Date('2025-09-23');
      const realDateNow = Date.now.bind(global.Date);
      const dateNowStub = jest.fn(() => today.getTime());
      global.Date.now = dateNowStub;

      // When
      const result = (service as any).getDateRange();

      // Then
      expect(result.startDate).toBe('2024-09-22'); // 작년 어제
      expect(result.endDate).toBe('2025-09-22');   // 어제

      // Cleanup
      global.Date.now = realDateNow;
    });
  });

  describe('processKeywordData', () => {
    it('키워드 데이터를 올바르게 가공해야 함', () => {
      // Given
      const keyword = '맛집';
      const datalabData = {
        results: [
          {
            data: [
              { period: '2024-09-01', ratio: 80 },
              { period: '2024-10-01', ratio: 100 },
            ],
          },
        ],
      };
      const blogSearchData = { total: 1500 };

      // When
      const result = (service as any).processKeywordData(keyword, datalabData, blogSearchData);

      // Then
      expect(result.keyword).toBe('맛집');
      expect(result.monthlySearchVolume).toBe(10000); // 100 * 100
      expect(result.cumulativePublications).toBe(1500);
    });

    it('데이터가 없을 때 기본값을 반환해야 함', () => {
      // Given
      const keyword = '맛집';
      const datalabData = { results: [] };
      const blogSearchData = {};

      // When
      const result = (service as any).processKeywordData(keyword, datalabData, blogSearchData);

      // Then
      expect(result.keyword).toBe('맛집');
      expect(result.monthlySearchVolume).toBe(0);
      expect(result.cumulativePublications).toBe(0);
    });
  });

  describe('calculateMonthlySearchVolume', () => {
    it('월간검색량을 올바르게 계산해야 함', () => {
      // Given
      const datalabData = {
        results: [
          {
            data: [
              { period: '2024-09-01', ratio: 80 },
              { period: '2024-10-01', ratio: 100 },
            ],
          },
        ],
      };

      // When
      const result = (service as any).calculateMonthlySearchVolume(datalabData);

      // Then
      expect(result).toBe(10000); // 100 * 100
    });

    it('데이터가 없을 때 0을 반환해야 함', () => {
      // Given
      const datalabData = { results: [] };

      // When
      const result = (service as any).calculateMonthlySearchVolume(datalabData);

      // Then
      expect(result).toBe(0);
    });
  });
});