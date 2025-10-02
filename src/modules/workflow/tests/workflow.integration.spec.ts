import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WorkflowModule } from '../workflow.module';
import { NaverApiModule } from '../../naver-api/naver-api.module';
import { ScrapingModule } from '../../scraping/scraping.module';
import { KeywordAnalysisModule } from '../../keyword-analysis/keyword-analysis.module';
import { AppConfigService } from '../../../config/app.config';

describe('WorkflowController (Integration)', () => {
  let app: INestApplication;
  let appConfigService: AppConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        WorkflowModule,
        // 실제 모듈들을 import하지만 테스트 환경에서는 mock으로 대체
      ],
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            scrapingMaxResults: 5,
            scrapingMaxKeywordsPerType: 3,
            defaultStartDate: '2024-09-01',
            defaultEndDate: '2025-09-01',
          },
        },
      ],
    })
      .overrideProvider('NaverApiService')
      .useValue({
        getIntegratedData: jest.fn().mockResolvedValue({
          success: true,
          data: {
            blogSearch: {
              total: 1000,
              items: [
                {
                  title: '테스트 <b>맛집</b>',
                  link: 'https://test.com',
                  description: '테스트 설명',
                  bloggername: '테스터',
                  postdate: '20250922'
                }
              ]
            },
            datalab: {
              results: [
                {
                  title: '맛집',
                  keywords: ['맛집'],
                  data: [{ period: '2025-09-01', ratio: 100 }]
                }
              ]
            }
          }
        }),
        getDatalab: jest.fn().mockResolvedValue({
          success: true,
          data: {
            results: [
              {
                title: '키워드1',
                keywords: ['테스트 키워드'],
                data: [{ period: '2025-09-01', ratio: 80 }]
              }
            ]
          }
        }),
      })
      .overrideProvider('ScrapingService')
      .useValue({
        scrapeKeywords: jest.fn().mockResolvedValue({
          query: '맛집',
          keywords: [
            {
              keyword: '맛집 추천',
              category: 'smartblock',
              rankPosition: 1,
              source: 'naver_smartblock'
            }
          ],
          totalCount: 1,
          scrapingTime: 1.5,
          timestamp: new Date().toISOString()
        }),
        getScrapingStats: jest.fn().mockResolvedValue({ totalScraped: 100 }),
      })
      .overrideProvider('KeywordAnalysisService')
      .useValue({
        saveScrapingData: jest.fn().mockResolvedValue(undefined),
        getScrapedKeywords: jest.fn().mockResolvedValue([
          {
            keyword: '맛집 추천',
            category: 'smartblock',
            rankPosition: 1,
            collectedAt: new Date()
          }
        ]),
        analyzeKeyword: jest.fn().mockResolvedValue({
          keyword: '맛집',
          analytics: { monthlySearchTotal: 10000 },
          relatedKeywords: [],
          chartData: {}
        }),
        getKeywordAnalysis: jest.fn().mockResolvedValue({ success: true, data: {} }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    appConfigService = moduleFixture.get<AppConfigService>(AppConfigService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /workflow/complete/:query', () => {
    describe('성공 케이스', () => {
      it('완전한 워크플로우 실행이 성공해야 함', async () => {
        const query = '맛집';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/complete/${query}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
        expect(response.body.data.naverApiData).toBeDefined();
        expect(response.body.data.scrapingData).toBeDefined();
        expect(response.body.data.topKeywords).toBeDefined();
        expect(response.body.data.keywordsWithRank).toBeDefined();
        expect(response.body.data.executionTime).toBeGreaterThan(0);
        expect(response.body.data.timestamp).toBeDefined();
        expect(response.body.message).toBe('키워드 분석 워크플로우가 성공적으로 완료되었습니다.');
      });

      it('한글 키워드로 워크플로우 실행이 성공해야 함', async () => {
        const query = '서울맛집';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/complete/${query}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
      });

      it('영문 키워드로 워크플로우 실행이 성공해야 함', async () => {
        const query = 'restaurant';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/complete/${query}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
      });

      it('특수문자가 포함된 키워드로 워크플로우 실행이 성공해야 함', async () => {
        const query = '맛집&카페';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/complete/${encodeURIComponent(query)}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
      });
    });

    describe('실패 케이스', () => {
      it('빈 키워드로 요청 시 적절한 에러를 반환해야 함', async () => {
        const query = '';
        
        await request(app.getHttpServer())
          .post(`/workflow/complete/${query}`)
          .expect(404); // 빈 경로로 인한 404
      });

      it('매우 긴 키워드로 요청해도 처리되어야 함', async () => {
        const query = '매우긴키워드'.repeat(10); // 50자
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/complete/${encodeURIComponent(query)}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
      });
    });
  });

  describe('POST /workflow/quick/:query', () => {
    describe('성공 케이스', () => {
      it('빠른 분석이 성공해야 함', async () => {
        const query = '빠른분석테스트';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/quick/${query}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
        expect(response.body.data.naverApiData).toBeDefined();
        expect(response.body.data.scrapingData).toBeNull();
        expect(response.body.data.analysisData).toBeNull();
        expect(response.body.data.topKeywords).toEqual([]);
        expect(response.body.data.keywordsWithRank).toEqual([]);
        expect(response.body.message).toBe('빠른 키워드 분석이 완료되었습니다.');
      });
    });
  });

  describe('POST /workflow/scraping/:query', () => {
    describe('성공 케이스', () => {
      it('스크래핑 전용 워크플로우가 성공해야 함', async () => {
        const query = '스크래핑테스트';
        
        const response = await request(app.getHttpServer())
          .post(`/workflow/scraping/${query}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(query);
        expect(response.body.data.naverApiData).toBeNull();
        expect(response.body.data.scrapingData).toBeDefined();
        expect(response.body.data.analysisData).toBeNull();
        expect(response.body.data.topKeywords).toEqual([]);
        expect(response.body.data.keywordsWithRank).toEqual([]);
        expect(response.body.message).toBe('키워드 스크래핑이 완료되었습니다.');
      });
    });
  });

  describe('GET /workflow/health', () => {
    describe('성공 케이스', () => {
      it('워크플로우 상태 체크가 성공해야 함', async () => {
        const response = await request(app.getHttpServer())
          .get('/workflow/health')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('워크플로우 상태 체크 완료');
        expect(response.body.data).toBeDefined();
        expect(response.body.data.naverApi).toBeDefined();
        expect(response.body.data.scraping).toBeDefined();
        expect(response.body.data.analysis).toBeDefined();
        expect(response.body.data.overall).toBeDefined();
      });
    });
  });

  describe('응답 시간 테스트', () => {
    it('완전한 워크플로우의 응답 시간이 30초 이내여야 함', async () => {
      const query = '성능테스트';
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post(`/workflow/complete/${query}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(30000); // 30초 이내
      expect(response.body.success).toBe(true);
    });

    it('빠른 분석의 응답 시간이 10초 이내여야 함', async () => {
      const query = '빠른성능테스트';
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .post(`/workflow/quick/${query}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(10000); // 10초 이내
      expect(response.body.success).toBe(true);
    });

    it('상태 체크의 응답 시간이 5초 이내여야 함', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/workflow/health')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // 5초 이내
      expect(response.body.success).toBe(true);
    });
  });

  describe('동시 요청 테스트', () => {
    it('동시에 여러 요청을 처리할 수 있어야 함', async () => {
      const queries = ['동시테스트1', '동시테스트2', '동시테스트3'];
      
      const promises = queries.map(query =>
        request(app.getHttpServer())
          .post(`/workflow/quick/${query}`)
          .expect(200)
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, index) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.query).toBe(queries[index]);
      });
    });
  });

  describe('에러 처리 테스트', () => {
    it('존재하지 않는 엔드포인트 요청 시 404를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .post('/workflow/nonexistent/test')
        .expect(404);
    });

    it('잘못된 HTTP 메서드 사용 시 405를 반환해야 함', async () => {
      await request(app.getHttpServer())
        .get('/workflow/complete/test')
        .expect(404); // NestJS에서는 라우트가 없으면 404 반환
    });
  });

  describe('응답 구조 검증', () => {
    it('완전한 워크플로우 응답이 올바른 구조를 가져야 함', async () => {
      const query = '구조검증테스트';
      
      const response = await request(app.getHttpServer())
        .post(`/workflow/complete/${query}`)
        .expect(200);

      // 최상위 구조 검증
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      // data 구조 검증
      expect(response.body.data).toHaveProperty('query');
      expect(response.body.data).toHaveProperty('naverApiData');
      expect(response.body.data).toHaveProperty('scrapingData');
      expect(response.body.data).toHaveProperty('analysisData');
      expect(response.body.data).toHaveProperty('topKeywords');
      expect(response.body.data).toHaveProperty('keywordsWithRank');
      expect(response.body.data).toHaveProperty('executionTime');
      expect(response.body.data).toHaveProperty('timestamp');

      // naverApiData 구조 검증
      expect(response.body.data.naverApiData).toHaveProperty('original');
      expect(response.body.data.naverApiData).toHaveProperty('firstBatch');
      expect(response.body.data.naverApiData).toHaveProperty('secondBatch');

      // keywordsWithRank 구조 검증
      if (response.body.data.keywordsWithRank.length > 0) {
        const firstKeyword = response.body.data.keywordsWithRank[0];
        expect(firstKeyword).toHaveProperty('keyword');
        expect(firstKeyword).toHaveProperty('originalRank');
        expect(firstKeyword).toHaveProperty('category');
        expect(firstKeyword).toHaveProperty('source');
      }
    });
  });

  describe('데이터 타입 검증', () => {
    it('응답 데이터의 타입이 올바른지 검증해야 함', async () => {
      const query = '타입검증테스트';
      
      const response = await request(app.getHttpServer())
        .post(`/workflow/complete/${query}`)
        .expect(200);

      // 기본 타입 검증
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.query).toBe('string');
      expect(typeof response.body.data.executionTime).toBe('number');
      expect(typeof response.body.data.timestamp).toBe('string');

      // 배열 타입 검증
      expect(Array.isArray(response.body.data.topKeywords)).toBe(true);
      expect(Array.isArray(response.body.data.keywordsWithRank)).toBe(true);

      // 숫자 범위 검증
      expect(response.body.data.executionTime).toBeGreaterThan(0);
      
      // 날짜 형식 검증
      expect(new Date(response.body.data.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});
