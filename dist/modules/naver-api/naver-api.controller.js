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
exports.NaverApiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rate_limit_guard_1 = require("../../common/guards/rate-limit.guard");
const naver_api_service_1 = require("./naver-api.service");
const naver_api_dto_1 = require("./dto/naver-api.dto");
let NaverApiController = class NaverApiController {
    constructor(naverApiService) {
        this.naverApiService = naverApiService;
    }
    async searchBlog(query, display, start, sort) {
        try {
            console.log(`🔍 네이버 블로그 검색: ${query}`);
            const result = await this.naverApiService.searchBlogs(query, display, start, sort);
            return {
                success: true,
                message: '블로그 검색이 완료되었습니다.',
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 블로그 검색 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '블로그 검색 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getContentCounts(query) {
        try {
            console.log(`📊 콘텐츠 수 조회: ${query}`);
            const result = await this.naverApiService.getContentCounts(query);
            return {
                success: true,
                message: '콘텐츠 수 조회가 완료되었습니다.',
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 콘텐츠 수 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '콘텐츠 수 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getContentCountsAndSave(query) {
        try {
            console.log(`💾 콘텐츠 수 조회 및 저장: ${query}`);
            const result = await this.naverApiService.getContentCountsAndSave(query);
            return {
                success: true,
                message: result.message,
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 콘텐츠 수 조회 및 저장 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '콘텐츠 수 조회 및 저장 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSingleKeywordFullData(request) {
        try {
            console.log(`🔍 단일 키워드 전체 데이터 조회: ${request.keyword}`);
            const result = await this.naverApiService.getSingleKeywordFullData(request);
            return {
                success: true,
                message: '단일 키워드 전체 데이터 조회가 완료되었습니다.',
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 단일 키워드 전체 데이터 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '단일 키워드 전체 데이터 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMultipleKeywordsLimitedData(request) {
        try {
            console.log(`📊 다중 키워드 제한 데이터 조회: ${request.keywords.join(', ')}`);
            const result = await this.naverApiService.getMultipleKeywordsLimitedData(request);
            return {
                success: true,
                message: '다중 키워드 제한 데이터 조회가 완료되었습니다.',
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 다중 키워드 제한 데이터 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '다중 키워드 제한 데이터 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NaverApiController = NaverApiController;
__decorate([
    (0, common_1.Get)('blog-search'),
    (0, rate_limit_guard_1.NaverApiRateLimit)(50, 60000),
    (0, swagger_1.ApiOperation)({
        summary: '네이버 블로그 검색 (상위 10개)',
        description: '네이버 블로그 검색 API를 통해 상위 10개 블로그 포스트를 검색합니다.'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'query',
        description: '검색어',
        example: '맛집'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'display',
        description: '검색 결과 개수 (1-100)',
        example: 10,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'start',
        description: '검색 시작 위치 (1-1000)',
        example: 1,
        required: false
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        description: '정렬 방식 (sim: 정확도순, date: 날짜순)',
        example: 'sim',
        required: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '검색 성공',
        type: naver_api_dto_1.BlogSearchResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('display')),
    __param(2, (0, common_1.Query)('start')),
    __param(3, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], NaverApiController.prototype, "searchBlog", null);
__decorate([
    (0, common_1.Get)('content-counts/:query'),
    (0, rate_limit_guard_1.NaverApiRateLimit)(30, 60000),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 콘텐츠 발행량 조회',
        description: '해당 키워드의 블로그, 카페 콘텐츠 발행량을 조회합니다.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'query',
        description: '검색어',
        example: '맛집'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '콘텐츠 수 조회 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NaverApiController.prototype, "getContentCounts", null);
__decorate([
    (0, common_1.Post)('content-counts-save'),
    (0, rate_limit_guard_1.NaverApiRateLimit)(20, 60000),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 콘텐츠 발행량 조회 및 저장',
        description: '해당 키워드의 블로그, 카페 콘텐츠 발행량을 조회하고 데이터베이스에 저장합니다.'
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: '검색어',
                    example: '맛집'
                }
            },
            required: ['query']
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '콘텐츠 수 조회 및 저장 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NaverApiController.prototype, "getContentCountsAndSave", null);
__decorate([
    (0, common_1.Post)('single-keyword-full-data'),
    (0, rate_limit_guard_1.NaverApiRateLimit)(10, 60000),
    (0, swagger_1.ApiOperation)({
        summary: '1개 키워드 전체 검색 결과',
        description: '1개 키워드의 모든 데이터를 조회합니다. 블로그 검색(상위 10개), 트렌드(어제~작년 어제)를 포함합니다.'
    }),
    (0, swagger_1.ApiBody)({ type: naver_api_dto_1.SingleKeywordFullDataDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '단일 키워드 전체 데이터 조회 성공',
        type: naver_api_dto_1.SingleKeywordFullDataResponseDto,
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
    __metadata("design:paramtypes", [naver_api_dto_1.SingleKeywordFullDataDto]),
    __metadata("design:returntype", Promise)
], NaverApiController.prototype, "getSingleKeywordFullData", null);
__decorate([
    (0, common_1.Post)('multiple-keywords-limited-data'),
    (0, rate_limit_guard_1.NaverApiRateLimit)(15, 60000),
    (0, swagger_1.ApiOperation)({
        summary: '5개 키워드 검색 결과',
        description: '최대 5개 키워드의 검색 결과를 조회합니다. 월간검색량과 누적발행량을 포함합니다.'
    }),
    (0, swagger_1.ApiBody)({ type: naver_api_dto_1.MultipleKeywordsLimitedDataDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '다중 키워드 제한 데이터 조회 성공',
        type: naver_api_dto_1.MultipleKeywordsLimitedDataResponseDto,
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
    __metadata("design:paramtypes", [naver_api_dto_1.MultipleKeywordsLimitedDataDto]),
    __metadata("design:returntype", Promise)
], NaverApiController.prototype, "getMultipleKeywordsLimitedData", null);
exports.NaverApiController = NaverApiController = __decorate([
    (0, swagger_1.ApiTags)('naver-api'),
    (0, common_1.Controller)('naver'),
    (0, common_1.UseGuards)(rate_limit_guard_1.RateLimitGuard),
    (0, rate_limit_guard_1.NaverApiRateLimit)(100, 60000),
    __metadata("design:paramtypes", [naver_api_service_1.NaverApiService])
], NaverApiController);
//# sourceMappingURL=naver-api.controller.js.map