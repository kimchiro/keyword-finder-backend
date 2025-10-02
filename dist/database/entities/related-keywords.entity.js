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
exports.RelatedKeywords = exports.SimilarityScore = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const keyword_entity_1 = require("./keyword.entity");
var SimilarityScore;
(function (SimilarityScore) {
    SimilarityScore["LOW"] = "\uB0AE\uC74C";
    SimilarityScore["MEDIUM"] = "\uBCF4\uD1B5";
    SimilarityScore["HIGH"] = "\uB192\uC74C";
})(SimilarityScore || (exports.SimilarityScore = SimilarityScore = {}));
let RelatedKeywords = class RelatedKeywords {
};
exports.RelatedKeywords = RelatedKeywords;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '고유 ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '기준 키워드 ID' }),
    (0, typeorm_1.Column)({ name: 'base_keyword_id', type: 'int' }),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "baseKeywordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '연관 키워드 ID' }),
    (0, typeorm_1.Column)({ name: 'related_keyword_id', type: 'int' }),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "relatedKeywordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => keyword_entity_1.Keyword, (keyword) => keyword.relatedKeywords, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'base_keyword_id' }),
    __metadata("design:type", keyword_entity_1.Keyword)
], RelatedKeywords.prototype, "baseKeywordEntity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => keyword_entity_1.Keyword, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'related_keyword_id' }),
    __metadata("design:type", keyword_entity_1.Keyword)
], RelatedKeywords.prototype, "relatedKeywordEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월간 검색량' }),
    (0, typeorm_1.Column)({ name: 'monthly_search_volume', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "monthlySearchVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '블로그 누적 발행량' }),
    (0, typeorm_1.Column)({ name: 'blog_cumulative_posts', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "blogCumulativePosts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드 유사도', enum: SimilarityScore }),
    (0, typeorm_1.Column)({
        name: 'similarity_score',
        type: 'enum',
        enum: SimilarityScore,
        default: SimilarityScore.MEDIUM,
    }),
    __metadata("design:type", String)
], RelatedKeywords.prototype, "similarityScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '순위' }),
    (0, typeorm_1.Column)({ name: 'rank_position', type: 'int' }),
    __metadata("design:type", Number)
], RelatedKeywords.prototype, "rankPosition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석 날짜' }),
    (0, typeorm_1.Column)({ name: 'analysis_date', type: 'date' }),
    __metadata("design:type", Date)
], RelatedKeywords.prototype, "analysisDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생성일시' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RelatedKeywords.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '수정일시' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], RelatedKeywords.prototype, "updatedAt", void 0);
exports.RelatedKeywords = RelatedKeywords = __decorate([
    (0, typeorm_1.Entity)('related_keywords'),
    (0, typeorm_1.Unique)(['baseKeywordId', 'relatedKeywordId', 'analysisDate']),
    (0, typeorm_1.Index)(['baseKeywordId']),
    (0, typeorm_1.Index)(['relatedKeywordId']),
    (0, typeorm_1.Index)(['analysisDate']),
    (0, typeorm_1.Index)(['rankPosition']),
    (0, typeorm_1.Index)(['baseKeywordId', 'analysisDate']),
    (0, typeorm_1.Index)(['baseKeywordId', 'rankPosition'])
], RelatedKeywords);
//# sourceMappingURL=related-keywords.entity.js.map