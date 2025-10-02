import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingService } from './scraping.service';
import { KeywordCollectionLogs } from '../../database/entities/keyword-collection-logs.entity';
import { BrowserPoolService } from '../../common/services/browser-pool.service';
import { AppConfigService } from '../../config/app.config';

describe('ScrapingService', () => {
  let service: ScrapingService;
  let keywordCollectionLogsRepository: Repository<KeywordCollectionLogs>;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBrowserPoolService = {
    acquireBrowser: jest.fn(),
    releaseBrowser: jest.fn(),
  };

  const mockAppConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingService,
        {
          provide: getRepositoryToken(KeywordCollectionLogs),
          useValue: mockRepository,
        },
        {
          provide: BrowserPoolService,
          useValue: mockBrowserPoolService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
    keywordCollectionLogsRepository = module.get<Repository<KeywordCollectionLogs>>(
      getRepositoryToken(KeywordCollectionLogs),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeKeywords', () => {
    it('키워드 스크래핑을 성공적으로 수행해야 함', async () => {
      // Given
      const scrapeDto = {
        query: '맛집',
        types: ['autosuggest', 'related', 'trending'],
        maxResults: 50,
      };

      // Mock performRealScraping method with new response structure
      const mockScrapedKeywords = [
        {
          keyword: '맛집 추천',
          category: 'autosuggest',
          rank: 1,
          source: 'naver_autosuggest',
          competition: 'medium',
          similarity: 'high',
        },
        {
          keyword: '맛집 리스트',
          category: 'related',
          rank: 2,
          source: 'naver_related',
          competition: 'low',
          similarity: 'medium',
        },
        {
          keyword: '서울 맛집',
          category: 'trending',
          rank: 3,
          source: 'naver_trending',
          competition: 'high',
          similarity: 'low',
        },
      ];

      const mockCollectionDetails = {
        autosuggest: {
          status: 'success',
          message: '자동완성 키워드 1개 수집 완료',
          count: 1,
        },
        related: {
          status: 'success',
          message: '연관검색어 1개 수집 완료',
          count: 1,
        },
        trending: {
          status: 'success',
          message: '인기주제 키워드 1개 수집 완료',
          count: 1,
        },
      };

      // Mock private method using prototype
      jest.spyOn(service as any, 'performRealScraping').mockResolvedValue({
        keywords: mockScrapedKeywords,
        collectionDetails: mockCollectionDetails,
      });
      jest.spyOn(service as any, 'saveCollectionLogs').mockResolvedValue(undefined);

      // When
      const result = await service.scrapeKeywords(scrapeDto);

      // Then
      expect(result.query).toBe(scrapeDto.query);
      expect(result.totalKeywords).toBe(3);
      expect(result.keywords).toEqual(mockScrapedKeywords);
      expect(result.categories).toEqual({
        autosuggest: 1,
        related: 1,
        trending: 1,
      });
      expect(result.collectionDetails).toEqual(mockCollectionDetails);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(service['performRealScraping']).toHaveBeenCalledWith(
        scrapeDto.query,
        scrapeDto.types,
        scrapeDto.maxResults,
      );
      expect(service['saveCollectionLogs']).toHaveBeenCalledWith(
        scrapeDto.query,
        mockScrapedKeywords,
      );
    });

    it('빈 키워드 배열이 반환되어도 정상 처리해야 함', async () => {
      // Given
      const scrapeDto = {
        query: '존재하지않는키워드',
        types: ['autosuggest'],
        maxResults: 10,
      };

      const mockEmptyCollectionDetails = {
        autosuggest: {
          status: 'no_content',
          message: '해당 키워드에 대한 자동완성 데이터가 존재하지 않습니다',
          count: 0,
        },
      };

      jest.spyOn(service as any, 'performRealScraping').mockResolvedValue({
        keywords: [],
        collectionDetails: mockEmptyCollectionDetails,
      });
      jest.spyOn(service as any, 'saveCollectionLogs').mockResolvedValue(undefined);

      // When
      const result = await service.scrapeKeywords(scrapeDto);

      // Then
      expect(result.query).toBe(scrapeDto.query);
      expect(result.totalKeywords).toBe(0);
      expect(result.keywords).toEqual([]);
      expect(result.categories).toEqual({});
      expect(result.collectionDetails).toEqual(mockEmptyCollectionDetails);
    });
  });

  describe('getCollectionLogs', () => {
    it('수집 로그를 페이지네이션으로 조회해야 함', async () => {
      // Given
      const query = '맛집';
      const page = 1;
      const limit = 20;

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 1,
              baseQuery: '맛집',
              collectedKeyword: '맛집 추천',
              searchVolume: 10000,
              collectedAt: new Date(),
            },
            {
              id: 2,
              baseQuery: '맛집',
              collectedKeyword: '서울 맛집',
              searchVolume: 15000,
              collectedAt: new Date(),
            },
          ],
          2,
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // When
      const result = await service.getCollectionLogs(query, page, limit);

      // Then
      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'log.baseQuery LIKE :query OR log.collectedKeyword LIKE :query',
        { query: `%${query}%` },
      );
    });

    it('쿼리 없이 전체 로그를 조회해야 함', async () => {
      // Given
      const page = 1;
      const limit = 20;

      const mockQueryBuilder = {
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // When
      const result = await service.getCollectionLogs(undefined, page, limit);

      // Then
      expect(result.logs).toBeDefined();
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });
  });

  describe('getScrapingStats', () => {
    it('수집 통계를 성공적으로 조회해야 함', async () => {
      // Given
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2024-01-01', collectionType: 'related_search', count: 150 },
          { date: '2024-01-02', collectionType: 'smartblock', count: 120 },
          { date: '2024-01-03', collectionType: 'trending', count: 200 },
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // When
      const result = await service.getScrapingStats();

      // Then
      expect(result.period).toBeDefined();
      expect(result.totalKeywords).toBeDefined();
      expect(result.dailyStats).toBeDefined();
      expect(Array.isArray(result.dailyStats)).toBe(true);
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.groupBy).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
