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
exports.KeywordAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const keyword_analysis_service_simple_1 = require("./keyword-analysis.service.simple");
let KeywordAnalysisController = class KeywordAnalysisController {
    constructor(keywordAnalysisService) {
        this.keywordAnalysisService = keywordAnalysisService;
    }
    async getServiceStatus() {
        try {
            const result = await this.keywordAnalysisService.getServiceStatus();
            return {
                success: true,
                message: '키워드 분석 서비스 상태 조회 완료',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '서비스 상태 조회 실패',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getKeywords(limit) {
        try {
            const result = await this.keywordAnalysisService.getKeywords(limit);
            return {
                success: true,
                message: '키워드 목록 조회 완료',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '키워드 목록 조회 실패',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addKeyword(keyword) {
        try {
            if (!keyword) {
                throw new common_1.HttpException({
                    success: false,
                    message: '키워드가 필요합니다',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.keywordAnalysisService.addKeyword(keyword);
            return {
                success: true,
                message: '키워드 추가 완료',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: '키워드 추가 실패',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.KeywordAnalysisController = KeywordAnalysisController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 분석 서비스 상태 확인',
        description: '키워드 분석 서비스의 상태와 데이터 통계를 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '서비스 상태 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "getServiceStatus", null);
__decorate([
    (0, common_1.Get)('keywords'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 목록 조회',
        description: '저장된 키워드 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: '조회할 키워드 개수',
        required: false,
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '키워드 목록 조회 성공',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "getKeywords", null);
__decorate([
    (0, common_1.Post)('keywords'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 추가',
        description: '새로운 키워드를 추가합니다.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                keyword: {
                    type: 'string',
                    description: '추가할 키워드',
                    example: '맛집',
                },
            },
            required: ['keyword'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '키워드 추가 성공',
    }),
    __param(0, (0, common_1.Body)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "addKeyword", null);
exports.KeywordAnalysisController = KeywordAnalysisController = __decorate([
    (0, swagger_1.ApiTags)('keyword-analysis'),
    (0, common_1.Controller)('keyword-analysis'),
    __metadata("design:paramtypes", [keyword_analysis_service_simple_1.KeywordAnalysisService])
], KeywordAnalysisController);
//# sourceMappingURL=keyword-analysis.controller.simple.js.map