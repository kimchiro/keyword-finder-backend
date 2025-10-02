import { Browser, Page } from 'playwright';
import { BrowserPoolService } from '../../../common/services/browser-pool.service';
import { SCRAPING_DEFAULTS, KEYWORD_FILTERING } from '../../../constants/scraping.constants';

export interface ScrapedKeyword {
  keyword: string;
  category: 'autosuggest' | 'related' | 'smartblock' | 'related_search';
  rank?: number;
  competition?: 'low' | 'medium' | 'high';
  source?: string;
  similarity?: 'low' | 'medium' | 'high';
  relatedData?: any;
}

export interface ScrapingResult {
  keywords: ScrapedKeyword[];
  message: string;
  status: 'success' | 'no_content' | 'error';
  count?: number;
  pages?: number[];
}

interface BrowserSession {
  browser: Browser;
  page: Page;
  instanceId: string;
}

export class NaverScraper {
  private session: BrowserSession | null = null;

  constructor(private browserPoolService: BrowserPoolService) {}

  async initialize() {
    console.log('🚀 브라우저 풀에서 브라우저 세션 획득 중...');
    this.session = await this.browserPoolService.acquireBrowser();
    console.log('✅ 브라우저 세션 획득 완료');
  }

  async close() {
    if (this.session) {
      await this.browserPoolService.releaseBrowser(this.session);
      this.session = null;
      console.log('🔒 브라우저 세션 반환 완료');
    }
  }

  private get page(): Page {
    if (!this.session?.page) {
      throw new Error('브라우저 세션이 초기화되지 않았습니다.');
    }
    return this.session.page;
  }

  // 네이버 스마트블록 데이터 수집 (인기주제 키워드)
  async scrapeSmartBlockData(query: string): Promise<ScrapingResult> {
    console.log(`🧠 스마트블록 데이터 수집 시작: ${query}`);
    
    try {
      // 네이버 검색 결과 페이지로 이동
      await this.page.goto(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle',
      });
      
      // 결과 로딩 대기
      await this.page.waitForTimeout(2000);
      
      // 인기주제 영역 존재 확인 (실제 HTML 구조에 맞게 수정)
      const popularTopicSelectors = [
        '.api_subject_bx', // 기본 스마트블록 영역
        '.fds-comps-keyword-chip-text', // 실제 키워드 텍스트 요소
        '.sds-comps-vertical-layout.sds-comps-full-layout.fds-collection-root'
      ];
      
      let popularTopicExists = false;
      for (const selector of popularTopicSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          popularTopicExists = true;
          console.log(`✅ 인기주제 영역 발견: ${selector}`);
          break;
        }
      }
      
      if (!popularTopicExists) {
        console.log('⚠️ 인기주제 영역이 존재하지 않습니다');
        return {
          keywords: [],
          message: `"${query}" 키워드에 대한 인기주제 데이터가 존재하지 않습니다`,
          status: 'no_content',
          count: 0
        };
      }
      
      const keywords: ScrapedKeyword[] = [];
      
      // 실제 키워드 텍스트 추출 (제공해주신 HTML 구조에 맞게)
      const keywordElements = await this.page.$$('.fds-comps-keyword-chip-text');
      console.log(`🔍 발견된 키워드 요소 수: ${keywordElements.length}`);
      
      for (let i = 0; i < keywordElements.length; i++) {
        try {
          const element = keywordElements[i];
          const keywordText = await element.textContent();
          if (keywordText && keywordText.trim()) {
            const cleanKeyword = keywordText.trim();
            
            if (this.isValidKeyword(cleanKeyword, query)) {
              keywords.push({
                keyword: cleanKeyword,
                category: 'smartblock' as const,
                rank: i + 1, // 순위 설정 (1부터 시작)
                competition: this.estimateCompetition(cleanKeyword),
                similarity: this.calculateSimilarity(query, cleanKeyword),
              });
              console.log(`📝 키워드 수집: ${cleanKeyword} (순위: ${i + 1})`);
            }
          }
        } catch (elementError) {
          console.warn('키워드 요소 처리 중 오류:', elementError);
        }
      }

