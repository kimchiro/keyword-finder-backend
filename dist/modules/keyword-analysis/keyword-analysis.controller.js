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
const keyword_analysis_service_1 = require("./keyword-analysis.service");
const keyword_analysis_dto_1 = require("./dto/keyword-analysis.dto");
let KeywordAnalysisController = class KeywordAnalysisController {
    constructor(keywordAnalysisService) {
        this.keywordAnalysisService = keywordAnalysisService;
    }
    async analyzeKeyword(keyword) {
        try {
            console.log(`📊 키워드 분석 요청: ${keyword}`);
            const result = await this.keywordAnalysisService.analyzeKeyword(keyword);
            return {
                success: true,
                message: '키워드 분석이 완료되었습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 키워드 분석 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '키워드 분석 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getKeywordAnalysis(keyword) {
        try {
            console.log(`📋 키워드 분석 결과 조회: ${keyword}`);
            const result = await this.keywordAnalysisService.getKeywordAnalysis(keyword);
            if (!result.data.analytics) {
                throw new common_1.HttpException({
                    success: false,
                    message: '해당 키워드의 분석 결과를 찾을 수 없습니다.',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                message: '키워드 분석 결과를 성공적으로 조회했습니다.',
                data: result.data,
            };
        }
        catch (error) {
            console.error('❌ 키워드 분석 결과 조회 실패:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: '키워드 분석 결과 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAnalyzedKeywords() {
        try {
            const result = await this.keywordAnalysisService.getAnalyzedKeywords();
            return {
                success: true,
                message: '분석된 키워드 목록을 성공적으로 조회했습니다.',
                data: result,
            };
        }
        catch (error) {
            console.error('❌ 키워드 목록 조회 실패:', error);
            throw new common_1.HttpException({
                success: false,
                message: '키워드 목록 조회 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.KeywordAnalysisController = KeywordAnalysisController;
__decorate([
    (0, common_1.Post)('analyze/:keyword'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 분석 실행',
        description: '지정된 키워드에 대한 종합 분석을 실행합니다.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'keyword',
        description: '분석할 키워드',
        example: '맛집'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '분석 성공',
        type: keyword_analysis_dto_1.KeywordAnalysisResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Param)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "analyzeKeyword", null);
__decorate([
    (0, common_1.Get)('analysis/:keyword'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 분석 결과 조회',
        description: '저장된 키워드 분석 결과를 조회합니다.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'keyword',
        description: '조회할 키워드',
        example: '맛집'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '조회 성공',
        type: keyword_analysis_dto_1.GetAnalysisResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '분석 결과를 찾을 수 없음',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Param)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "getKeywordAnalysis", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({
        summary: '분석된 키워드 목록 조회',
        description: '분석이 완료된 키워드들의 목록을 조회합니다.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '목록 조회 성공',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KeywordAnalysisController.prototype, "getAnalyzedKeywords", null);
exports.KeywordAnalysisController = KeywordAnalysisController = __decorate([
    (0, swagger_1.ApiTags)('keyword-analysis'),
    (0, common_1.Controller)('keyword-analysis'),
    __metadata("design:paramtypes", [keyword_analysis_service_1.KeywordAnalysisService])
], KeywordAnalysisController);
//# sourceMappingURL=keyword-analysis.controller.js.map