export declare const NAVER_API: {
    readonly BASE_URL: "https://openapi.naver.com";
    readonly ENDPOINTS: {
        readonly SEARCH_TREND: "/v1/datalab/search";
        readonly SHOPPING_INSIGHT: "/v1/datalab/shopping/categories";
        readonly BLOG_SEARCH: "/v1/search/blog";
        readonly NEWS_SEARCH: "/v1/search/news";
        readonly WEB_SEARCH: "/v1/search/webkr";
    };
    readonly HEADERS: {
        readonly CLIENT_ID: "X-Naver-Client-Id";
        readonly CLIENT_SECRET: "X-Naver-Client-Secret";
        readonly CONTENT_TYPE: "application/json";
        readonly USER_AGENT: "keyword-finder-backend/1.0.0";
    };
    readonly LIMITS: {
        readonly DEFAULT_TIMEOUT: 10000;
        readonly EXTENDED_TIMEOUT: 15000;
        readonly MAX_RETRIES: 3;
        readonly RETRY_DELAY: 1000;
        readonly MAX_KEYWORDS_PER_REQUEST: 5;
        readonly DAILY_REQUEST_LIMIT: 25000;
        readonly REQUESTS_PER_SECOND: 10;
    };
};
export declare const SEARCH_TREND_API: {
    readonly DEFAULT_DATE_RANGE: {
        readonly START_DATE: "2024-01-01";
        readonly END_DATE: "2024-12-31";
    };
    readonly TIME_UNITS: {
        readonly DATE: "date";
        readonly WEEK: "week";
        readonly MONTH: "month";
    };
    readonly CATEGORIES: {
        readonly ALL: 0;
        readonly POLITICS: 1;
        readonly ECONOMY: 2;
        readonly SOCIETY: 3;
        readonly LIFE_CULTURE: 4;
        readonly IT_SCIENCE: 5;
        readonly WORLD: 6;
        readonly ENTERTAINMENT: 7;
        readonly SPORTS: 8;
    };
};
export declare const HTTP_STATUS: {
    readonly SUCCESS: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly NO_CONTENT: 204;
    };
    readonly CLIENT_ERROR: {
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly METHOD_NOT_ALLOWED: 405;
        readonly TOO_MANY_REQUESTS: 429;
    };
    readonly SERVER_ERROR: {
        readonly INTERNAL_SERVER_ERROR: 500;
        readonly BAD_GATEWAY: 502;
        readonly SERVICE_UNAVAILABLE: 503;
        readonly GATEWAY_TIMEOUT: 504;
    };
};
export declare const API_RESPONSE: {
    readonly SUCCESS_MESSAGES: {
        readonly DATA_RETRIEVED: "데이터를 성공적으로 조회했습니다";
        readonly DATA_CREATED: "데이터를 성공적으로 생성했습니다";
        readonly DATA_UPDATED: "데이터를 성공적으로 업데이트했습니다";
        readonly DATA_DELETED: "데이터를 성공적으로 삭제했습니다";
    };
    readonly ERROR_MESSAGES: {
        readonly INVALID_REQUEST: "잘못된 요청입니다";
        readonly UNAUTHORIZED: "인증이 필요합니다";
        readonly FORBIDDEN: "접근 권한이 없습니다";
        readonly NOT_FOUND: "요청한 리소스를 찾을 수 없습니다";
        readonly RATE_LIMIT_EXCEEDED: "요청 제한을 초과했습니다";
        readonly INTERNAL_ERROR: "내부 서버 오류가 발생했습니다";
        readonly NETWORK_ERROR: "네트워크 오류가 발생했습니다";
        readonly TIMEOUT_ERROR: "요청 시간이 초과되었습니다";
        readonly INVALID_API_KEY: "API 키가 유효하지 않습니다";
        readonly QUOTA_EXCEEDED: "API 할당량을 초과했습니다";
    };
    readonly FORMAT: {
        readonly SUCCESS: "success";
        readonly ERROR: "error";
    };
};
export declare const RATE_LIMITING: {
    readonly DEFAULTS: {
        readonly TTL: 60;
        readonly MAX_REQUESTS: 100;
        readonly SKIP_SUCCESS_REQUESTS: false;
        readonly SKIP_IF: any;
    };
    readonly ENDPOINTS: {
        readonly SEARCH_TREND: {
            readonly TTL: 60;
            readonly MAX_REQUESTS: 10;
        };
        readonly SCRAPING: {
            readonly TTL: 60;
            readonly MAX_REQUESTS: 5;
        };
        readonly HEALTH_CHECK: {
            readonly TTL: 10;
            readonly MAX_REQUESTS: 100;
        };
    };
    readonly HEADERS: {
        readonly LIMIT: "X-RateLimit-Limit";
        readonly REMAINING: "X-RateLimit-Remaining";
        readonly RESET: "X-RateLimit-Reset";
    };
};
export declare const CACHE: {
    readonly DEFAULT_TTL: 300;
    readonly KEY_PREFIXES: {
        readonly SEARCH_TREND: "search_trend:";
        readonly KEYWORD_DATA: "keyword_data:";
        readonly SCRAPING_RESULT: "scraping_result:";
        readonly API_RESPONSE: "api_response:";
    };
    readonly TTL: {
        readonly SHORT: 60;
        readonly MEDIUM: 300;
        readonly LONG: 3600;
        readonly VERY_LONG: 86400;
    };
};
export declare const API_LOGS: {
    readonly LEVELS: {
        readonly ERROR: "error";
        readonly WARN: "warn";
        readonly INFO: "info";
        readonly DEBUG: "debug";
    };
    readonly MESSAGES: {
        readonly API_REQUEST_START: "API 요청을 시작합니다";
        readonly API_REQUEST_SUCCESS: "API 요청이 성공했습니다";
        readonly API_REQUEST_FAILED: "API 요청이 실패했습니다";
        readonly API_REQUEST_RETRY: "API 요청을 재시도합니다";
        readonly RATE_LIMIT_HIT: "Rate Limit에 도달했습니다";
        readonly CACHE_HIT: "캐시에서 데이터를 조회했습니다";
        readonly CACHE_MISS: "캐시에 데이터가 없습니다";
    };
};
export declare const VALIDATION: {
    readonly KEYWORD: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 100;
        readonly PATTERN: RegExp;
    };
    readonly DATE: {
        readonly FORMAT: "YYYY-MM-DD";
        readonly MIN_DATE: "2016-01-01";
        readonly MAX_DATE: "2024-12-31";
    };
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 10;
        readonly MAX_LIMIT: 100;
    };
};
export type TimeUnit = typeof SEARCH_TREND_API.TIME_UNITS[keyof typeof SEARCH_TREND_API.TIME_UNITS];
export type Category = typeof SEARCH_TREND_API.CATEGORIES[keyof typeof SEARCH_TREND_API.CATEGORIES];
