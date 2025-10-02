export declare const SCRAPING_DEFAULTS: {
    readonly MAX_RESULTS: 50;
    readonly MAX_KEYWORDS_PER_TYPE: 10;
    readonly PAGE_TIMEOUT: 30000;
    readonly DELAY_BETWEEN_REQUESTS: 1000;
    readonly RETRY_COUNT: 3;
    readonly RETRY_DELAY: 2000;
};
export declare const NAVER_SCRAPING: {
    readonly BASE_URL: "https://search.naver.com/search.naver";
    readonly AUTOCOMPLETE_URL: "https://ac.search.naver.com/nx/ac";
    readonly SELECTORS: {
        readonly RELATED_SEARCH: ".lst_related_srch .tit";
        readonly AUTOCOMPLETE: ".item";
        readonly POPULAR_TOPICS: ".lst_issue .tit";
        readonly SEARCH_RESULTS: ".lst_total .total_tit";
    };
    readonly SEARCH_PARAMS: {
        readonly QUERY_KEY: "query";
        readonly START_KEY: "start";
        readonly DISPLAY_KEY: "display";
        readonly SORT_KEY: "sort";
    };
    readonly DEFAULT_OPTIONS: {
        readonly DISPLAY: 10;
        readonly START: 1;
        readonly SORT: "sim";
    };
};
export declare const SCRAPING_TYPES: {
    readonly RELATED_SEARCH: "related_search";
    readonly AUTOCOMPLETE: "autocomplete";
    readonly POPULAR_TOPICS: "popular_topics";
    readonly FREQUENTLY_SEARCHED: "frequently_searched";
};
export declare const BROWSER_CONFIG: {
    readonly VIEWPORT: {
        readonly WIDTH: 1920;
        readonly HEIGHT: 1080;
    };
    readonly USER_AGENT: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    readonly HEADLESS: true;
    readonly POOL: {
        readonly MIN_SIZE: 1;
        readonly MAX_SIZE: 5;
        readonly IDLE_TIMEOUT: 60000;
        readonly ACQUIRE_TIMEOUT: 30000;
    };
};
export declare const SCRAPING_ERRORS: {
    readonly BROWSER_LAUNCH_FAILED: "브라우저 실행에 실패했습니다";
    readonly PAGE_LOAD_FAILED: "페이지 로딩에 실패했습니다";
    readonly ELEMENT_NOT_FOUND: "요소를 찾을 수 없습니다";
    readonly TIMEOUT_EXCEEDED: "타임아웃이 초과되었습니다";
    readonly NETWORK_ERROR: "네트워크 오류가 발생했습니다";
    readonly INVALID_QUERY: "유효하지 않은 검색어입니다";
    readonly NO_RESULTS_FOUND: "검색 결과를 찾을 수 없습니다";
    readonly RATE_LIMIT_EXCEEDED: "요청 제한을 초과했습니다";
};
export declare const SCRAPING_LOGS: {
    readonly LEVELS: {
        readonly ERROR: "error";
        readonly WARN: "warn";
        readonly INFO: "info";
        readonly DEBUG: "debug";
    };
    readonly MESSAGES: {
        readonly SCRAPING_START: "스크래핑을 시작합니다";
        readonly SCRAPING_COMPLETE: "스크래핑이 완료되었습니다";
        readonly SCRAPING_FAILED: "스크래핑에 실패했습니다";
        readonly BROWSER_CREATED: "브라우저가 생성되었습니다";
        readonly BROWSER_CLOSED: "브라우저가 종료되었습니다";
        readonly PAGE_NAVIGATED: "페이지로 이동했습니다";
        readonly KEYWORDS_EXTRACTED: "키워드가 추출되었습니다";
    };
};
export declare const SEARCH_VOLUME: {
    readonly DEFAULT_RANGE: {
        readonly MIN: 100;
        readonly MAX: 10000;
    };
    readonly POPULARITY_MULTIPLIER: {
        readonly LOW: 1;
        readonly MEDIUM: 2;
        readonly HIGH: 5;
        readonly VERY_HIGH: 10;
    };
    readonly CATEGORIES: {
        readonly VERY_LOW: {
            readonly min: 0;
            readonly max: 100;
        };
        readonly LOW: {
            readonly min: 101;
            readonly max: 1000;
        };
        readonly MEDIUM: {
            readonly min: 1001;
            readonly max: 10000;
        };
        readonly HIGH: {
            readonly min: 10001;
            readonly max: 100000;
        };
        readonly VERY_HIGH: {
            readonly min: 100001;
            readonly max: number;
        };
    };
};
export declare const KEYWORD_FILTERING: {
    readonly ALLOWED_SELECTORS: readonly [".api_subject_bx", "._related_box", ".sds-comps-vertical-layout.sds-comps-full-layout.fds-collection-root", ".sds-comps-base-layout.sds-comps-inline-layout.fds-collection-root.QvXp8DhecF_dQ1pJ4MCf.gbHVDHMRi7To6vgU0dML"];
    readonly KEYWORD_BLACKLIST: readonly ["광고", "등록", "안내", "도움말", "서비스", "보기", "더보기", "이 광고가 표시된 이유", "등록 안내", "도움말", "전체필터", "필터", "정렬", "선택", "확인", "취소", "닫기", "열기", "네이버", "Naver", "NAVER", "네이버 아이디", "네이버페이", "Naver Pay", "네이버 로그인", "네이버 회원가입", "네이버에서", "네이버 서비스", "전체", "기타", "선택", "확인", "이전", "다음", "처음", "마지막", "목록", "리스트", "메뉴", "홈", "메인", "검색", "할인", "세일", "특가", "이벤트", "무료배송", "당일배송", "빠른배송", "쿠폰", "적립", "혜택", "지금 구매", "바로 구매", "장바구니"];
    readonly VALIDATION_RULES: {
        readonly MIN_LENGTH: 2;
        readonly MAX_LENGTH: 30;
        readonly ALLOWED_PATTERN: RegExp;
        readonly SIMILARITY_THRESHOLD: 0.8;
        readonly URL_PATTERN: RegExp;
    };
};
export type ScrapingType = typeof SCRAPING_TYPES[keyof typeof SCRAPING_TYPES];
export type ScrapingError = typeof SCRAPING_ERRORS[keyof typeof SCRAPING_ERRORS];
export type LogLevel = typeof SCRAPING_LOGS.LEVELS[keyof typeof SCRAPING_LOGS.LEVELS];
