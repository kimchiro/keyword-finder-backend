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
exports.EnvironmentVariables = void 0;
exports.validateEnvironment = validateEnvironment;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class EnvironmentVariables {
    constructor() {
        this.PORT = 3000;
        this.NODE_ENV = 'development';
        this.NAVER_API_BASE_URL = 'https://openapi.naver.com';
        this.API_TIMEOUT_MS = 10000;
        this.API_EXTENDED_TIMEOUT_MS = 15000;
        this.API_RETRY_COUNT = 3;
        this.API_RETRY_DELAY_MS = 1000;
        this.SCRAPING_MAX_RESULTS = 50;
        this.SCRAPING_MAX_KEYWORDS_PER_TYPE = 10;
        this.SCRAPING_PAGE_TIMEOUT_MS = 30000;
        this.SCRAPING_DELAY_MS = 1000;
        this.DEFAULT_START_DATE = '2024-01-01';
        this.DEFAULT_END_DATE = '2024-12-31';
        this.BROWSER_POOL_SIZE = 3;
        this.BROWSER_IDLE_TIMEOUT_MS = 60000;
        this.RATE_LIMIT_TTL = 60;
        this.RATE_LIMIT_MAX = 100;
    }
}
exports.EnvironmentVariables = EnvironmentVariables;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_DATABASE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NAVER_CLIENT_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NAVER_CLIENT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NAVER_API_BASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "API_TIMEOUT_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "API_EXTENDED_TIMEOUT_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "API_RETRY_COUNT", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "API_RETRY_DELAY_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SCRAPING_MAX_RESULTS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SCRAPING_MAX_KEYWORDS_PER_TYPE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(60000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SCRAPING_PAGE_TIMEOUT_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(5000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SCRAPING_DELAY_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DEFAULT_START_DATE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DEFAULT_END_DATE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "BROWSER_POOL_SIZE", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10000),
    (0, class_validator_1.Max)(300000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "BROWSER_IDLE_TIMEOUT_MS", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "RATE_LIMIT_TTL", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "RATE_LIMIT_MAX", void 0);
function validateEnvironment(config) {
    const { validateSync } = require('class-validator');
    const { plainToClass } = require('class-transformer');
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        const errorMessages = errors.map(error => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
        }).join('\n');
        throw new Error(`환경변수 검증 실패:\n${errorMessages}`);
    }
    return validatedConfig;
}
//# sourceMappingURL=validation.schema.js.map