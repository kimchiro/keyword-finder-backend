export declare class EnvironmentVariables {
    PORT?: number;
    NODE_ENV?: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    NAVER_CLIENT_ID: string;
    NAVER_CLIENT_SECRET: string;
    NAVER_API_BASE_URL?: string;
    API_TIMEOUT_MS?: number;
    API_EXTENDED_TIMEOUT_MS?: number;
    API_RETRY_COUNT?: number;
    API_RETRY_DELAY_MS?: number;
    SCRAPING_MAX_RESULTS?: number;
    SCRAPING_MAX_KEYWORDS_PER_TYPE?: number;
    SCRAPING_PAGE_TIMEOUT_MS?: number;
    SCRAPING_DELAY_MS?: number;
    DEFAULT_START_DATE?: string;
    DEFAULT_END_DATE?: string;
    BROWSER_POOL_SIZE?: number;
    BROWSER_IDLE_TIMEOUT_MS?: number;
    RATE_LIMIT_TTL?: number;
    RATE_LIMIT_MAX?: number;
}
export declare function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables;
