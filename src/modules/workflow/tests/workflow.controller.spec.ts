import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { WorkflowController } from '../workflow.controller';
import { WorkflowService, WorkflowResult } from '../workflow.service';

describe('WorkflowController', () => {
  let controller: WorkflowController;
  let workflowService: jest.Mocked<WorkflowService>;

  // Mock 성공 응답 데이터
  const mockSuccessResult: WorkflowResult = {
    success: true,
    data: {
      query: '맛집',
      naverApiData: {
        original: {
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
          }
        },
        firstBatch: {
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
            }
          ]
        },
        secondBatch: null
      },
      scrapingData: {
        query: '맛집',
        keywords: [
          {
            keyword: '맛집 추천',
            category: 'smartblock',
            rankPosition: 1,
            source: 'naver_smartblock',
            scrapedAt: '2025-09-22T05:30:15.123Z'
          }
        ],
        totalCount: 1,
        scrapingTime: 2.847,
        timestamp: '2025-09-22T05:30:15.133Z'
      },
      analysisData: {
        keyword: '맛집',
        analysisDate: '2025-09-22',
        analytics: {
          monthlySearchPc: 45620,
          monthlySearchMobile: 52380,
          monthlySearchTotal: 98000,
          monthlyContentBlog: 15420
        }
      },
      topKeywords: ['맛집 추천', '맛집 리스트', '맛집 후기'],
      keywordsWithRank: [
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
        }
      ],
      executionTime: 15.247,
      timestamp: '2025-09-22T05:30:18.370Z'
    },
    message: '키워드 분석 워크플로우가 성공적으로 완료되었습니다.'
  };

  // Mock 실패 응답 데이터
  const mockFailureResult: WorkflowResult = {
    success: false,
    data: {
      query: '실패테스트',
      naverApiData: null,
      scrapingData: null,
      analysisData: null,
      topKeywords: [],
      keywordsWithRank: [],
      executionTime: 2.5,
      timestamp: '2025-09-22T05:30:18.370Z'
    },
    message: '워크플로우 실행 중 오류가 발생했습니다: 스크래핑 서비스 오류'
  };

  beforeEach(async () => {
    const mockWorkflowService = {
      executeCompleteWorkflow: jest.fn(),
      executeQuickAnalysis: jest.fn(),
      executeScrapingOnly: jest.fn(),
      checkWorkflowHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: mockWorkflowService,
        },
      ],
    }).compile();

    controller = module.get<WorkflowController>(WorkflowController);
    workflowService = module.get(WorkflowService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executeCompleteWorkflow', () => {
    describe('성공 케이스', () => {
      it('완전한 워크플로우 실행이 성공해야 함', async () => {
        // Arrange
        const query = '맛집';
        workflowService.executeCompleteWorkflow.mockResolvedValue(mockSuccessResult);

        // Act
        const result = await controller.executeCompleteWorkflow(query);

        // Assert
        expect(result).toEqual(mockSuccessResult);
        expect(workflowService.executeCompleteWorkflow).toHaveBeenCalledWith(query);
        expect(workflowService.executeCompleteWorkflow).toHaveBeenCalledTimes(1);
      });

      it('특수문자가 포함된 키워드도 처리할 수 있어야 함', async () => {
        // Arrange
        const query = '맛집&카페';
        const specialCharResult = { ...mockSuccessResult, data: { ...mockSuccessResult.data, query } };
        workflowService.executeCompleteWorkflow.mockResolvedValue(specialCharResult);

        // Act
        const result = await controller.executeCompleteWorkflow(query);

        // Assert
        expect(result.data.query).toBe(query);
        expect(workflowService.executeCompleteWorkflow).toHaveBeenCalledWith(query);
      });

      it('긴 키워드도 처리할 수 있어야 함', async () => {
        // Arrange
        const query = '서울 강남구 역삼동 맛집 추천 베스트 리스트';
        const longQueryResult = { ...mockSuccessResult, data: { ...mockSuccessResult.data, query } };
        workflowService.executeCompleteWorkflow.mockResolvedValue(longQueryResult);

        // Act
        const result = await controller.executeCompleteWorkflow(query);

        // Assert
        expect(result.data.query).toBe(query);
        expect(workflowService.executeCompleteWorkflow).toHaveBeenCalledWith(query);
      });
    });

    describe('실패 케이스', () => {
      it('워크플로우 서비스에서 실패 결과를 반환할 때 HttpException을 던져야 함', async () => {
        // Arrange
        const query = '실패테스트';
        workflowService.executeCompleteWorkflow.mockResolvedValue(mockFailureResult);

        // Act & Assert
        await expect(controller.executeCompleteWorkflow(query)).rejects.toThrow(HttpException);
        
        try {
          await controller.executeCompleteWorkflow(query);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.getResponse()).toEqual({
            success: false,
            message: mockFailureResult.message,
            data: mockFailureResult.data,
          });
        }
      });

      it('워크플로우 서비스에서 예외가 발생할 때 HttpException을 던져야 함', async () => {
        // Arrange
        const query = '예외테스트';
        const errorMessage = '예상치 못한 오류';
        workflowService.executeCompleteWorkflow.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(controller.executeCompleteWorkflow(query)).rejects.toThrow(HttpException);
        
        try {
          await controller.executeCompleteWorkflow(query);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.getResponse()).toEqual({
            success: false,
            message: '워크플로우 실행 중 오류가 발생했습니다.',
            error: errorMessage,
          });
        }
      });

      it('빈 문자열 키워드에 대해서도 처리해야 함', async () => {
        // Arrange
        const query = '';
        const emptyQueryResult = { ...mockFailureResult, data: { ...mockFailureResult.data, query } };
        workflowService.executeCompleteWorkflow.mockResolvedValue(emptyQueryResult);

        // Act & Assert
        await expect(controller.executeCompleteWorkflow(query)).rejects.toThrow(HttpException);
      });

      it('null 키워드에 대해서도 처리해야 함', async () => {
        // Arrange
        const query = null as any;
        workflowService.executeCompleteWorkflow.mockRejectedValue(new Error('Invalid query'));

        // Act & Assert
        await expect(controller.executeCompleteWorkflow(query)).rejects.toThrow(HttpException);
      });
    });
  });

  describe('executeQuickAnalysis', () => {
    describe('성공 케이스', () => {
      it('빠른 분석이 성공해야 함', async () => {
        // Arrange
        const query = '빠른분석테스트';
        const quickAnalysisResult: WorkflowResult = {
          success: true,
          data: {
            query,
            naverApiData: mockSuccessResult.data.naverApiData.original,
            scrapingData: null,
            analysisData: null,
            topKeywords: [],
            keywordsWithRank: [],
            executionTime: 3.2,
            timestamp: '2025-09-22T05:30:18.370Z'
          },
          message: '빠른 키워드 분석이 완료되었습니다.'
        };
        
        workflowService.executeQuickAnalysis.mockResolvedValue(quickAnalysisResult);

        // Act
        const result = await controller.executeQuickAnalysis(query);

        // Assert
        expect(result).toEqual(quickAnalysisResult);
        expect(result.data.scrapingData).toBeNull();
        expect(result.data.analysisData).toBeNull();
        expect(result.data.topKeywords).toEqual([]);
        expect(result.data.keywordsWithRank).toEqual([]);
        expect(workflowService.executeQuickAnalysis).toHaveBeenCalledWith(query);
      });
    });

    describe('실패 케이스', () => {
      it('빠른 분석 실패 시 HttpException을 던져야 함', async () => {
        // Arrange
        const query = '빠른분석실패테스트';
        const errorMessage = '네이버 API 호출 실패';
        workflowService.executeQuickAnalysis.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(controller.executeQuickAnalysis(query)).rejects.toThrow(HttpException);
        
        try {
          await controller.executeQuickAnalysis(query);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.getResponse()).toEqual({
            success: false,
            message: '빠른 분석 중 오류가 발생했습니다.',
            error: errorMessage,
          });
        }
      });
    });
  });

  describe('executeScrapingOnly', () => {
    describe('성공 케이스', () => {
      it('스크래핑 전용 워크플로우가 성공해야 함', async () => {
        // Arrange
        const query = '스크래핑전용테스트';
        const scrapingOnlyResult: WorkflowResult = {
          success: true,
          data: {
            query,
            naverApiData: null,
            scrapingData: mockSuccessResult.data.scrapingData,
            analysisData: null,
            topKeywords: [],
            keywordsWithRank: [],
            executionTime: 5.8,
            timestamp: '2025-09-22T05:30:18.370Z'
          },
          message: '키워드 스크래핑이 완료되었습니다.'
        };
        
        workflowService.executeScrapingOnly.mockResolvedValue(scrapingOnlyResult);

        // Act
        const result = await controller.executeScrapingOnly(query);

        // Assert
        expect(result).toEqual(scrapingOnlyResult);
        expect(result.data.naverApiData).toBeNull();
        expect(result.data.analysisData).toBeNull();
        expect(result.data.scrapingData).toBeDefined();
        expect(workflowService.executeScrapingOnly).toHaveBeenCalledWith(query);
      });
    });

    describe('실패 케이스', () => {
      it('스크래핑 실패 시 HttpException을 던져야 함', async () => {
        // Arrange
        const query = '스크래핑실패테스트';
        const errorMessage = 'Playwright 브라우저 오류';
        workflowService.executeScrapingOnly.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(controller.executeScrapingOnly(query)).rejects.toThrow(HttpException);
        
        try {
          await controller.executeScrapingOnly(query);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.getResponse()).toEqual({
            success: false,
            message: '스크래핑 워크플로우 실행 중 오류가 발생했습니다.',
            error: errorMessage,
          });
        }
      });
    });
  });

  describe('checkWorkflowHealth', () => {
    describe('성공 케이스', () => {
      it('모든 서비스가 정상일 때 건강 상태를 반환해야 함', async () => {
        // Arrange
        const healthStatus = {
          naverApi: true,
          scraping: true,
          analysis: true,
          overall: true,
        };
        
        workflowService.checkWorkflowHealth.mockResolvedValue(healthStatus);

        // Act
        const result = await controller.checkWorkflowHealth();

        // Assert
        expect(result).toEqual({
          success: true,
          message: '워크플로우 상태 체크 완료',
          data: healthStatus,
        });
        expect(workflowService.checkWorkflowHealth).toHaveBeenCalledTimes(1);
      });

      it('일부 서비스가 비정상일 때도 상태를 반환해야 함', async () => {
        // Arrange
        const healthStatus = {
          naverApi: false,
          scraping: true,
          analysis: true,
          overall: false,
        };
        
        workflowService.checkWorkflowHealth.mockResolvedValue(healthStatus);

        // Act
        const result = await controller.checkWorkflowHealth();

        // Assert
        expect(result).toEqual({
          success: true,
          message: '워크플로우 상태 체크 완료',
          data: healthStatus,
        });
        expect(result.data.overall).toBe(false);
        expect(result.data.naverApi).toBe(false);
      });
    });

    describe('실패 케이스', () => {
      it('상태 체크 실패 시 HttpException을 던져야 함', async () => {
        // Arrange
        const errorMessage = '상태 체크 서비스 오류';
        workflowService.checkWorkflowHealth.mockRejectedValue(new Error(errorMessage));

        // Act & Assert
        await expect(controller.checkWorkflowHealth()).rejects.toThrow(HttpException);
        
        try {
          await controller.checkWorkflowHealth();
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error.getResponse()).toEqual({
            success: false,
            message: '워크플로우 상태 체크 중 오류가 발생했습니다.',
            error: errorMessage,
          });
        }
      });
    });
  });

  describe('통합 테스트', () => {
    it('모든 엔드포인트가 올바른 로깅을 수행해야 함', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      workflowService.executeCompleteWorkflow.mockResolvedValue(mockSuccessResult);
      workflowService.executeQuickAnalysis.mockResolvedValue(mockSuccessResult);
      workflowService.executeScrapingOnly.mockResolvedValue(mockSuccessResult);
      workflowService.checkWorkflowHealth.mockResolvedValue({
        naverApi: true,
        scraping: true,
        analysis: true,
        overall: true,
      });

      // Act
      await controller.executeCompleteWorkflow('테스트');
      await controller.executeQuickAnalysis('테스트');
      await controller.executeScrapingOnly('테스트');
      await controller.checkWorkflowHealth();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('🚀 완전한 워크플로우 API 호출: 테스트');
      expect(consoleSpy).toHaveBeenCalledWith('⚡ 빠른 분석 API 호출: 테스트');
      expect(consoleSpy).toHaveBeenCalledWith('🕷️ 스크래핑 전용 API 호출: 테스트');

      // Cleanup
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('에러 발생 시 적절한 에러 로깅을 수행해야 함', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('테스트 에러');
      
      workflowService.executeCompleteWorkflow.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.executeCompleteWorkflow('에러테스트')).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ 완전한 워크플로우 API 실패:', error);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('파라미터 검증', () => {
    it('유효한 한글 키워드를 처리할 수 있어야 함', async () => {
      // Arrange
      const koreanQuery = '한글키워드테스트';
      workflowService.executeCompleteWorkflow.mockResolvedValue({
        ...mockSuccessResult,
        data: { ...mockSuccessResult.data, query: koreanQuery }
      });

      // Act
      const result = await controller.executeCompleteWorkflow(koreanQuery);

      // Assert
      expect(result.data.query).toBe(koreanQuery);
    });

    it('유효한 영문 키워드를 처리할 수 있어야 함', async () => {
      // Arrange
      const englishQuery = 'english-keyword-test';
      workflowService.executeCompleteWorkflow.mockResolvedValue({
        ...mockSuccessResult,
        data: { ...mockSuccessResult.data, query: englishQuery }
      });

      // Act
      const result = await controller.executeCompleteWorkflow(englishQuery);

      // Assert
      expect(result.data.query).toBe(englishQuery);
    });

    it('숫자가 포함된 키워드를 처리할 수 있어야 함', async () => {
      // Arrange
      const numericQuery = '맛집123';
      workflowService.executeCompleteWorkflow.mockResolvedValue({
        ...mockSuccessResult,
        data: { ...mockSuccessResult.data, query: numericQuery }
      });

      // Act
      const result = await controller.executeCompleteWorkflow(numericQuery);

      // Assert
      expect(result.data.query).toBe(numericQuery);
    });
  });
});
