"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverScraper = void 0;
const scraping_constants_1 = require("../../../constants/scraping.constants");
class NaverScraper {
    constructor(browserPoolService) {
        this.browserPoolService = browserPoolService;
        this.session = null;
    }
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
    get page() {
        if (!this.session?.page) {
            throw new Error('브라우저 세션이 초기화되지 않았습니다.');
        }
        return this.session.page;
    }
    async scrapeSmartBlockData(query) {
        console.log(`🧠 스마트블록 데이터 수집 시작: ${query}`);
        try {
            await this.page.goto(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`, {
                waitUntil: 'networkidle',
            });
            await this.page.waitForTimeout(2000);
            const popularTopicSelectors = [
                '.api_subject_bx',
                '.fds-comps-keyword-chip-text',
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
            const keywords = [];
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
                                category: 'smartblock',
                                rank: i + 1,
                                competition: this.estimateCompetition(cleanKeyword),
                                similarity: this.calculateSimilarity(query, cleanKeyword),
                            });
                            console.log(`📝 키워드 수집: ${cleanKeyword} (순위: ${i + 1})`);
                        }
                    }
                }
                catch (elementError) {
                    console.warn('키워드 요소 처리 중 오류:', elementError);
                }
            }
            const uniqueKeywords = keywords
                .filter((keyword, index, self) => {
                const firstIndex = self.findIndex(k => k.keyword === keyword.keyword);
                return firstIndex === index;
            })
                .slice(0, scraping_constants_1.SCRAPING_DEFAULTS.MAX_KEYWORDS_PER_TYPE)
                .map((keyword, index) => ({
                ...keyword,
                rank: index + 1
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
        }
        catch (error) {
            console.error('❌ 인기주제 데이터 수집 실패:', error);
            return {
                keywords: [],
                message: `인기주제 수집 중 오류 발생: ${error.message}`,
                status: 'error',
                count: 0
            };
        }
    }
    async scrapeRelatedSearchKeywords(query) {
        console.log(`🔗 연관검색어 수집 시작: ${query} (2페이지에서만, 개수 제한 없음)`);
        try {
            console.log('📄 2페이지에서 연관검색어 수집...');
            const page2Results = await this.scrapeRelatedFromPage(query, 2);
            if (page2Results.status === 'success' && page2Results.keywords.length > 0) {
                const allKeywords = page2Results.keywords.map((keyword, index) => ({
                    ...keyword,
                    rank: index + 1
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
        }
        catch (error) {
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
    async scrapeRelatedFromPage(query, page) {
        try {
            let searchUrl;
            if (page === 1) {
                searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}&where=web`;
            }
            else {
                const start = page - 1;
                searchUrl = `https://search.naver.com/search.naver?nso=&page=${page}&query=${encodeURIComponent(query)}&sm=tab_pge&start=${start}&where=web`;
            }
            console.log(`📄 ${page}페이지 연관검색어 수집: ${searchUrl}`);
            await this.page.goto(searchUrl, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(5000);
            const relatedKeywords = [];
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await this.page.waitForTimeout(3000);
            try {
                const pageContent = await this.page.content();
                const hasRelatedSection = pageContent.includes('related_srch') || pageContent.includes('lst_related_srch');
                console.log(`🔍 ${page}페이지 디버깅 정보:`);
                console.log(`  - 연관검색어 클래스 존재: ${hasRelatedSection}`);
            }
            catch (error) {
                console.warn('페이지 디버깅 중 오류:', error.message);
            }
            const selectors = [
                '.related_srch .lst_related_srch .item .keyword .tit',
                '.lst_related_srch .item .keyword .tit',
                '.related_srch .item .keyword .tit',
                '.lst_related_srch .keyword .tit',
                '.related_srch .tit',
                '.lst_related_srch .tit',
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
                }
                catch (error) {
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
                        if (this.isValidRelatedKeyword(cleanKeyword, query)) {
                            const rank = relatedKeywords.length + 1;
                            relatedKeywords.push({
                                keyword: cleanKeyword,
                                category: 'related_search',
                                rank: rank,
                                competition: this.estimateCompetition(cleanKeyword),
                                similarity: this.calculateSimilarity(query, cleanKeyword),
                            });
                            console.log(`✅ 연관검색어 수집: "${cleanKeyword}" (순위: ${rank}, 페이지: ${page})`);
                        }
                        else {
                            console.log(`❌ 연관검색어 필터링됨: "${cleanKeyword}"`);
                        }
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            console.error(`❌ ${page}페이지 연관검색어 수집 실패:`, error);
            return {
                keywords: [],
                message: `${page}페이지 수집 중 오류 발생: ${error.message}`,
                status: 'error',
                count: 0
            };
        }
    }
    async scrapeAllKeywords(query, types = ['related_search']) {
        console.log(`🚀 키워드 수집 시작: ${query}, 타입: ${types.join(', ')}`);
        const collectionDetails = {};
        const allKeywords = [];
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
    estimateCompetition(keyword) {
        const length = keyword.length;
        const hasNumbers = /\d/.test(keyword);
        const hasSpecialChars = /[^\w\s가-힣]/.test(keyword);
        if (length <= 2 || hasNumbers || hasSpecialChars) {
            return 'high';
        }
        else if (length <= 4) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    calculateSimilarity(original, target) {
        const originalChars = new Set(original.split(''));
        const targetChars = new Set(target.split(''));
        const intersection = new Set([...originalChars].filter(x => targetChars.has(x)));
        const union = new Set([...originalChars, ...targetChars]);
        const similarity = intersection.size / union.size;
        if (similarity >= 0.7)
            return 'high';
        if (similarity >= 0.4)
            return 'medium';
        return 'low';
    }
    isValidKeyword(keyword, originalQuery) {
        if (!keyword || !keyword.trim() || keyword.trim() === originalQuery) {
            return false;
        }
        keyword = keyword.trim();
        if (keyword.length < scraping_constants_1.KEYWORD_FILTERING.VALIDATION_RULES.MIN_LENGTH ||
            keyword.length > scraping_constants_1.KEYWORD_FILTERING.VALIDATION_RULES.MAX_LENGTH) {
            return false;
        }
        if (!scraping_constants_1.KEYWORD_FILTERING.VALIDATION_RULES.ALLOWED_PATTERN.test(keyword)) {
            return false;
        }
        if (scraping_constants_1.KEYWORD_FILTERING.VALIDATION_RULES.URL_PATTERN.test(keyword)) {
            return false;
        }
        if (this.isBlacklistedKeyword(keyword)) {
            return false;
        }
        const similarity = this.calculateSimilarityScore(originalQuery, keyword);
        if (similarity >= scraping_constants_1.KEYWORD_FILTERING.VALIDATION_RULES.SIMILARITY_THRESHOLD) {
            return false;
        }
        return true;
    }
    isBlacklistedKeyword(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return scraping_constants_1.KEYWORD_FILTERING.KEYWORD_BLACKLIST.some(blacklisted => {
            const lowerBlacklisted = blacklisted.toLowerCase();
            return lowerKeyword === lowerBlacklisted || lowerKeyword.includes(lowerBlacklisted);
        });
    }
    calculateSimilarityScore(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        if (len1 === 0)
            return len2 === 0 ? 1 : 0;
        if (len2 === 0)
            return 0;
        if (str1 === str2)
            return 1;
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
        for (let i = 0; i <= len1; i++)
            matrix[i][0] = i;
        for (let j = 0; j <= len2; j++)
            matrix[0][j] = j;
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
        }
        const distance = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        return 1 - (distance / maxLen);
    }
    isValidRelatedKeyword(keyword, originalQuery) {
        if (!keyword || !keyword.trim() || keyword.trim() === originalQuery) {
            return false;
        }
        keyword = keyword.trim();
        if (keyword.length < 2 || keyword.length > 50) {
            return false;
        }
        const excludePatterns = [
            /^더보기$/i,
            /^열기$/i,
            /^닫기$/i,
            /^도움말$/i,
            /^신고$/i,
            /^광고$/i,
            /^네이버$/i,
            /^NAVER$/i,
            /^[0-9]+$/,
            /^\s*$/,
            /^\.+$/,
            /^-+$/,
        ];
        for (const pattern of excludePatterns) {
            if (pattern.test(keyword)) {
                return false;
            }
        }
        if (/(http|www|\.com|\.kr|\.net|\.org)/i.test(keyword)) {
            return false;
        }
        if (!/^[가-힣a-zA-Z0-9\s\-_()]+$/.test(keyword)) {
            return false;
        }
        const queryLower = originalQuery.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        const queryChars = queryLower.split('');
        const keywordChars = keywordLower.split('');
        const hasCommonChar = queryChars.some(char => keywordChars.includes(char));
        const hasSubstring = keywordLower.includes(queryLower) || queryLower.includes(keywordLower);
        return hasCommonChar || hasSubstring || keyword.length >= 3;
    }
}
exports.NaverScraper = NaverScraper;
//# sourceMappingURL=naver-scraper.js.map