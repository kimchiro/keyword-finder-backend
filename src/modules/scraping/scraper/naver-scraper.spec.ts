import { Test, TestingModule } from '@nestjs/testing';
import { NaverScraper, ScrapedKeyword, ScrapingResult } from './naver-scraper';
import { BrowserPoolService } from '../../../common/services/browser-pool.service';
import { KEYWORD_FILTERING, SCRAPING_DEFAULTS } from '../../../constants/scraping.constants';
import { Browser, Page } from 'playwright';

describe('NaverScraper', () => {
  let scraper: NaverScraper;
  let mockBrowserPoolService: jest.Mocked<BrowserPoolService>;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;

  // Mock 데이터
  const mockScrapingData = {
    validKeywords: [
      '다크초콜릿', '밀크초콜릿', '초콜릿케이크',
      '강남맛집', '이태원맛집', '맛집추천',
      'Korean Food', '맛집-리스트', '맛집_추천'
    ],
    invalidKeywords: [
      '광고', '네이버', '등록 안내', '도움말', '서비스', '더보기',
      'a', '매우매우매우매우매우매우매우매우매우매우매우매우매우긴키워드입니다',
      'http://example.com', '초콜릿@특가', '맛집#추천',
      '초콜릿', '맛집', '', '   ', '초콜릿맛'
    ]
  };

  beforeEach(async () => {
    // Mock 객체들 생성
    mockPage = {
      goto: jest.fn(),
      locator: jest.fn(),
      waitForTimeout: jest.fn(),
      $$: jest.fn(),
      $: jest.fn(), // $ 메서드 추가
    } as any;

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    } as any;

    mockBrowserPoolService = {
      acquireBrowser: jest.fn().mockResolvedValue({
        browser: mockBrowser,
        page: mockPage,
        instanceId: 'test-instance'
      }),
      releaseBrowser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BrowserPoolService,
          useValue: mockBrowserPoolService,
        },
      ],
    }).compile();

    scraper = new NaverScraper(mockBrowserPoolService);
    await scraper.initialize();
  });

  afterEach(async () => {
    await scraper.close();
  });

  describe('isValidKeyword - 성공 케이스', () => {
    it('정상적인 키워드들을 통과시켜야 함', () => {
      // Private 메서드 테스트를 위한 타입 캐스팅
      const scraperAny = scraper as any;
      
      expect(scraperAny.isValidKeyword('다크초콜릿', '초콜릿')).toBe(true);
      expect(scraperAny.isValidKeyword('밀크초콜릿', '초콜릿')).toBe(true);
      expect(scraperAny.isValidKeyword('강남맛집', '맛집')).toBe(true);
      expect(scraperAny.isValidKeyword('이태원 맛집', '맛집')).toBe(true);
      expect(scraperAny.isValidKeyword('Korean Food', 'food')).toBe(true);
      expect(scraperAny.isValidKeyword('맛집추천', '맛집')).toBe(true);
      expect(scraperAny.isValidKeyword('초콜릿케이크', '초콜릿')).toBe(true);
      expect(scraperAny.isValidKeyword('맛집-가이드', '맛집')).toBe(true);
      expect(scraperAny.isValidKeyword('맛집_추천', '맛집')).toBe(true);
    });
  });

  describe('isValidKeyword - 실패 케이스', () => {
    it('길이 제한 위반 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('a', '초콜릿')).toBe(false); // 1글자
      expect(scraperAny.isValidKeyword('매우매우매우매우매우매우매우매우매우매우매우매우매우긴키워드입니다', '초콜릿')).toBe(false); // 30글자 초과
    });

    it('블랙리스트 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('광고', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('네이버', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('등록 안내', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('도움말', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('서비스', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('더보기', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('필터', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('정렬', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('확인', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('취소', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('Naver', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('NAVER', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('네이버페이', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('할인', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('세일', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('쿠폰', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('장바구니', '초콜릿')).toBe(false);
    });

    it('허용되지 않는 특수문자 포함 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('초콜릿@맛집', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('맛집#추천', '맛집')).toBe(false);
      expect(scraperAny.isValidKeyword('초콜릿$세일', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('맛집%할인', '맛집')).toBe(false);
    });

    it('URL/링크 텍스트를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('http://example.com', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('www.naver.com', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('맛집.com', '맛집')).toBe(false);
      expect(scraperAny.isValidKeyword('초콜릿.kr', '초콜릿')).toBe(false);
    });

    it('원본 쿼리와 동일한 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('초콜릿', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('맛집', '맛집')).toBe(false);
    });

    it('빈 문자열을 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isValidKeyword('', '초콜릿')).toBe(false);
      expect(scraperAny.isValidKeyword('   ', '초콜릿')).toBe(false);
    });

    it('80% 이상 유사한 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      // 매우 유사한 키워드들 (80% 이상 유사도)
      expect(scraperAny.isValidKeyword('hello', 'helloo')).toBe(false); // 0.83 유사도 (80% 임계값보다 높음)
      expect(scraperAny.isValidKeyword('hello', 'helloworld')).toBe(true); // 0.5 유사도 (통과)
    });
  });

  describe('isBlacklistedKeyword - 정상 키워드', () => {
    it('정상적인 키워드들을 통과시켜야 함', () => {
      const scraperAny = scraper as any;
      
      expect(scraperAny.isBlacklistedKeyword('다크초콜릿')).toBe(false);
      expect(scraperAny.isBlacklistedKeyword('맛집추천')).toBe(false);
      expect(scraperAny.isBlacklistedKeyword('Korean Food')).toBe(false);
    });
  });

  describe('isBlacklistedKeyword - 블랙리스트 키워드', () => {
    it('정확 일치하는 블랙리스트 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isBlacklistedKeyword('광고')).toBe(true);
      expect(scraperAny.isBlacklistedKeyword('네이버')).toBe(true);
    });

    it('대소문자 구분 없이 블랙리스트 키워드를 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isBlacklistedKeyword('NAVER')).toBe(true);
      expect(scraperAny.isBlacklistedKeyword('naver')).toBe(true);
    });

    it('블랙리스트 키워드를 포함하는 경우 거부해야 함', () => {
      const scraperAny = scraper as any;
      expect(scraperAny.isBlacklistedKeyword('이 광고가 표시된 이유')).toBe(true);
      expect(scraperAny.isBlacklistedKeyword('네이버 서비스')).toBe(true);
      expect(scraperAny.isBlacklistedKeyword('할인 이벤트')).toBe(true);
    });
  });

  describe('calculateSimilarityScore - 정확한 점수 계산', () => {
    it('낮은 유사도 키워드들의 점수가 0.9 미만이어야 함', () => {
      const scraperAny = scraper as any;
      
      expect(scraperAny.calculateSimilarityScore('초콜릿', '다크초콜릿')).toBeLessThan(0.9);
      expect(scraperAny.calculateSimilarityScore('맛집', '강남맛집')).toBeLessThan(0.9);
      expect(scraperAny.calculateSimilarityScore('food', 'Korean food')).toBeLessThan(0.9);
    });
  });

  describe('calculateSimilarityScore - 높은 유사도', () => {
    it('높은 유사도 키워드들의 점수가 적절한 임계값 이상이어야 함', () => {
      const scraperAny = scraper as any;
      
      // Levenshtein 거리 기반으로 더 정확한 유사도 계산
      expect(scraperAny.calculateSimilarityScore('초콜릿', '초콜릿맛')).toBeGreaterThanOrEqual(0.6);
      expect(scraperAny.calculateSimilarityScore('맛집', '맛집들')).toBeGreaterThanOrEqual(0.6);
      expect(scraperAny.calculateSimilarityScore('테스트', '테스트1')).toBeGreaterThanOrEqual(0.7);
      expect(scraperAny.calculateSimilarityScore('abc', 'abcd')).toBeGreaterThanOrEqual(0.75);
    });
  });

  describe('scrapeSmartBlockData - 필터링 적용', () => {
    beforeEach(() => {
      // 스마트블록 영역 존재 확인을 위한 Mock 설정
      mockPage.$ = jest.fn().mockImplementation((selector) => {
        // 스마트블록 영역이 존재한다고 가정
        if (selector.includes('api_subject_bx') || selector.includes('smartblock') || selector.includes('knowledge_box')) {
          return Promise.resolve({ exists: true });
        }
        return Promise.resolve(null);
      });
      
      // Mock 설정
      const mockLocator = {
        all: jest.fn().mockResolvedValue([
          {
            locator: jest.fn().mockReturnValue({
              allTextContents: jest.fn().mockResolvedValue([
                '다크초콜릿', '밀크초콜릿', // 유효한 키워드
                '광고', '네이버', // 블랙리스트 키워드 (필터링됨)
                'a', // 길이 위반 (필터링됨)
                'http://example.com', // URL (필터링됨)
                '초콜릿@특가', // 특수문자 (필터링됨)
                '초콜릿' // 원본과 동일 (필터링됨)
              ])
            })
          }
        ])
      };
      
      mockPage.goto = jest.fn().mockResolvedValue(undefined);
      mockPage.locator = jest.fn().mockReturnValue(mockLocator);
    });

    it('화이트리스트 선택자만 사용해야 함', async () => {
      await scraper.scrapeSmartBlockData('초콜릿');
      
      // 허용된 선택자들이 사용되었는지 확인
      const allowedSelectorsString = KEYWORD_FILTERING.ALLOWED_SELECTORS.join(', ');
      expect(mockPage.locator).toHaveBeenCalledWith(allowedSelectorsString);
    });

    it('필터링된 키워드만 반환해야 함', async () => {
      const result = await scraper.scrapeSmartBlockData('초콜릿');
      
      // 유효한 키워드만 포함되어야 함
      const resultKeywords = result.keywords.map(k => k.keyword);
      expect(resultKeywords).toEqual(['다크초콜릿', '밀크초콜릿']);
      expect(result.keywords.length).toBe(2);
      expect(result.status).toBe('success');
      expect(result.count).toBe(2);
      
      // 블랙리스트 키워드가 포함되지 않았는지 확인
      expect(resultKeywords).not.toContain('광고');
      expect(resultKeywords).not.toContain('네이버');
      expect(resultKeywords).not.toContain('a');
      expect(resultKeywords).not.toContain('http://example.com');
    });
  });

  describe('전체 스크래핑 필터링 테스트', () => {
    const testCases = [
      {
        query: '초콜릿',
        expectedKeywords: ['다크초콜릿', '밀크초콜릿', '초콜릿케이크'],
        forbiddenKeywords: ['광고', '네이버', '할인', '쿠폰']
      },
      {
        query: '맛집',
        expectedKeywords: ['강남맛집', '이태원맛집', '맛집추천'],
        forbiddenKeywords: ['서비스', '등록', '필터', '정렬']
      }
    ];

    beforeEach(() => {
      // Mock 설정 - 연관검색어 스크래핑을 위한 설정
      mockPage.$$ = jest.fn().mockImplementation((selector) => {
        // 테스트 케이스에 따라 다른 결과 반환
        if (selector.includes('related')) {
          return Promise.resolve([
            { textContent: () => Promise.resolve('다크초콜릿') },
            { textContent: () => Promise.resolve('밀크초콜릿') },
            { textContent: () => Promise.resolve('초콜릿케이크') },
            { textContent: () => Promise.resolve('광고') }, // 블랙리스트
            { textContent: () => Promise.resolve('네이버') }, // 블랙리스트
          ]);
        }
        return Promise.resolve([]);
      });
    });

    testCases.forEach(({ query, expectedKeywords, forbiddenKeywords }) => {
      it(`${query} 검색 시 올바른 필터링이 적용되어야 함`, async () => {
        const result = await scraper.scrapeAllKeywords(query);
        const resultKeywords = result.keywords.map(k => k.keyword);
        
        // 금지된 키워드들이 포함되지 않아야 함
        forbiddenKeywords.forEach(keyword => {
          expect(resultKeywords).not.toContain(keyword);
        });
        
        // 모든 키워드가 유효성 검사를 통과해야 함
        result.keywords.forEach(keyword => {
          expect(keyword.keyword.length).toBeGreaterThanOrEqual(2);
          expect(keyword.keyword.length).toBeLessThanOrEqual(30);
          expect(keyword.keyword).toMatch(/^[가-힣a-zA-Z0-9\s\-_]+$/);
        });
        
        // 수집 상세 정보 확인
        expect(result.collectionDetails).toBeDefined();
        expect(result.collectionDetails.related_search).toBeDefined();
      });
    });
  });

  describe('성능 테스트', () => {
    beforeEach(() => {
      // 빠른 응답을 위한 Mock 설정
      mockPage.$$ = jest.fn().mockResolvedValue([
        { textContent: () => Promise.resolve('테스트키워드') }
      ]);
    });

    it('필터링 로직이 성능에 큰 영향을 주지 않아야 함', async () => {
      const startTime = Date.now();
      const result = await scraper.scrapeAllKeywords('테스트');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10000); // 10초 이내
      expect(result).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.collectionDetails).toBeDefined();
    });
  });

  describe('엣지 케이스', () => {
    beforeEach(() => {
      mockPage.$$ = jest.fn().mockResolvedValue([]);
    });

    it('특수 문자가 포함된 쿼리 처리', async () => {
      const result = await scraper.scrapeAllKeywords('초콜릿-케이크');
      expect(result).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.collectionDetails).toBeDefined();
    });
    
    it('빈 결과 처리', async () => {
      const result = await scraper.scrapeAllKeywords('존재하지않는키워드12345');
      expect(result).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.collectionDetails).toBeDefined();
    });
    
    it('네트워크 오류 시 적절한 응답 구조 반환', async () => {
      // 네트워크 오류 시뮬레이션
      mockPage.goto = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await scraper.scrapeAllKeywords('테스트');
      expect(result).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.collectionDetails).toBeDefined();
      expect(result.collectionDetails.related_search.status).toBe('no_content');
    });
  });
});
