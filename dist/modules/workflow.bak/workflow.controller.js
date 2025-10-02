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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("./workflow.service");
let WorkflowController = class WorkflowController {
    constructor(workflowService) {
        this.workflowService = workflowService;
    }
    async executeCompleteWorkflow(query) {
        try {
            console.log(`🎯 워크플로우 요청: ${query}`);
            if (!query || query.trim().length === 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: '키워드를 입력해주세요.',
                    error: 'INVALID_QUERY',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.workflowService.executeCompleteWorkflow(query.trim());
            console.log(`✅ 워크플로우 응답: ${query} - ${result.success ? '성공' : '실패'}`);
            return result;
        }
        catch (error) {
            console.error('❌ 워크플로우 컨트롤러 오류:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: '워크플로우 실행 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkHealth() {
        try {
            console.log('🔍 워크플로우 상태 체크 요청');
            const healthStatus = await this.workflowService.checkWorkflowHealth();
            console.log('✅ 워크플로우 상태 체크 완료:', healthStatus.success);
            return healthStatus;
        }
        catch (error) {
            console.error('❌ 워크플로우 상태 체크 오류:', error);
            throw new common_1.HttpException({
                success: false,
                services: {
                    naverApi: false,
                    scraping: false,
                    keywordAnalysis: false,
                },
                message: '상태 체크 중 오류가 발생했습니다.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)('complete/:query'),
    (0, swagger_1.ApiOperation)({
        summary: '키워드 분석 워크플로우 실행',
        description: `
    확장된 키워드 분석 워크플로우:
    1. 스크래핑 실행 (smartblock, related_search) - 개수 제한 없음
    2. 스크래핑 데이터 DB 저장 (카테고리 분류, rank 없음)
    3. 네이버 API 1개 키워드 데이터 수집 (블로그 검색 + 데이터랩)
    4. 콘텐츠 발행량 조회 및 저장 (별도 API)
    5. 키워드 분석 데이터 저장
    6. 통합 결과 반환
    `,
    }),
    (0, swagger_1.ApiParam)({
        name: 'query',
        description: '분석할 키워드',
        example: '맛집',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '워크플로우 실행 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', example: '맛집' },
                        scrapingData: { type: 'object', description: '스크래핑 결과 데이터 (개수 제한 없음)' },
                        naverApiData: { type: 'object', description: '네이버 API 결과 데이터 (블로그 + 데이터랩)' },
                        contentCountsData: { type: 'object', description: '콘텐츠 발행량 데이터 (별도 API)' },
                        analysisData: { type: 'object', description: '키워드 분석 데이터' },
                        topKeywords: { type: 'array', description: '상위 키워드 목록' },
                        keywordsWithRank: { type: 'array', description: '순위 포함 키워드 정보' },
                        executionTime: { type: 'number', example: 5.2 },
                        timestamp: { type: 'string', example: '2025-09-23T12:00:00.000Z' },
                    },
                },
                message: { type: 'string', example: '키워드 "맛집" 분석이 완료되었습니다.' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '서버 오류',
    }),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "executeCompleteWorkflow", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: '워크플로우 상태 체크',
        description: '워크플로우의 모든 의존 서비스 상태를 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '상태 체크 완료',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                services: {
                    type: 'object',
                    properties: {
                        naverApi: { type: 'boolean', example: true },
                        scraping: { type: 'boolean', example: true },
                        keywordAnalysis: { type: 'boolean', example: true },
                    },
                },
                message: { type: 'string', example: '모든 서비스가 정상 작동 중입니다.' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "checkHealth", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('Workflow', '키워드 분석 워크플로우'),
    (0, common_1.Controller)('workflow'),
    __metadata("design:paramtypes", [typeof (_a = typeof workflow_service_1.WorkflowService !== "undefined" && workflow_service_1.WorkflowService) === "function" ? _a : Object])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map