"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get port() {
        return this.configService.get('PORT', 3000);
    }
    get nodeEnv() {
        return this.configService.get('NODE_ENV', 'development');
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get dbHost() {
        return this.configService.get('DB_HOST');
    }
    get dbPort() {
        return this.configService.get('DB_PORT');
    }
    get dbUsername() {
        return this.configService.get('DB_USERNAME');
    }
    get dbPassword() {
        return this.configService.get('DB_PASSWORD');
    }
    get dbDatabase() {
        return this.configService.get('DB_DATABASE');
    }
    get naverClientId() {
        return this.configService.get('NAVER_CLIENT_ID');
    }
    get naverClientSecret() {
        return this.configService.get('NAVER_CLIENT_SECRET');
    }
    get naverApiBaseUrl() {
        return this.configService.get('NAVER_API_BASE_URL', 'https://openapi.naver.com');
    }
    get apiTimeoutMs() {
        return this.configService.get('API_TIMEOUT_MS', 10000);
    }
    get apiExtendedTimeoutMs() {
        return this.configService.get('API_EXTENDED_TIMEOUT_MS', 15000);
    }
    get apiRetryCount() {
        return this.configService.get('API_RETRY_COUNT', 3);
    }
    get apiRetryDelayMs() {
        return this.configService.get('API_RETRY_DELAY_MS', 1000);
    }
    get scrapingMaxResults() {
        return this.configService.get('SCRAPING_MAX_RESULTS', 50);
    }
    get scrapingMaxKeywordsPerType() {
        return this.configService.get('SCRAPING_MAX_KEYWORDS_PER_TYPE', 10);
    }
    get scrapingPageTimeoutMs() {
        return this.configService.get('SCRAPING_PAGE_TIMEOUT_MS', 30000);
    }
    get scrapingDelayMs() {
        return this.configService.get('SCRAPING_DELAY_MS', 1000);
    }
    get defaultStartDate() {
        return this.configService.get('DEFAULT_START_DATE', '2024-01-01');
    }
    get defaultEndDate() {
        return this.configService.get('DEFAULT_END_DATE', '2024-12-31');
    }
    get browserPoolSize() {
        return this.configService.get('BROWSER_POOL_SIZE', 3);
    }
    get browserIdleTimeoutMs() {
        return this.configService.get('BROWSER_IDLE_TIMEOUT_MS', 60000);
    }
    get rateLimitTtl() {
        return this.configService.get('RATE_LIMIT_TTL', 60);
    }
    get rateLimitMax() {
        return this.configService.get('RATE_LIMIT_MAX', 100);
    }
    validateNaverApiKeys() {
        const clientId = this.naverClientId;
        const clientSecret = this.naverClientSecret;
        if (!clientId || !clientSecret) {
            throw new Error('네이버 API 키가 설정되지 않았습니다. NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 확인해주세요.');
        }
        return true;
    }
    validateDatabaseConfig() {
        const requiredFields = [
            { key: 'DB_HOST', value: this.dbHost },
            { key: 'DB_PORT', value: this.dbPort },
            { key: 'DB_USERNAME', value: this.dbUsername },
            { key: 'DB_PASSWORD', value: this.dbPassword },
            { key: 'DB_DATABASE', value: this.dbDatabase },
        ];
        const missingFields = requiredFields
            .filter(field => !field.value)
            .map(field => field.key);
        if (missingFields.length > 0) {
            throw new Error(`데이터베이스 설정이 누락되었습니다: ${missingFields.join(', ')}`);
        }
        return true;
    }
    validateAllConfigs() {
        try {
            this.validateDatabaseConfig();
            this.validateNaverApiKeys();
            console.log('✅ 모든 환경변수 검증이 완료되었습니다.');
            console.log(`🚀 서버가 포트 ${this.port}에서 ${this.nodeEnv} 모드로 시작됩니다.`);
        }
        catch (error) {
            console.error('❌ 환경변수 검증 실패:', error.message);
            throw error;
        }
    }
    getConfigSummary() {
        return {
            server: {
                port: this.port,
                nodeEnv: this.nodeEnv,
            },
            database: {
                host: this.dbHost,
                port: this.dbPort,
                database: this.dbDatabase,
            },
            api: {
                timeoutMs: this.apiTimeoutMs,
                extendedTimeoutMs: this.apiExtendedTimeoutMs,
                retryCount: this.apiRetryCount,
                retryDelayMs: this.apiRetryDelayMs,
            },
            scraping: {
                maxResults: this.scrapingMaxResults,
                maxKeywordsPerType: this.scrapingMaxKeywordsPerType,
                pageTimeoutMs: this.scrapingPageTimeoutMs,
                delayMs: this.scrapingDelayMs,
            },
            dateRange: {
                defaultStartDate: this.defaultStartDate,
                defaultEndDate: this.defaultEndDate,
            },
            browser: {
                poolSize: this.browserPoolSize,
                idleTimeoutMs: this.browserIdleTimeoutMs,
            },
            rateLimit: {
                ttl: this.rateLimitTtl,
                max: this.rateLimitMax,
            },
        };
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app.config.js.map