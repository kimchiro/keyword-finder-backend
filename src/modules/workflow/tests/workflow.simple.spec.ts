import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowService } from '../workflow.service';
import { NaverApiService } from '../../naver-api/naver-api.service';
import { ScrapingService } from '../../scraping/scraping.service';
import { KeywordAnalysisService } from '../../keyword-analysis/keyword-analysis.service';
import { AppConfigService } from '../../../config/app.config';

describe('WorkflowService - 간단한 테스트', () => {
  let service: WorkflowService;
  let naverApiService: any;
  let scrapingService: any;
  let keywordAnalysisService: any;

  beforeEach(async () => {
    const mockNaverApiService = {
      getIntegratedData: jest.fn(),
      getDatalab: jest.fn(),
    };

    const mockScrapingService = {
      scrapeKeywords: jest.fn(),
      getScrapingStats: jest.fn(),
    };

    const mockKeywordAnalysisService = {
      saveScrapingData: jest.fn(),
      getScrapedKeywords: jest.fn(),
      analyzeKeyword: jest.fn(),
      getKeywordAnalysis: jest.fn(),
    };

    const mockAppConfigService = {
      scrapingMaxResults: 10,
      scrapingMaxKeywordsPerType: 5,
      defaultStartDate: '2024-09-01',
      defaultEndDate: '2025-09-01',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: NaverApiService,
          useValue: mockNaverApiService,
        },
        {
          provide: ScrapingService,
          useValue: mockScrapingService,
        },
        {
          provide: KeywordAnalysisService,
          useValue: mockKeywordAnalysisService,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    naverApiService = module.get(NaverApiService);
    scrapingService = module.get(ScrapingService);
    keywordAnalysisService = module.get(KeywordAnalysisService);
  });

  describe('서비스 초기화', () => {
    it('워크플로우 서비스가 정의되어야 함', () => {
      expect(service).toBeDefined();
    });

    it('의존성 서비스들이 주입되어야 함', () => {
      expect(naverApiService).toBeDefined();
      expect(scrapingService).toBeDefined();
      expect(keywordAnalysisService).toBeDefined();
    });
  });

  describe('executeCompleteWorkflow - 성공 케이스', () => {
    it('완전한 워크플로우가 성공적으로 실행되어야 함', async () => {
      // Mock 데이터 설정 (타입 체크 우회)
      const mockScrapingResult = {
        query: '맛집',
        totalKeywords: 3,
        executionTime: 2.5,
        categories: { smartblock: 2, related_search: 1 },
        keywords: [
          { keyword: '맛집 추천', category: 'smartblock', rank: 1 },
          { keyword: '맛집 리스트', category: 'smartblock', rank: 2 },
          { keyword: '서울 맛집', category: 'related_search', rank: 1 }
        ],
        collectionDetails: {}
      };

      const mockNaverApiResult = {
        success: true,
        data: {
          query: '맛집',
          blogSearch: { total: 1000, items: [] },
          datalab: { results: [] },
          timestamp: new Date().toISOString()
        }
      };

      const mockAnalysisResult = {
        analytics: { keyword: '맛집', monthlySearchTotal: 10000 },
        relatedKeywords: [],
        chartData: { searchTrends: [] }
      };

      const mockScrapedKeywords = [
        { keyword: '맛집 추천', category: 'smartblock', rankPosition: 1 },
        { keyword: '맛집 리스트', category: 'smartblock', rankPosition: 2 },
        { keyword: '서울 맛집', category: 'related_search', rankPosition: 1 }
      ];

      // Mock 함수 설정
      scrapingService.scrapeKeywords.mockResolvedValue(mockScrapingResult);
      keywordAnalysisService.saveScrapingData.mockResolvedValue(undefined);
      keywordAnalysisService.getScrapedKeywords.mockResolvedValue(mockScrapedKeywords);
      naverApiService.getIntegratedData.mockResolvedValue(mockNaverApiResult);
      naverApiService.getDatalab.mockResolvedValue({ success: true, data: { results: [] } });
      keywordAnalysisService.analyzeKeyword.mockResolvedValue(mockAnalysisResult);

      // 테스트 실행
      const result = await service.executeCompleteWorkflow('맛집');

      // 검증
      expect(result.success).toBe(true);
      expect(result.data.query).toBe('맛집');
      expect(result.data.topKeywords).toEqual(['맛집 추천', '맛집 리스트', '서울 맛집']);
      expect(result.data.keywordsWithRank).toHaveLength(3);
      expect(result.data.executionTime).toBeGreaterThan(0);
      expect(result.message).toBe('키워드 분석 워크플로우가 성공적으로 완료되었습니다.');

      // Mock 호출 검증
      expect(scrapingService.scrapeKeywords).toHaveBeenCalledWith({
        query: '맛집',
        types: ['smartblock', 'related_search'],
        maxResults: 10,
      });
      expect(keywordAnalysisService.saveScrapingData).toHaveBeenCalledWith('맛집', mockScrapingResult);
      expect(keywordAnalysisService.getScrapedKeywords).toHaveBeenCalledWith('맛집');
      expect(naverApiService.getIntegratedData).toHaveBeenCalledWith('맛집');
    });

    it('추출된 키워드가 없을 때도 처리되어야 함', async () => {
      // Mock 설정
      scrapingService.scrapeKeywords.mockResolvedValue({
        query: '테스트',
        totalKeywords: 0,
        keywords: [],
        collectionDetails: {}
      });
      keywordAnalysisService.saveScrapingData.mockResolvedValue(undefined);
      keywordAnalysisService.getScrapedKeywords.mockResolvedValue([]);
      naverApiService.getIntegratedData.mockResolvedValue({
        success: true,
        data: { query: '테스트', blogSearch: {}, datalab: {}, timestamp: '' }
      });
      keywordAnalysisService.analyzeKeyword.mockResolvedValue({
        analytics: {},
        relatedKeywords: [],
        chartData: {}
      });

      const result = await service.executeCompleteWorkflow('테스트');

      expect(result.success).toBe(true);
      expect(result.data.topKeywords).toEqual([]);
      expect(result.data.keywordsWithRank).toEqual([]);
      expect(naverApiService.getDatalab).not.toHaveBeenCalled();
    });
  });

  describe('executeCompleteWorkflow - 실패 케이스', () => {
    it('스크래핑 실패 시 에러를 반환해야 함', async () => {
      scrapingService.scrapeKeywords.mockRejectedValue(new Error('스크래핑 실패'));

      const result = await service.executeCompleteWorkflow('실패테스트');

      expect(result.success).toBe(false);
      expect(result.message).toContain('워크플로우 실행 중 오류가 발생했습니다');
      expect(result.data.naverApiData).toBeNull();
      expect(result.data.scrapingData).toBeNull();
    });

    it('스크래핑 데이터가 null일 때 에러를 반환해야 함', async () => {
      scrapingService.scrapeKeywords.mockResolvedValue(null);

      const result = await service.executeCompleteWorkflow('null테스트');

      expect(result.success).toBe(false);
      expect(result.message).toContain('스크래핑 데이터를 가져올 수 없습니다');
    });

    it('스크래핑 키워드가 없을 때 에러를 반환해야 함', async () => {
      scrapingService.scrapeKeywords.mockResolvedValue({
        query: '테스트',
        keywords: null
      });

      const result = await service.executeCompleteWorkflow('키워드없음테스트');

      expect(result.success).toBe(false);
      expect(result.message).toContain('스크래핑 데이터를 가져올 수 없습니다');
    });
  });

  describe('executeQuickAnalysis', () => {
    it('빠른 분석이 성공해야 함', async () => {
      naverApiService.getIntegratedData.mockResolvedValue({
        success: true,
        data: { query: '빠른테스트', blogSearch: {}, datalab: {}, timestamp: '' }
      });

      const result = await service.executeQuickAnalysis('빠른테스트');

      expect(result.success).toBe(true);
      expect(result.data.query).toBe('빠른테스트');
      expect(result.data.scrapingData).toBeNull();
      expect(result.data.analysisData).toBeNull();
      expect(result.message).toBe('빠른 키워드 분석이 완료되었습니다.');
    });

    it('네이버 API 실패 시 에러를 반환해야 함', async () => {
      naverApiService.getIntegratedData.mockRejectedValue(new Error('API 실패'));

      const result = await service.executeQuickAnalysis('실패테스트');

      expect(result.success).toBe(false);
      expect(result.message).toContain('빠른 분석 중 오류가 발생했습니다');
    });
  });

  describe('executeScrapingOnly', () => {
    it('스크래핑 전용 워크플로우가 성공해야 함', async () => {
      const mockScrapingResult = {
        query: '스크래핑테스트',
        totalKeywords: 2,
        keywords: [
          { keyword: '테스트1', category: 'trending' },
          { keyword: '테스트2', category: 'smartblock' }
        ],
        collectionDetails: {}
      };

      scrapingService.scrapeKeywords.mockResolvedValue(mockScrapingResult);

      const result = await service.executeScrapingOnly('스크래핑테스트');

      expect(result.success).toBe(true);
      expect(result.data.query).toBe('스크래핑테스트');
      expect(result.data.naverApiData).toBeNull();
      expect(result.data.analysisData).toBeNull();
      expect(result.data.scrapingData).toEqual(mockScrapingResult);
      expect(result.message).toBe('키워드 스크래핑이 완료되었습니다.');

      expect(scrapingService.scrapeKeywords).toHaveBeenCalledWith({
        query: '스크래핑테스트',
        types: ['trending', 'smartblock'],
        maxResults: 20, // 2배
      });
    });

    it('스크래핑 실패 시 에러를 반환해야 함', async () => {
      scrapingService.scrapeKeywords.mockRejectedValue(new Error('스크래핑 오류'));

      const result = await service.executeScrapingOnly('실패테스트');

      expect(result.success).toBe(false);
      expect(result.message).toContain('스크래핑 워크플로우 실행 중 오류가 발생했습니다');
    });
  });

  describe('checkWorkflowHealth', () => {
    it('모든 서비스가 정상일 때 전체 상태가 true여야 함', async () => {
      naverApiService.getIntegratedData.mockResolvedValue({ success: true });
      scrapingService.getScrapingStats.mockResolvedValue({ totalKeywords: 100 });
      keywordAnalysisService.getKeywordAnalysis.mockResolvedValue({ success: true });

      const result = await service.checkWorkflowHealth();

      expect(result.naverApi).toBe(true);
      expect(result.scraping).toBe(true);
      expect(result.analysis).toBe(true);
      expect(result.overall).toBe(true);
    });

    it('일부 서비스 실패 시 해당 상태가 false여야 함', async () => {
      naverApiService.getIntegratedData.mockRejectedValue(new Error('API 오류'));
      scrapingService.getScrapingStats.mockResolvedValue({ totalKeywords: 100 });
      keywordAnalysisService.getKeywordAnalysis.mockResolvedValue({ success: true });

      const result = await service.checkWorkflowHealth();

      expect(result.naverApi).toBe(false);
      expect(result.scraping).toBe(true);
      expect(result.analysis).toBe(true);
      expect(result.overall).toBe(false);
    });
  });
});
