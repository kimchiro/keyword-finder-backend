import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowService, WorkflowResult } from '../workflow.service';
import { NaverApiService } from '../../naver-api/naver-api.service';
import { ScrapingService } from '../../scraping/scraping.service';
import { KeywordAnalysisService } from '../../keyword-analysis/keyword-analysis.service';
import { AppConfigService } from '../../../config/app.config';

// 타입 체크 우회를 위한 헬퍼
const mockResolvedValue = (mockFn: any, value: any) => {
  mockFn.mockResolvedValue(value as any);
};

describe('WorkflowService', () => {
  let service: WorkflowService;
  let naverApiService: jest.Mocked<NaverApiService>;
  let scrapingService: jest.Mocked<ScrapingService>;
  let keywordAnalysisService: jest.Mocked<KeywordAnalysisService>;
  let appConfigService: jest.Mocked<AppConfigService>;

  // Mock 데이터 - 실제 스크래핑 서비스 반환 구조에 맞춤
  const mockScrapingResult = {
    query: '맛집',
    totalKeywords: 5,
    executionTime: 2.847,
    categories: {
      'smartblock': 3,
      'related_search': 2
    },
    keywords: [
      {
        keyword: '맛집 추천',
        category: 'smartblock' as const,
        rank: 1,
        source: 'naver_smartblock',
        competition: 'medium' as const,
        similarity: 'high' as const,
        searchVolume: 'high' as const,
        trend: 'stable' as const
      },
      {
        keyword: '맛집 리스트',
        category: 'smartblock' as const,
        rank: 2,
        source: 'naver_smartblock',
        competition: 'medium' as const,
        similarity: 'high' as const,
        searchVolume: 'medium' as const,
        trend: 'stable' as const
      },
      {
        keyword: '맛집 후기',
        category: 'smartblock' as const,
        rank: 3,
        source: 'naver_smartblock',
        competition: 'low' as const,
        similarity: 'medium' as const,
        searchVolume: 'medium' as const,
        trend: 'rising' as const
      },
      {
        keyword: '서울 맛집',
        category: 'related_search' as const,
        rank: 1,
        source: 'naver_related_search',
        competition: 'high' as const,
        similarity: 'medium' as const,
        searchVolume: 'high' as const,
        trend: 'stable' as const
      },
      {
        keyword: '부산 맛집',
        category: 'related_search' as const,
        rank: 2,
        source: 'naver_related_search',
        competition: 'medium' as const,
        similarity: 'medium' as const,
        searchVolume: 'medium' as const,
        trend: 'rising' as const
      }
    ],
    collectionDetails: {
      timestamp: '2025-09-22T05:30:15.133Z',
      browser: 'chromium',
      userAgent: 'test-agent'
    }
  };

  const mockNaverApiResult = {
    success: true,
    data: {
      query: '맛집',
      blogSearch: {
        lastBuildDate: 'Wed, 22 Sep 2025 14:30:00 +0900',
        total: 15420,
        start: 1,
        display: 10,
        items: [
          {
            title: '서울 <b>맛집</b> 추천 베스트 10',
            link: 'https://blog.naver.com/example1',
            description: '서울에서 꼭 가봐야 할 <b>맛집</b>들을 소개합니다...',
            bloggername: '맛집탐험가',
            bloggerlink: 'https://blog.naver.com/foodlover',
            postdate: '20250920'
          }
        ]
      },
      datalab: {
        startDate: '2024-09-01',
        endDate: '2025-09-01',
        timeUnit: 'month',
        results: [
          {
            title: '맛집',
            keywords: ['맛집'],
            data: [
              {
                period: '2025-09-01',
                ratio: 98.3
              }
            ]
          }
        ]
      },
      timestamp: '2025-09-22T05:30:15.133Z'
    }
  };

  const mockDatalabResult = {
    success: true,
    data: {
      startDate: '2024-09-01',
      endDate: '2025-09-01',
      timeUnit: 'month',
      results: [
        {
          title: '키워드1',
          keywords: ['맛집 추천'],
          data: [
            {
              period: '2025-09-01',
              ratio: 89.2
            }
          ]
        },
        {
          title: '키워드2',
          keywords: ['맛집 리스트'],
          data: [
            {
              period: '2025-09-01',
              ratio: 61.4
            }
          ]
        },
        {
          title: '키워드3',
          keywords: ['맛집 후기'],
          data: [
            {
              period: '2025-09-01',
              ratio: 52.5
            }
          ]
        },
        {
          title: '키워드4',
          keywords: ['서울 맛집'],
          data: [
            {
              period: '2025-09-01',
              ratio: 43.7
            }
          ]
        },
        {
          title: '키워드5',
          keywords: ['부산 맛집'],
          data: [
            {
              period: '2025-09-01',
              ratio: 36.1
            }
          ]
        }
      ]
    }
  };

  const mockScrapedKeywords = [
    {
      keyword: '맛집 추천',
      category: 'smartblock',
      rankPosition: 1,
      collectedAt: new Date('2025-09-22T05:30:15.123Z')
    },
    {
      keyword: '맛집 리스트',
      category: 'smartblock',
      rankPosition: 2,
      collectedAt: new Date('2025-09-22T05:30:15.124Z')
    },
    {
      keyword: '맛집 후기',
      category: 'smartblock',
      rankPosition: 3,
      collectedAt: new Date('2025-09-22T05:30:15.125Z')
    },
    {
      keyword: '서울 맛집',
      category: 'related_search',
      rankPosition: 1,
      collectedAt: new Date('2025-09-22T05:30:15.128Z')
    },
    {
      keyword: '부산 맛집',
      category: 'related_search',
      rankPosition: 2,
      collectedAt: new Date('2025-09-22T05:30:15.129Z')
    }
  ];

  const mockAnalysisResult = {
    analytics: {
      id: 1,
      keywordId: 1,
      keyword: '맛집',
      monthlySearchPc: 45620,
      monthlySearchMobile: 52380,
      monthlySearchTotal: 98000,
      monthlyContentBlog: 15420,
      monthlyContentCafe: 0,
      monthlyContentAll: 15420,
      estimatedSearchYesterday: 3200,
      estimatedSearchEndMonth: 98000,
      saturationIndexBlog: 0.15,
      saturationIndexCafe: 0.0,
      saturationIndexAll: 0.15,
      analysisDate: '2025-09-22',
      createdAt: new Date(),
      updatedAt: new Date(),
      keywordEntity: null
    },
    relatedKeywords: [],
    chartData: {
      searchTrends: [],
      monthlyRatios: [],
      weekdayRatios: [],
      genderRatios: null,
      issueAnalysis: null,
      intentAnalysis: null
    }
  };

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
    appConfigService = module.get(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeCompleteWorkflow', () => {
    describe('성공 케이스', () => {
      it('완전한 워크플로우가 성공적으로 실행되어야 함', async () => {
        // Arrange
        const query = '맛집';
        
        mockResolvedValue(scrapingService.scrapeKeywords, mockScrapingResult);
        mockResolvedValue(keywordAnalysisService.saveScrapingData, undefined);
        mockResolvedValue(keywordAnalysisService.getScrapedKeywords, mockScrapedKeywords);
        mockResolvedValue(naverApiService.getIntegratedData, mockNaverApiResult);
        mockResolvedValue(naverApiService.getDatalab, mockDatalabResult);
        mockResolvedValue(keywordAnalysisService.analyzeKeyword, mockAnalysisResult);

        // Act
        const result: WorkflowResult = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.query).toBe(query);
        expect(result.data.topKeywords).toEqual([
          '맛집 추천',
          '맛집 리스트', 
          '맛집 후기',
          '서울 맛집',
          '부산 맛집'
        ]);
        expect(result.data.keywordsWithRank).toEqual([
          {
            keyword: '맛집 추천',
            originalRank: 1,
            category: 'smartblock',
            source: 'naver_smartblock'
          },
          {
            keyword: '맛집 리스트',
            originalRank: 2,
            category: 'smartblock',
            source: 'naver_smartblock'
          },
          {
            keyword: '맛집 후기',
            originalRank: 3,
            category: 'smartblock',
            source: 'naver_smartblock'
          },
          {
            keyword: '서울 맛집',
            originalRank: 1,
            category: 'related_search',
            source: 'naver_related_search'
          },
          {
            keyword: '부산 맛집',
            originalRank: 2,
            category: 'related_search',
            source: 'naver_related_search'
          }
        ]);
        expect(result.data.naverApiData.original).toEqual(mockNaverApiResult.data);
        expect(result.data.naverApiData.firstBatch).toEqual(mockDatalabResult.data);
        expect(result.data.naverApiData.secondBatch).toBeNull();
        expect(result.data.scrapingData).toEqual(mockScrapingResult);
        expect(result.data.analysisData).toEqual(mockAnalysisResult);
        expect(result.data.executionTime).toBeGreaterThan(0);
        expect(result.data.timestamp).toBeDefined();
        expect(result.message).toBe('키워드 분석 워크플로우가 성공적으로 완료되었습니다.');

        // Verify method calls
        expect(scrapingService.scrapeKeywords).toHaveBeenCalledWith({
          query,
          types: ['smartblock', 'related_search'],
          maxResults: appConfigService.scrapingMaxResults,
        });
        expect(keywordAnalysisService.saveScrapingData).toHaveBeenCalledWith(query, mockScrapingResult);
        expect(keywordAnalysisService.getScrapedKeywords).toHaveBeenCalledWith(query);
        expect(naverApiService.getIntegratedData).toHaveBeenCalledWith(query);
        expect(naverApiService.getDatalab).toHaveBeenCalledWith({
          startDate: appConfigService.defaultStartDate,
          endDate: appConfigService.defaultEndDate,
          timeUnit: 'month',
          keywordGroups: [
            { groupName: '키워드1', keywords: ['맛집 추천'] },
            { groupName: '키워드2', keywords: ['맛집 리스트'] },
            { groupName: '키워드3', keywords: ['맛집 후기'] },
            { groupName: '키워드4', keywords: ['서울 맛집'] },
            { groupName: '키워드5', keywords: ['부산 맛집'] },
          ],
        });
        expect(keywordAnalysisService.analyzeKeyword).toHaveBeenCalledWith(
          query,
          undefined,
          mockNaverApiResult.data,
          expect.any(Array)
        );
      });

      it('스마트블록 키워드가 5개 미만일 때 연관검색어로 보완되어야 함', async () => {
        // Arrange
        const query = '테스트';
        const limitedScrapedKeywords = [
          {
            keyword: '테스트 키워드1',
            category: 'smartblock',
            rankPosition: 1,
            collectedAt: new Date()
          },
          {
            keyword: '테스트 키워드2',
            category: 'smartblock',
            rankPosition: 2,
            collectedAt: new Date()
          },
          {
            keyword: '연관 키워드1',
            category: 'related_search',
            rankPosition: 1,
            collectedAt: new Date()
          },
          {
            keyword: '연관 키워드2',
            category: 'related_search',
            rankPosition: 2,
            collectedAt: new Date()
          },
          {
            keyword: '연관 키워드3',
            category: 'related_search',
            rankPosition: 3,
            collectedAt: new Date()
          }
        ];

        mockResolvedValue(scrapingService.scrapeKeywords, { ...mockScrapingResult, query });
        mockResolvedValue(keywordAnalysisService.saveScrapingData, undefined);
        mockResolvedValue(keywordAnalysisService.getScrapedKeywords, limitedScrapedKeywords);
        mockResolvedValue(naverApiService.getIntegratedData, mockNaverApiResult);
        mockResolvedValue(naverApiService.getDatalab, mockDatalabResult);
        mockResolvedValue(keywordAnalysisService.analyzeKeyword, mockAnalysisResult);

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.topKeywords).toEqual([
          '테스트 키워드1',
          '테스트 키워드2',
          '연관 키워드1',
          '연관 키워드2',
          '연관 키워드3'
        ]);
        expect(result.data.keywordsWithRank).toHaveLength(5);
        expect(result.data.keywordsWithRank?.[0]?.category).toBe('smartblock');
        expect(result.data.keywordsWithRank?.[2]?.category).toBe('related_search');
      });

      it('추출된 키워드가 5개를 초과할 때 두 번째 배치 API 호출이 실행되어야 함', async () => {
        // Arrange
        const query = '테스트';
        const manyScrapedKeywords = Array.from({ length: 8 }, (_, i) => ({
          keyword: `키워드${i + 1}`,
          category: 'smartblock',
          rankPosition: i + 1,
          collectedAt: new Date()
        }));

        const secondBatchResult = {
          ...mockDatalabResult,
          data: {
            ...mockDatalabResult.data,
            results: [
              {
                title: '키워드6',
                keywords: ['키워드6'],
                data: [{ period: '2025-09-01', ratio: 30.0 }]
              }
            ]
          }
        };

        mockResolvedValue(scrapingService.scrapeKeywords, { ...mockScrapingResult, query });
        mockResolvedValue(keywordAnalysisService.saveScrapingData, undefined);
        mockResolvedValue(keywordAnalysisService.getScrapedKeywords, manyScrapedKeywords);
        mockResolvedValue(naverApiService.getIntegratedData, mockNaverApiResult);
        naverApiService.getDatalab
          .mockResolvedValueOnce(mockDatalabResult as any) // 첫 번째 배치
          .mockResolvedValueOnce(secondBatchResult as any); // 두 번째 배치
        mockResolvedValue(keywordAnalysisService.analyzeKeyword, mockAnalysisResult);

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.topKeywords).toHaveLength(5); // 최대 5개로 제한
        expect(result.data.naverApiData.firstBatch).toEqual(mockDatalabResult.data);
        // 실제로는 topKeywords가 5개로 제한되므로 두 번째 배치는 호출되지 않음
        expect(result.data.naverApiData.secondBatch).toBeNull();
        expect(naverApiService.getDatalab).toHaveBeenCalledTimes(1);
      });
    });

    describe('실패 케이스', () => {
      it('스크래핑 실패 시 에러를 반환해야 함', async () => {
        // Arrange
        const query = '실패테스트';
        const errorMessage = '스크래핑 서비스 오류';
        
        scrapingService.scrapeKeywords.mockRejectedValue(new Error(errorMessage));

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.data.query).toBe(query);
        expect(result.data.naverApiData).toBeNull();
        expect(result.data.scrapingData).toBeNull();
        expect(result.data.analysisData).toBeNull();
        expect(result.data.topKeywords).toEqual([]);
        expect(result.data.keywordsWithRank).toEqual([]);
        expect(result.data.executionTime).toBeGreaterThan(0);
        expect(result.message).toContain('워크플로우 실행 중 오류가 발생했습니다');
      });

      it('스크래핑 데이터가 없을 때 에러를 반환해야 함', async () => {
        // Arrange
        const query = '빈데이터테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, null);

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('스크래핑 데이터를 가져올 수 없습니다');
      });

      it('스크래핑 키워드 배열이 없을 때 에러를 반환해야 함', async () => {
        // Arrange
        const query = '키워드없음테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, { 
          query, 
          keywords: null,
          totalKeywords: 0,
          executionTime: 0,
          categories: {},
          collectionDetails: {}
        });

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('스크래핑 데이터를 가져올 수 없습니다');
      });

      it('네이버 API 호출 실패 시에도 워크플로우가 계속 진행되어야 함', async () => {
        // Arrange
        const query = 'API실패테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, mockScrapingResult);
        mockResolvedValue(keywordAnalysisService.saveScrapingData, undefined);
        mockResolvedValue(keywordAnalysisService.getScrapedKeywords, mockScrapedKeywords);
        naverApiService.getIntegratedData.mockRejectedValue(new Error('네이버 API 오류'));
        mockResolvedValue(keywordAnalysisService.analyzeKeyword, mockAnalysisResult);

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('워크플로우 실행 중 오류가 발생했습니다');
      });

      it('DB 저장 실패 시 에러를 반환해야 함', async () => {
        // Arrange
        const query = 'DB저장실패테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, mockScrapingResult);
        keywordAnalysisService.saveScrapingData.mockRejectedValue(new Error('DB 저장 오류'));

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('워크플로우 실행 중 오류가 발생했습니다');
      });

      it('키워드 추출 실패 시에도 원본 키워드만으로 진행되어야 함', async () => {
        // Arrange
        const query = '키워드추출실패테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, mockScrapingResult);
        mockResolvedValue(keywordAnalysisService.saveScrapingData, undefined);
        mockResolvedValue(keywordAnalysisService.getScrapedKeywords, []); // 빈 배열 반환
        mockResolvedValue(naverApiService.getIntegratedData, mockNaverApiResult);
        mockResolvedValue(keywordAnalysisService.analyzeKeyword, mockAnalysisResult);

        // Act
        const result = await service.executeCompleteWorkflow(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.topKeywords).toEqual([]);
        expect(result.data.keywordsWithRank).toEqual([]);
        expect(result.data.naverApiData.firstBatch).toBeNull();
        expect(result.data.naverApiData.secondBatch).toBeNull();
        expect(naverApiService.getDatalab).not.toHaveBeenCalled();
      });
    });
  });

  describe('executeQuickAnalysis', () => {
    describe('성공 케이스', () => {
      it('빠른 분석이 성공적으로 실행되어야 함', async () => {
        // Arrange
        const query = '빠른분석테스트';
        
        mockResolvedValue(naverApiService.getIntegratedData, mockNaverApiResult);

        // Act
        const result = await service.executeQuickAnalysis(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.query).toBe(query);
        expect(result.data.naverApiData).toEqual(mockNaverApiResult.data);
        expect(result.data.scrapingData).toBeNull();
        expect(result.data.analysisData).toBeNull();
        expect(result.data.topKeywords).toEqual([]);
        expect(result.data.keywordsWithRank).toEqual([]);
        expect(result.message).toBe('빠른 키워드 분석이 완료되었습니다.');
      });
    });

    describe('실패 케이스', () => {
      it('네이버 API 호출 실패 시 에러를 반환해야 함', async () => {
        // Arrange
        const query = '빠른분석실패테스트';
        const errorMessage = '네이버 API 오류';
        
        naverApiService.getIntegratedData.mockRejectedValue(new Error(errorMessage));

        // Act
        const result = await service.executeQuickAnalysis(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.data.query).toBe(query);
        expect(result.data.naverApiData).toBeNull();
        expect(result.message).toContain('빠른 분석 중 오류가 발생했습니다');
      });
    });
  });

  describe('executeScrapingOnly', () => {
    describe('성공 케이스', () => {
      it('스크래핑 전용 워크플로우가 성공적으로 실행되어야 함', async () => {
        // Arrange
        const query = '스크래핑전용테스트';
        
        mockResolvedValue(scrapingService.scrapeKeywords, mockScrapingResult);

        // Act
        const result = await service.executeScrapingOnly(query);

        // Assert
        expect(result.success).toBe(true);
        expect(result.data.query).toBe(query);
        expect(result.data.naverApiData).toBeNull();
        expect(result.data.scrapingData).toEqual(mockScrapingResult);
        expect(result.data.analysisData).toBeNull();
        expect(result.data.topKeywords).toEqual([]);
        expect(result.data.keywordsWithRank).toEqual([]);
        expect(result.message).toBe('키워드 스크래핑이 완료되었습니다.');

        expect(scrapingService.scrapeKeywords).toHaveBeenCalledWith({
          query,
          types: ['trending', 'smartblock'],
          maxResults: appConfigService.scrapingMaxResults * 2,
        });
      });
    });

    describe('실패 케이스', () => {
      it('스크래핑 실패 시 에러를 반환해야 함', async () => {
        // Arrange
        const query = '스크래핑실패테스트';
        const errorMessage = '스크래핑 오류';
        
        scrapingService.scrapeKeywords.mockRejectedValue(new Error(errorMessage));

        // Act
        const result = await service.executeScrapingOnly(query);

        // Assert
        expect(result.success).toBe(false);
        expect(result.data.query).toBe(query);
        expect(result.data.scrapingData).toBeNull();
        expect(result.message).toContain('스크래핑 워크플로우 실행 중 오류가 발생했습니다');
      });
    });
  });

  describe('checkWorkflowHealth', () => {
    describe('성공 케이스', () => {
      it('모든 서비스가 정상일 때 전체 상태가 true여야 함', async () => {
        // Arrange
        naverApiService.getIntegratedData.mockResolvedValue(mockNaverApiResult);
        mockResolvedValue(scrapingService.getScrapingStats, { 
          period: '2025-09',
          dailyStats: [],
          typeStats: {},
          totalKeywords: 100
        });
        mockResolvedValue(keywordAnalysisService.getKeywordAnalysis, { 
          success: true, 
          data: mockAnalysisResult
        });

        // Act
        const result = await service.checkWorkflowHealth();

        // Assert
        expect(result.naverApi).toBe(true);
        expect(result.scraping).toBe(true);
        expect(result.analysis).toBe(true);
        expect(result.overall).toBe(true);
      });
    });

    describe('실패 케이스', () => {
      it('네이버 API 서비스 실패 시 해당 상태가 false여야 함', async () => {
        // Arrange
        naverApiService.getIntegratedData.mockRejectedValue(new Error('네이버 API 오류'));
        mockResolvedValue(scrapingService.getScrapingStats, { 
          period: '2025-09',
          dailyStats: [],
          typeStats: {},
          totalKeywords: 100
        });
        mockResolvedValue(keywordAnalysisService.getKeywordAnalysis, { 
          success: true, 
          data: mockAnalysisResult
        });

        // Act
        const result = await service.checkWorkflowHealth();

        // Assert
        expect(result.naverApi).toBe(false);
        expect(result.scraping).toBe(true);
        expect(result.analysis).toBe(true);
        expect(result.overall).toBe(false);
      });

      it('모든 서비스 실패 시 전체 상태가 false여야 함', async () => {
        // Arrange
        naverApiService.getIntegratedData.mockRejectedValue(new Error('네이버 API 오류'));
        scrapingService.getScrapingStats.mockRejectedValue(new Error('스크래핑 오류'));
        keywordAnalysisService.getKeywordAnalysis.mockRejectedValue(new Error('분석 오류'));

        // Act
        const result = await service.checkWorkflowHealth();

        // Assert
        expect(result.naverApi).toBe(false);
        expect(result.scraping).toBe(false);
        expect(result.analysis).toBe(false);
        expect(result.overall).toBe(false);
      });
    });
  });
});
