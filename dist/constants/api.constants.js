"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION = exports.API_LOGS = exports.CACHE = exports.RATE_LIMITING = exports.API_RESPONSE = exports.HTTP_STATUS = exports.SEARCH_TREND_API = exports.NAVER_API = void 0;
exports.NAVER_API = {
    BASE_URL: 'https://openapi.naver.com',
    ENDPOINTS: {
        SEARCH_TREND: '/v1/datalab/search',
        SHOPPING_INSIGHT: '/v1/datalab/shopping/categories',
        BLOG_SEARCH: '/v1/search/blog',
        NEWS_SEARCH: '/v1/search/news',
        WEB_SEARCH: '/v1/search/webkr',
    },
    HEADERS: {
        CLIENT_ID: 'X-Naver-Client-Id',
        CLIENT_SECRET: 'X-Naver-Client-Secret',
        CONTENT_TYPE: 'application/json',
        USER_AGENT: 'keyword-finder-backend/1.0.0',
    },
    LIMITS: {
        DEFAULT_TIMEOUT: 10000,
        EXTENDED_TIMEOUT: 15000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        MAX_KEYWORDS_PER_REQUEST: 5,
        DAILY_REQUEST_LIMIT: 25000,
        REQUESTS_PER_SECOND: 10,
    },
};
exports.SEARCH_TREND_API = {
    DEFAULT_DATE_RANGE: {
        START_DATE: '2024-01-01',
        END_DATE: '2024-12-31',
    },
    TIME_UNITS: {
        DATE: 'date',
        WEEK: 'week',
        MONTH: 'month',
    },
    CATEGORIES: {
        ALL: 0,
        POLITICS: 1,
        ECONOMY: 2,
        SOCIETY: 3,
        LIFE_CULTURE: 4,
        IT_SCIENCE: 5,
        WORLD: 6,
        ENTERTAINMENT: 7,
        SPORTS: 8,
    },
};
exports.HTTP_STATUS = {
    SUCCESS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        TOO_MANY_REQUESTS: 429,
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
    },
};
exports.API_RESPONSE = {
    SUCCESS_MESSAGES: {
        DATA_RETRIEVED: '데이터를 성공적으로 조회했습니다',
        DATA_CREATED: '데이터를 성공적으로 생성했습니다',
        DATA_UPDATED: '데이터를 성공적으로 업데이트했습니다',
        DATA_DELETED: '데이터를 성공적으로 삭제했습니다',
    },
    ERROR_MESSAGES: {
        INVALID_REQUEST: '잘못된 요청입니다',
        UNAUTHORIZED: '인증이 필요합니다',
        FORBIDDEN: '접근 권한이 없습니다',
        NOT_FOUND: '요청한 리소스를 찾을 수 없습니다',
        RATE_LIMIT_EXCEEDED: '요청 제한을 초과했습니다',
        INTERNAL_ERROR: '내부 서버 오류가 발생했습니다',
        NETWORK_ERROR: '네트워크 오류가 발생했습니다',
        TIMEOUT_ERROR: '요청 시간이 초과되었습니다',
        INVALID_API_KEY: 'API 키가 유효하지 않습니다',
        QUOTA_EXCEEDED: 'API 할당량을 초과했습니다',
    },
    FORMAT: {
        SUCCESS: 'success',
        ERROR: 'error',
    },
};
exports.RATE_LIMITING = {
    DEFAULTS: {
        TTL: 60,
        MAX_REQUESTS: 100,
        SKIP_SUCCESS_REQUESTS: false,
        SKIP_IF: null,
    },
    ENDPOINTS: {
        SEARCH_TREND: {
            TTL: 60,
            MAX_REQUESTS: 10,
        },
        SCRAPING: {
            TTL: 60,
            MAX_REQUESTS: 5,
        },
        HEALTH_CHECK: {
            TTL: 10,
            MAX_REQUESTS: 100,
        },
    },
    HEADERS: {
        LIMIT: 'X-RateLimit-Limit',
        REMAINING: 'X-RateLimit-Remaining',
        RESET: 'X-RateLimit-Reset',
    },
};
exports.CACHE = {
    DEFAULT_TTL: 300,
    KEY_PREFIXES: {
        SEARCH_TREND: 'search_trend:',
        KEYWORD_DATA: 'keyword_data:',
        SCRAPING_RESULT: 'scraping_result:',
        API_RESPONSE: 'api_response:',
    },
    TTL: {
        SHORT: 60,
        MEDIUM: 300,
        LONG: 3600,
        VERY_LONG: 86400,
    },
};
exports.API_LOGS = {
    LEVELS: {
        ERROR: 'error',
        WARN: 'warn',
        INFO: 'info',
        DEBUG: 'debug',
    },
    MESSAGES: {
        API_REQUEST_START: 'API 요청을 시작합니다',
        API_REQUEST_SUCCESS: 'API 요청이 성공했습니다',
        API_REQUEST_FAILED: 'API 요청이 실패했습니다',
        API_REQUEST_RETRY: 'API 요청을 재시도합니다',
        RATE_LIMIT_HIT: 'Rate Limit에 도달했습니다',
        CACHE_HIT: '캐시에서 데이터를 조회했습니다',
        CACHE_MISS: '캐시에 데이터가 없습니다',
    },
};
exports.VALIDATION = {
    KEYWORD: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
        PATTERN: /^[가-힣a-zA-Z0-9\s\-_]+$/,
    },
    DATE: {
        FORMAT: 'YYYY-MM-DD',
        MIN_DATE: '2016-01-01',
        MAX_DATE: '2024-12-31',
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
};
//# sourceMappingURL=api.constants.js.map