      // 중복 제거 및 최대 10개로 제한 후 순위 재정렬
      const uniqueKeywords = keywords
        .filter((keyword, index, self) => {
          const firstIndex = self.findIndex(k => k.keyword === keyword.keyword);
          return firstIndex === index;
        })
        .slice(0, SCRAPING_DEFAULTS.MAX_KEYWORDS_PER_TYPE)
        .map((keyword, index) => ({
          ...keyword,
          rank: index + 1 // 중복 제거 후 순위를 1부터 재정렬
        }));

      if (uniqueKeywords.length === 0) {
        console.log('⚠️ 유효한 키워드를 찾을 수 없습니다');
        return {
          keywords: [],
          message: `"${query}" 키워드에 대한 유효한 인기주제 데이터를 찾을 수 없습니다`,
          status: 'no_content',
          count: 0
        };
      }

      console.log(`✅ 인기주제 키워드 ${uniqueKeywords.length}개 수집 완료`);
      return {
        keywords: uniqueKeywords,
        message: `인기주제 키워드 ${uniqueKeywords.length}개 수집 완료`,
        status: 'success',
        count: uniqueKeywords.length
      };
    } catch (error) {
      console.error('❌ 인기주제 데이터 수집 실패:', error);
      return {
        keywords: [],
        message: `인기주제 수집 중 오류 발생: ${error.message}`,
        status: 'error',
        count: 0
      };
    }
  }

  // 네이버 검색 결과 페이지에서 연관검색어 수집 (2페이지에서만)
  async scrapeRelatedSearchKeywords(query: string): Promise<ScrapingResult> {
    console.log(`🔗 연관검색어 수집 시작: ${query} (2페이지에서만, 개수 제한 없음)`);
    
    try {
      // 2페이지에서만 연관검색어 수집 (실제 네이버 URL 형식 사용)
      console.log('📄 2페이지에서 연관검색어 수집...');
      const page2Results = await this.scrapeRelatedFromPage(query, 2);
      
      if (page2Results.status === 'success' && page2Results.keywords.length > 0) {
        // 개수 제한 없이 모든 키워드 사용
        const allKeywords = page2Results.keywords.map((keyword, index) => ({
          ...keyword,
          rank: index + 1 // 원본 순위 유지
        }));
        console.log(`✅ 연관검색어 ${allKeywords.length}개 수집 완료 (2페이지, 개수 제한 없음)`);
        return {
          keywords: allKeywords,
          message: `연관검색어 ${allKeywords.length}개 수집 완료 (2페이지, 개수 제한 없음)`,
          status: 'success',
          count: allKeywords.length,
          pages: [2]
        };
      }
      
      return {
        keywords: [],
        message: `"${query}" 키워드에 대한 연관검색어가 존재하지 않습니다 (2페이지)`,
        status: 'no_content',
        count: 0,
        pages: [2]
      };
      
    } catch (error) {
      console.error('❌ 연관검색어 수집 실패:', error);
      return {
        keywords: [],
        message: `연관검색어 수집 중 오류 발생: ${error.message}`,
        status: 'error',
        count: 0,
        pages: [2]
      };
    }
  }

  // 특정 페이지에서 연관검색어 수집
  private async scrapeRelatedFromPage(query: string, page: number): Promise<ScrapingResult> {
    try {
      let searchUrl: string;
      
      if (page === 1) {
        // 1페이지 URL
        searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}&where=web`;
      } else {
        // 2페이지 이상 URL (실제 네이버 형식)
        const start = page - 1; // 2페이지는 start=1
        searchUrl = `https://search.naver.com/search.naver?nso=&page=${page}&query=${encodeURIComponent(query)}&sm=tab_pge&start=${start}&where=web`;
      }
      
      console.log(`📄 ${page}페이지 연관검색어 수집: ${searchUrl}`);
      await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // 연관검색어 영역 대기 (더 오래 기다림)
      await this.page.waitForTimeout(5000);
      
      const relatedKeywords: ScrapedKeyword[] = [];
      
      // 페이지 하단으로 스크롤 (연관검색어는 페이지 하단에 위치)
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await this.page.waitForTimeout(3000);
      
      // 페이지 내용 디버깅
      try {
        const pageContent = await this.page.content();
        const hasRelatedSection = pageContent.includes('related_srch') || pageContent.includes('lst_related_srch');
        
        console.log(`🔍 ${page}페이지 디버깅 정보:`);
        console.log(`  - 연관검색어 클래스 존재: ${hasRelatedSection}`);
        
      } catch (error) {
        console.warn('페이지 디버깅 중 오류:', error.message);
      }
      
      // 실제 HTML 구조에 맞는 연관검색어 선택자들 (정확한 경로)
      const selectors = [
        '.related_srch .lst_related_srch .item .keyword .tit', // 정확한 전체 경로
        '.lst_related_srch .item .keyword .tit', // 백업 1
        '.related_srch .item .keyword .tit', // 백업 2
        '.lst_related_srch .keyword .tit', // 백업 3
        '.related_srch .tit', // 백업 4 (연관검색어 영역만)
        '.lst_related_srch .tit', // 백업 5 (리스트 영역만)
      ];
      
      let keywordElements = [];
      let usedSelector = '';
      
      for (const selector of selectors) {
        try {
          keywordElements = await this.page.$$(selector);
          console.log(`🔍 선택자 "${selector}": ${keywordElements.length}개 요소`);
          if (keywordElements.length > 0) {
            usedSelector = selector;
            console.log(`✅ ${page}페이지에서 선택자 "${selector}"로 ${keywordElements.length}개 요소 발견`);
            break;
          }
        } catch (error) {
          console.warn(`선택자 "${selector}" 실패:`, error.message);
        }
      }
      
      if (keywordElements.length === 0) {
        console.log(`📄 ${page}페이지에 연관검색어를 찾을 수 없습니다`);
        return {
          keywords: [],
          message: `${page}페이지에 연관검색어 없음`,
          status: 'no_content',
          count: 0
        };
      }
      
      console.log(`📄 ${page}페이지에서 ${keywordElements.length}개 연관검색어 요소 발견`);
      
      for (let i = 0; i < keywordElements.length; i++) {
        try {
          const element = keywordElements[i];
          const text = await element.textContent();
          
          if (text && text.trim()) {
            const cleanKeyword = text.trim();
            
            // 연관검색어 특별 검증 (더 엄격한 필터링)
            if (this.isValidRelatedKeyword(cleanKeyword, query)) {
              const rank = relatedKeywords.length + 1; // 연관검색어 카테고리 내 독립적인 순위 (1부터 시작)
              relatedKeywords.push({
                keyword: cleanKeyword,
                category: 'related_search',
                rank: rank, // 연관검색어 카테고리 내 독립적인 순위 설정
                competition: this.estimateCompetition(cleanKeyword),
                similarity: this.calculateSimilarity(query, cleanKeyword),
              });
              
              console.log(`✅ 연관검색어 수집: "${cleanKeyword}" (순위: ${rank}, 페이지: ${page})`);
            } else {
              console.log(`❌ 연관검색어 필터링됨: "${cleanKeyword}"`);
            }
          }
        } catch (error) {
          console.warn(`연관검색어 요소 ${i} 처리 실패:`, error.message);
        }
      }
      
      console.log(`📄 ${page}페이지에서 ${relatedKeywords.length}개 연관검색어 수집 완료`);
      return {
        keywords: relatedKeywords,
        message: `${page}페이지에서 ${relatedKeywords.length}개 수집`,
        status: relatedKeywords.length > 0 ? 'success' : 'no_content',
        count: relatedKeywords.length
      };
      
    } catch (error) {
      console.error(`❌ ${page}페이지 연관검색어 수집 실패:`, error);
      return { 
        keywords: [],
        message: `${page}페이지 수집 중 오류 발생: ${error.message}`,
        status: 'error',
        count: 0
      };
    }
  }

  // 스마트블록, 인기주제, 연관검색어 키워드 수집 (개선된 응답 구조)
  async scrapeAllKeywords(
    query: string, 
    types: string[] = ['related_search']
  ): Promise<{
    keywords: ScrapedKeyword[];
    collectionDetails: {
      [key: string]: {
        status: 'success' | 'no_content' | 'error';
        message: string;
        count: number;
        pages?: number[];
      };
    };
  }> {
    console.log(`🚀 키워드 수집 시작: ${query}, 타입: ${types.join(', ')}`);
    
    const collectionDetails: any = {};
    const allKeywords: ScrapedKeyword[] = [];
    
    // 각 타입별로 순차적으로 수집 (상세한 결과 추적을 위해)
    
    if (types.includes('smartblock')) {
      console.log('🧠 스마트블록 데이터 수집 중...');
      const smartblockResult = await this.scrapeSmartBlockData(query);
      collectionDetails.smartblock = {
        status: smartblockResult.status,
        message: smartblockResult.message,
        count: smartblockResult.count || 0,
      };
      allKeywords.push(...smartblockResult.keywords);
    }
    
    if (types.includes('related_search')) {
      console.log('🔗 연관검색어 수집 중...');
      const relatedResult = await this.scrapeRelatedSearchKeywords(query);
      collectionDetails.related_search = {
        status: relatedResult.status,
        message: relatedResult.message,
        count: relatedResult.count || 0,
        pages: relatedResult.pages || [],
      };
      allKeywords.push(...relatedResult.keywords);
    }
    
    // 중복 제거 (순위가 낮은 것 우선 유지)
    const uniqueKeywords = allKeywords.filter((keyword, index, self) => {
      const firstIndex = self.findIndex(k => k.keyword === keyword.keyword);
      return firstIndex === index;
    });
    
    console.log(`✅ 전체 키워드 수집 완료: ${uniqueKeywords.length}개`);
    console.log('📊 수집 상세 정보:', JSON.stringify(collectionDetails, null, 2));
    
    return {
      keywords: uniqueKeywords,
      collectionDetails
    };
  }

  // 키워드 경쟁도 추정 (간단한 휴리스틱)
  private estimateCompetition(keyword: string): 'low' | 'medium' | 'high' {
    const length = keyword.length;
    const hasNumbers = /\d/.test(keyword);
    const hasSpecialChars = /[^\w\s가-힣]/.test(keyword);
    
    if (length <= 2 || hasNumbers || hasSpecialChars) {
      return 'high';
    } else if (length <= 4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // 키워드 유사도 계산 (간단한 문자열 유사도)
  private calculateSimilarity(original: string, target: string): 'low' | 'medium' | 'high' {
    const originalChars = new Set(original.split(''));
    const targetChars = new Set(target.split(''));
    
    const intersection = new Set([...originalChars].filter(x => targetChars.has(x)));
    const union = new Set([...originalChars, ...targetChars]);
    
    const similarity = intersection.size / union.size;
    
    if (similarity >= 0.7) return 'high';
    if (similarity >= 0.4) return 'medium';
    return 'low';
  }

  // 키워드 유효성 검증
  private isValidKeyword(keyword: string, originalQuery: string): boolean {
    // 기본 검증: 빈 문자열이거나 공백만 있는 경우, 원본 쿼리와 동일한 경우 제외
    if (!keyword || !keyword.trim() || keyword.trim() === originalQuery) {
      return false;
    }
    
    // 트림된 키워드로 검증 진행
    keyword = keyword.trim();

    // 길이 검증
    if (keyword.length < KEYWORD_FILTERING.VALIDATION_RULES.MIN_LENGTH || 
        keyword.length > KEYWORD_FILTERING.VALIDATION_RULES.MAX_LENGTH) {
      return false;
    }

    // 허용된 문자 패턴 검증
    if (!KEYWORD_FILTERING.VALIDATION_RULES.ALLOWED_PATTERN.test(keyword)) {
      return false;
    }

    // URL/링크 텍스트 제외
    if (KEYWORD_FILTERING.VALIDATION_RULES.URL_PATTERN.test(keyword)) {
      return false;
    }

    // 블랙리스트 키워드 체크
    if (this.isBlacklistedKeyword(keyword)) {
      return false;
    }

    // 유사도 검사 (90% 이상 유사하면 제외)
    const similarity = this.calculateSimilarityScore(originalQuery, keyword);
    if (similarity >= KEYWORD_FILTERING.VALIDATION_RULES.SIMILARITY_THRESHOLD) {
      return false;
    }

    return true;
  }

  // 블랙리스트 키워드 체크
  private isBlacklistedKeyword(keyword: string): boolean {
    const lowerKeyword = keyword.toLowerCase();
    
    return KEYWORD_FILTERING.KEYWORD_BLACKLIST.some(blacklisted => {
      const lowerBlacklisted = blacklisted.toLowerCase();
      // 정확히 일치하거나 포함하는 경우
      return lowerKeyword === lowerBlacklisted || lowerKeyword.includes(lowerBlacklisted);
    });
  }

  // 정확한 유사도 점수 계산 (0~1 사이 값) - Levenshtein 거리 기반
  private calculateSimilarityScore(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // 빈 문자열 처리
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    // 동일한 문자열
    if (str1 === str2) return 1;
    
    // Levenshtein 거리 계산
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // 삭제
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j - 1] + cost // 치환
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    
    // 유사도 = 1 - (거리 / 최대길이)
    return 1 - (distance / maxLen);
  }

  // 연관검색어 전용 유효성 검사 (개선된 필터링 - 더 관대함)
  private isValidRelatedKeyword(keyword: string, originalQuery: string): boolean {
    // 기본 검증: 빈 문자열이거나 공백만 있는 경우, 원본 쿼리와 동일한 경우 제외
    if (!keyword || !keyword.trim() || keyword.trim() === originalQuery) {
      return false;
    }
    
    keyword = keyword.trim();

    // 길이 검증 (연관검색어는 더 관대하게)
    if (keyword.length < 2 || keyword.length > 50) {
      return false;
    }

    // 연관검색어에서 제외할 키워드들 (핵심 UI 요소만)
    const excludePatterns = [
      /^더보기$/i,
      /^열기$/i,
      /^닫기$/i,
      /^도움말$/i,
      /^신고$/i,
      /^광고$/i,
      /^네이버$/i,
      /^NAVER$/i,
      /^[0-9]+$/,  // 숫자만 있는 경우
      /^\s*$/,     // 공백만 있는 경우
      /^\.+$/,     // 점만 있는 경우
      /^-+$/,      // 하이픈만 있는 경우
    ];
    
    // 제외 패턴에 정확히 매칭되는지 확인 (부분 매칭 제거)
    for (const pattern of excludePatterns) {
      if (pattern.test(keyword)) {
        return false;
      }
    }

    // URL/링크 텍스트 제외
    if (/(http|www|\.com|\.kr|\.net|\.org)/i.test(keyword)) {
      return false;
    }

    // 허용된 문자 패턴 검증 (한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 일부 특수문자)
    if (!/^[가-힣a-zA-Z0-9\s\-_()]+$/.test(keyword)) {
      return false;
    }

    // 원본 쿼리와의 관련성 검사 (더 관대하게)
    const queryLower = originalQuery.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // 1. 공통 글자가 있는지 확인
    const queryChars = queryLower.split('');
    const keywordChars = keywordLower.split('');
    const hasCommonChar = queryChars.some(char => keywordChars.includes(char));
    
    // 2. 키워드가 쿼리를 포함하거나 쿼리가 키워드를 포함하는지 확인
    const hasSubstring = keywordLower.includes(queryLower) || queryLower.includes(keywordLower);
    
    // 3. 관련성이 있거나 충분히 긴 키워드면 허용
    return hasCommonChar || hasSubstring || keyword.length >= 3;
  }
}
