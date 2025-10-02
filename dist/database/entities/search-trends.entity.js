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
exports.SearchTrends = exports.PeriodType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const keyword_entity_1 = require("./keyword.entity");
var PeriodType;
(function (PeriodType) {
    PeriodType["DAILY"] = "daily";
    PeriodType["WEEKLY"] = "weekly";
    PeriodType["MONTHLY"] = "monthly";
})(PeriodType || (exports.PeriodType = PeriodType = {}));
let SearchTrends = class SearchTrends {
};
exports.SearchTrends = SearchTrends;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '고유 ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SearchTrends.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드 ID' }),
    (0, typeorm_1.Column)({ name: 'keyword_id', type: 'int' }),
    __metadata("design:type", Number)
], SearchTrends.prototype, "keywordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => keyword_entity_1.Keyword, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'keyword_id' }),
    __metadata("design:type", keyword_entity_1.Keyword)
], SearchTrends.prototype, "keywordEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '기간 타입', enum: PeriodType }),
    (0, typeorm_1.Column)({
        name: 'period_type',
        type: 'enum',
        enum: PeriodType,
    }),
    __metadata("design:type", String)
], SearchTrends.prototype, "periodType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '기간 값 (YYYY-MM-DD 또는 YYYY-MM)' }),
    (0, typeorm_1.Column)({ name: 'period_value', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], SearchTrends.prototype, "periodValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검색량' }),
    (0, typeorm_1.Column)({ name: 'search_volume', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], SearchTrends.prototype, "searchVolume", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검색 비율' }),
    (0, typeorm_1.Column)({ name: 'search_ratio', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], SearchTrends.prototype, "searchRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생성일시' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SearchTrends.prototype, "createdAt", void 0);
exports.SearchTrends = SearchTrends = __decorate([
    (0, typeorm_1.Entity)('search_trends'),
    (0, typeorm_1.Unique)(['keywordId', 'periodType', 'periodValue']),
    (0, typeorm_1.Index)(['keywordId']),
    (0, typeorm_1.Index)(['periodType']),
    (0, typeorm_1.Index)(['periodValue']),
    (0, typeorm_1.Index)(['keywordId', 'periodType'])
], SearchTrends);
//# sourceMappingURL=search-trends.entity.js.map