import 'reflect-metadata';

// Jest 전역 설정
beforeAll(() => {
  // 테스트 환경 설정
  process.env.NODE_ENV = 'test';
  
  // 콘솔 로그 모킹 (필요시)
  if (process.env.SILENT_TESTS === 'true') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }
});

afterAll(() => {
  // 테스트 후 정리
  jest.restoreAllMocks();
});

// 전역 테스트 유틸리티
global.createMockWorkflowResult = (overrides = {}) => ({
  success: true,
  data: {
    query: '테스트',
    naverApiData: {
      original: { blogSearch: {}, datalab: {} },
      firstBatch: null,
      secondBatch: null,
    },
    scrapingData: {
      query: '테스트',
      totalKeywords: 0,
      executionTime: 0,
      categories: {},
      keywords: [],
      collectionDetails: {
        timestamp: new Date().toISOString(),
        browser: 'test',
        userAgent: 'test'
      }
    },
    analysisData: {
      keyword: '테스트',
      analytics: {},
      relatedKeywords: [],
      chartData: {},
    },
    topKeywords: [],
    keywordsWithRank: [],
    executionTime: 1.0,
    timestamp: new Date().toISOString(),
    ...overrides,
  },
  message: '테스트 완료',
});

// 타입 선언
declare global {
  function createMockWorkflowResult(overrides?: any): any;
}
