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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scraping_service_1 = require("./scraping.service");
const scraping_dto_1 = require("./dto/scraping.dto");
let ScrapingController = class ScrapingController {
    constructor(scrapingService) {
        this.scrapingService = scrapingService;
    }
    async scrapeKeywords(scrapeDto) {
        try {
            console.log(`🕷️ 키워드 스크래핑 시작: ${scrapeDto.query}`);
            const result = await this.scrapingService.scrapeKeywords(scrapeDto);
            return {
                success: true,
                message: '키워드 스크래핑이 완료되었습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 키워드 스크래핑 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '키워드 스크래핑 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCollectionLogs(query, page = 1, limit = 20) {
        try {
            console.log(`📋 키워드 수집 로그 조회: ${query || '전체'}`);
            const result = await this.scrapingService.getCollectionLogs(query, page, limit);
            return {
                success: true,
                message: '키워드 수집 로그를 성공적으로 조회했습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 키워드 수집 로그 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '키워드 수집 로그 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getScrapingStats(days = 7) {
        try {
            console.log(`📊 스크래핑 통계 조회: 최근 ${days}일`);
            const result = await this.scrapingService.getScrapingStats(days);
            return {
                success: true,
                message: '스크래핑 통계를 성공적으로 조회했습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 스크래핑 통계 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '스크래핑 통계 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getBrowserPoolStatus() {
        try {
            console.log('🏊‍♂️ 브라우저 풀 상태 조회');
            const result = await this.scrapingService.getBrowserPoolStatus();
            return {
                success: true,
                message: '브라우저 풀 상태를 성공적으로 조회했습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 브라우저 풀 상태 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '브라우저 풀 상태 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ScrapingController = ScrapingController;
__decorate([
    (0, common_1.Post)('scrape'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 스크래핑 실행',
        description: '네이버에서 관련 키워드들을 스크래핑합니다.'
    }),
    (0, swagger_1.ApiBody)({ type: scraping_dto_1.ScrapeKeywordsDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '스크래핑 성공',
        type: scraping_dto_1.ScrapeKeywordsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scraping_dto_1.ScrapeKeywordsDto]),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "scrapeKeywords", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 수집 로그 조회',
        description: '키워드 수집 이력을 조회합니다.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'query',
        description: '검색할 키워드',
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        description: '페이지 번호',
        example: 1,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: '페이지당 개수',
        example: 20,
        required: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '로그 조회 성공',
        type: scraping_dto_1.GetCollectionLogsResponseDto,
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "getCollectionLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '스크래핑 통계 조회',
        description: '키워드 수집 통계를 조회합니다.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        description: '조회할 일수',
        example: 7,
        required: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '통계 조회 성공',
    }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "getScrapingStats", null);
__decorate([
    (0, common_1.Get)('browser-pool/status'),
    (0, swagger_1.ApiOperation)({
        summary: '브라우저 풀 상태 조회',
        description: '브라우저 풀의 현재 상태를 조회합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '브라우저 풀 상태 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScrapingController.prototype, "getBrowserPoolStatus", null);
exports.ScrapingController = ScrapingController = __decorate([
    (0, swagger_1.ApiTags)('scraping'),
    (0, common_1.Controller)('scraping'),
    __metadata("design:paramtypes", [scraping_service_1.ScrapingService])
], ScrapingController);
//# sourceMappingURL=scraping.controller.js.map