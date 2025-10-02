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
exports.MonthlySearchRatios = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const keyword_entity_1 = require("./keyword.entity");
let MonthlySearchRatios = class MonthlySearchRatios {
};
exports.MonthlySearchRatios = MonthlySearchRatios;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '고유 ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MonthlySearchRatios.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '키워드 ID' }),
    (0, typeorm_1.Column)({ name: 'keyword_id', type: 'int' }),
    __metadata("design:type", Number)
], MonthlySearchRatios.prototype, "keywordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => keyword_entity_1.Keyword, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'keyword_id' }),
    __metadata("design:type", keyword_entity_1.Keyword)
], MonthlySearchRatios.prototype, "keywordEntity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '월 (1-12)' }),
    (0, typeorm_1.Column)({ name: 'month_number', type: 'int' }),
    __metadata("design:type", Number)
], MonthlySearchRatios.prototype, "monthNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검색 비율' }),
    (0, typeorm_1.Column)({ name: 'search_ratio', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlySearchRatios.prototype, "searchRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '분석 연도' }),
    (0, typeorm_1.Column)({ name: 'analysis_year', type: 'year' }),
    __metadata("design:type", Number)
], MonthlySearchRatios.prototype, "analysisYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '생성일시' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MonthlySearchRatios.prototype, "createdAt", void 0);
exports.MonthlySearchRatios = MonthlySearchRatios = __decorate([
    (0, typeorm_1.Entity)('monthly_search_ratios'),
    (0, typeorm_1.Unique)(['keywordId', 'monthNumber', 'analysisYear']),
    (0, typeorm_1.Index)(['keywordId']),
    (0, typeorm_1.Index)(['monthNumber']),
    (0, typeorm_1.Index)(['analysisYear']),
    (0, typeorm_1.Index)(['keywordId', 'analysisYear']),
    (0, typeorm_1.Check)('"month_number" BETWEEN 1 AND 12')
], MonthlySearchRatios);
//# sourceMappingURL=monthly-search-ratios.entity.js.map