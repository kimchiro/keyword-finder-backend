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
exports.KeywordAnalytics = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const keyword_entity_1 = require("./keyword.entity");
let KeywordAnalytics = class KeywordAnalytics {
};
exports.KeywordAnalytics = KeywordAnalytics;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '고유 ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드 ID' }),
    (0, typeorm_1.Column)({ name: 'keyword_id', type: 'int' }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "keywordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => keyword_entity_1.Keyword, (keyword) => keyword.analytics, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'keyword_id' }),
    __metadata("design:type", keyword_entity_1.Keyword)
], KeywordAnalytics.prototype, "keywordEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 PC 검색량' }),
    (0, typeorm_1.Column)({ name: 'monthly_search_pc', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlySearchPc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 모바일 검색량' }),
    (0, typeorm_1.Column)({ name: 'monthly_search_mobile', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlySearchMobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 총 검색량' }),
    (0, typeorm_1.Column)({ name: 'monthly_search_total', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlySearchTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 블로그 콘텐츠 발행량' }),
    (0, typeorm_1.Column)({ name: 'monthly_content_blog', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlyContentBlog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 카페 콘텐츠 발행량' }),
    (0, typeorm_1.Column)({ name: 'monthly_content_cafe', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlyContentCafe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 총 콘텐츠 발행량' }),
    (0, typeorm_1.Column)({ name: 'monthly_content_all', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "monthlyContentAll", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '어제까지 예상 검색량' }),
    (0, typeorm_1.Column)({ name: 'estimated_search_yesterday', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "estimatedSearchYesterday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월말까지 예상 검색량' }),
    (0, typeorm_1.Column)({ name: 'estimated_search_end_month', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "estimatedSearchEndMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '블로그 콘텐츠 포화지수' }),
    (0, typeorm_1.Column)({ name: 'saturation_index_blog', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "saturationIndexBlog", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '카페 콘텐츠 포화지수' }),
    (0, typeorm_1.Column)({ name: 'saturation_index_cafe', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "saturationIndexCafe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '전체 콘텐츠 포화지수' }),
    (0, typeorm_1.Column)({ name: 'saturation_index_all', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], KeywordAnalytics.prototype, "saturationIndexAll", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석 날짜' }),
    (0, typeorm_1.Column)({ name: 'analysis_date', type: 'date' }),
    __metadata("design:type", Date)
], KeywordAnalytics.prototype, "analysisDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생성일시' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], KeywordAnalytics.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '수정일시' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], KeywordAnalytics.prototype, "updatedAt", void 0);
exports.KeywordAnalytics = KeywordAnalytics = __decorate([
    (0, typeorm_1.Entity)('keyword_analytics'),
    (0, typeorm_1.Unique)(['keywordId', 'analysisDate']),
    (0, typeorm_1.Index)(['keywordId']),
    (0, typeorm_1.Index)(['analysisDate']),
    (0, typeorm_1.Index)(['monthlySearchTotal'])
], KeywordAnalytics);
//# sourceMappingURL=keyword-analytics.entity.js.map