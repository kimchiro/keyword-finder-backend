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
exports.MultipleKeywordsLimitedDataResponseDto = exports.SingleKeywordFullDataResponseDto = exports.BlogSearchResponseDto = exports.MultipleKeywordsLimitedDataDto = exports.SingleKeywordFullDataDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SingleKeywordFullDataDto {
}
exports.SingleKeywordFullDataDto = SingleKeywordFullDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색어 (어제부터 작년 어제까지의 데이터를 자동으로 조회)',
        example: '맛집'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SingleKeywordFullDataDto.prototype, "keyword", void 0);
class MultipleKeywordsLimitedDataDto {
}
exports.MultipleKeywordsLimitedDataDto = MultipleKeywordsLimitedDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색어 목록 (최대 5개)',
        example: ['맛집', '카페', '레스토랑', '음식점', '디저트'],
        maxItems: 5
    }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], MultipleKeywordsLimitedDataDto.prototype, "keywords", void 0);
class BlogSearchResponseDto {
}
exports.BlogSearchResponseDto = BlogSearchResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], BlogSearchResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], BlogSearchResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검색 결과' }),
    __metadata("design:type", Object)
], BlogSearchResponseDto.prototype, "data", void 0);
class SingleKeywordFullDataResponseDto {
}
exports.SingleKeywordFullDataResponseDto = SingleKeywordFullDataResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], SingleKeywordFullDataResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], SingleKeywordFullDataResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드 전체 데이터' }),
    __metadata("design:type", Object)
], SingleKeywordFullDataResponseDto.prototype, "data", void 0);
class MultipleKeywordsLimitedDataResponseDto {
}
exports.MultipleKeywordsLimitedDataResponseDto = MultipleKeywordsLimitedDataResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], MultipleKeywordsLimitedDataResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], MultipleKeywordsLimitedDataResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드별 제한 데이터' }),
    __metadata("design:type", Object)
], MultipleKeywordsLimitedDataResponseDto.prototype, "data", void 0);
//# sourceMappingURL=naver-api.dto.js.map