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
exports.GetAnalysisResponseDto = exports.KeywordAnalysisResponseDto = exports.AnalyzeKeywordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const api_constants_1 = require("../../../constants/api.constants");
class AnalyzeKeywordDto {
}
exports.AnalyzeKeywordDto = AnalyzeKeywordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석할 키워드', example: '맛집' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnalyzeKeywordDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '분석 날짜 (선택사항)',
        example: api_constants_1.SEARCH_TREND_API.DEFAULT_DATE_RANGE.START_DATE,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AnalyzeKeywordDto.prototype, "analysisDate", void 0);
class KeywordAnalysisResponseDto {
}
exports.KeywordAnalysisResponseDto = KeywordAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], KeywordAnalysisResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], KeywordAnalysisResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석 데이터' }),
    __metadata("design:type", Object)
], KeywordAnalysisResponseDto.prototype, "data", void 0);
class GetAnalysisResponseDto {
}
exports.GetAnalysisResponseDto = GetAnalysisResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], GetAnalysisResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], GetAnalysisResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석 결과' }),
    __metadata("design:type", Object)
], GetAnalysisResponseDto.prototype, "data", void 0);
//# sourceMappingURL=keyword-analysis.dto.js.map