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
exports.GetCollectionLogsResponseDto = exports.ScrapeKeywordsResponseDto = exports.ScrapeKeywordsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ScrapeKeywordsDto {
}
exports.ScrapeKeywordsDto = ScrapeKeywordsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '스크래핑할 키워드', example: '맛집' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScrapeKeywordsDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '수집할 키워드 타입들 (trending, smartblock만 지원)',
        example: ['trending', 'smartblock'],
        isArray: true,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ScrapeKeywordsDto.prototype, "types", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '최대 수집 개수',
        example: 50,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ScrapeKeywordsDto.prototype, "maxResults", void 0);
class ScrapeKeywordsResponseDto {
}
exports.ScrapeKeywordsResponseDto = ScrapeKeywordsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], ScrapeKeywordsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], ScrapeKeywordsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '스크래핑 결과' }),
    __metadata("design:type", Object)
], ScrapeKeywordsResponseDto.prototype, "data", void 0);
class GetCollectionLogsResponseDto {
}
exports.GetCollectionLogsResponseDto = GetCollectionLogsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 여부' }),
    __metadata("design:type", Boolean)
], GetCollectionLogsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '메시지' }),
    __metadata("design:type", String)
], GetCollectionLogsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '수집 로그' }),
    __metadata("design:type", Object)
], GetCollectionLogsResponseDto.prototype, "data", void 0);
//# sourceMappingURL=scraping.dto.js.map