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
exports.KeywordAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const keyword_entity_1 = require("../../database/entities/keyword.entity");
const keyword_analytics_entity_1 = require("../../database/entities/keyword-analytics.entity");
let KeywordAnalysisService = class KeywordAnalysisService {
    constructor(keywordRepository, keywordAnalyticsRepository) {
        this.keywordRepository = keywordRepository;
        this.keywordAnalyticsRepository = keywordAnalyticsRepository;
    }
    async getServiceStatus() {
        const keywordCount = await this.keywordRepository.count();
        const analyticsCount = await this.keywordAnalyticsRepository.count();
        return {
            status: 'ok',
            keywordCount,
            analyticsCount,
            timestamp: new Date().toISOString(),
        };
    }
    async getKeywords(limit = 10) {
        try {
            const keywords = await this.keywordRepository.find({
                take: limit,
                order: { createdAt: 'DESC' },
            });
            return {
                success: true,
                data: keywords,
                count: keywords.length,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ 키워드 조회 오류:', error);
            throw error;
        }
    }
    async addKeyword(keyword) {
        try {
            const existing = await this.keywordRepository.findOne({
                where: { keyword },
            });
            if (existing) {
                return {
                    success: false,
                    message: '이미 존재하는 키워드입니다',
                    data: existing,
                };
            }
            const newKeyword = this.keywordRepository.create({
                keyword,
                status: 'active',
            });
            const saved = await this.keywordRepository.save(newKeyword);
            return {
                success: true,
                message: '키워드가 추가되었습니다',
                data: saved,
            };
        }
        catch (error) {
            console.error('❌ 키워드 추가 오류:', error);
            throw error;
        }
    }
};
exports.KeywordAnalysisService = KeywordAnalysisService;
exports.KeywordAnalysisService = KeywordAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(keyword_entity_1.Keyword)),
    __param(1, (0, typeorm_1.InjectRepository)(keyword_analytics_entity_1.KeywordAnalytics)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], KeywordAnalysisService);
//# sourceMappingURL=keyword-analysis.service.simple.js.map