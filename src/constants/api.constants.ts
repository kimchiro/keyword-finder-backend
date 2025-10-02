/**
 * API 관련 상수 정의
 * 네이버 API 및 기타 외부 API 관련 설정을 중앙 집중식으로 관리합니다.
 */

/**
 * 네이버 API 관련 상수
 */
export const NAVER_API = {
  /** 기본 URL */
  BASE_URL: 'https://openapi.naver.com',
  
  /** API 엔드포인트 */
  ENDPOINTS: {
    /** 검색 트렌드 API */
    SEARCH_TREND: '/v1/datalab/search',
    
    /** 쇼핑 인사이트 API */
    SHOPPING_INSIGHT: '/v1/datalab/shopping/categories',
    
    /** 블로그 검색 API */
    BLOG_SEARCH: '/v1/search/blog',
    
    /** 뉴스 검색 API */
    NEWS_SEARCH: '/v1/search/news',
    
    /** 웹 검색 API */
    WEB_SEARCH: '/v1/search/webkr',
  },
  
  /** HTTP 헤더 */
  HEADERS: {
    CLIENT_ID: 'X-Naver-Client-Id',
    CLIENT_SECRET: 'X-Naver-Client-Secret',
    CONTENT_TYPE: 'application/json',
    USER_AGENT: 'keyword-finder-backend/1.0.0',
  },
  
  /** 요청 제한 */
  LIMITS: {
    /** 기본 타임아웃 (ms) */
    DEFAULT_TIMEOUT: 10000,
    
    /** 확장 타임아웃 (ms) */
    EXTENDED_TIMEOUT: 15000,
    
    /** 최대 재시도 횟수 */
    MAX_RETRIES: 3,
    
    /** 재시도 간격 (ms) */
    RETRY_DELAY: 1000,
    
    /** 요청당 최대 키워드 수 */
    MAX_KEYWORDS_PER_REQUEST: 5,
    
    /** 일일 요청 제한 */
    DAILY_REQUEST_LIMIT: 25000,
    
    /** 초당 요청 제한 */
    REQUESTS_PER_SECOND: 10,
  },
} as const;

/**
 * 검색 트렌드 API 관련 상수
 */
export const SEARCH_TREND_API = {
  /** 기본 날짜 범위 */
  DEFAULT_DATE_RANGE: {
    START_DATE: '2024-01-01',
    END_DATE: '2024-12-31',
  },
  
  /** 지원되는 시간 단위 */
  TIME_UNITS: {
    DATE: 'date',
    WEEK: 'week',
    MONTH: 'month',
  },
  
  
  /** 카테고리 */
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
} as const;

/**
 * HTTP 상태 코드 관련 상수
 */
export const HTTP_STATUS = {
  /** 성공 */
  SUCCESS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
  },
  
  /** 클라이언트 오류 */
  CLIENT_ERROR: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    TOO_MANY_REQUESTS: 429,
  },
  
  /** 서버 오류 */
  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },
} as const;

/**
 * API 응답 관련 상수
 */
export const API_RESPONSE = {
  /** 성공 메시지 */
  SUCCESS_MESSAGES: {
    DATA_RETRIEVED: '데이터를 성공적으로 조회했습니다',
    DATA_CREATED: '데이터를 성공적으로 생성했습니다',
    DATA_UPDATED: '데이터를 성공적으로 업데이트했습니다',
    DATA_DELETED: '데이터를 성공적으로 삭제했습니다',
  },
  
  /** 오류 메시지 */
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
  
  /** 응답 형식 */
  FORMAT: {
    SUCCESS: 'success',
    ERROR: 'error',
  },
} as const;

/**
 * Rate Limiting 관련 상수
 */
export const RATE_LIMITING = {
  /** 기본 설정 */
  DEFAULTS: {
    TTL: 60, // 초
    MAX_REQUESTS: 100,
    SKIP_SUCCESS_REQUESTS: false,
    SKIP_IF: null,
  },
  
  /** 엔드포인트별 제한 */
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
  
  /** 헤더 이름 */
  HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset',
  },
} as const;

/**
 * 캐시 관련 상수
 */
export const CACHE = {
  /** 기본 TTL (초) */
  DEFAULT_TTL: 300, // 5분
  
  /** 키 접두사 */
  KEY_PREFIXES: {
    SEARCH_TREND: 'search_trend:',
    KEYWORD_DATA: 'keyword_data:',
    SCRAPING_RESULT: 'scraping_result:',
    API_RESPONSE: 'api_response:',
  },
  
  /** TTL 설정 */
  TTL: {
    SHORT: 60, // 1분
    MEDIUM: 300, // 5분
    LONG: 3600, // 1시간
    VERY_LONG: 86400, // 24시간
  },
} as const;

/**
 * 로깅 관련 상수
 */
export const API_LOGS = {
  /** 로그 레벨 */
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },
  
  /** 로그 메시지 */
  MESSAGES: {
    API_REQUEST_START: 'API 요청을 시작합니다',
    API_REQUEST_SUCCESS: 'API 요청이 성공했습니다',
    API_REQUEST_FAILED: 'API 요청이 실패했습니다',
    API_REQUEST_RETRY: 'API 요청을 재시도합니다',
    RATE_LIMIT_HIT: 'Rate Limit에 도달했습니다',
    CACHE_HIT: '캐시에서 데이터를 조회했습니다',
    CACHE_MISS: '캐시에 데이터가 없습니다',
  },
} as const;

/**
 * 데이터 검증 관련 상수
 */
export const VALIDATION = {
  /** 키워드 검증 */
  KEYWORD: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[가-힣a-zA-Z0-9\s\-_]+$/,
  },
  
  /** 날짜 검증 */
  DATE: {
    FORMAT: 'YYYY-MM-DD',
    MIN_DATE: '2016-01-01',
    MAX_DATE: '2024-12-31',
  },
  
  /** 페이징 검증 */
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;

/**
 * 타입 정의를 위한 유틸리티
 */
export type TimeUnit = typeof SEARCH_TREND_API.TIME_UNITS[keyof typeof SEARCH_TREND_API.TIME_UNITS];
export type Category = typeof SEARCH_TREND_API.CATEGORIES[keyof typeof SEARCH_TREND_API.CATEGORIES];
