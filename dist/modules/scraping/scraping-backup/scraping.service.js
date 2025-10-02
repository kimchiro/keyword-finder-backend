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
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ScrapingService = class ScrapingService {
    constructor(configService) {
        this.configService = configService;
    }
    async scrapeKeywords(scrapeDto) {
        const startTime = Date.now();
        console.log(`🕷️ 키워드 스크래핑 시작: ${scrapeDto.query}`);
        try {
            const { query, types = ['related_search'], maxResults = 50 } = scrapeDto;
            const scrapingResult = await this.performRealScraping(query, types, maxResults);
            const executionTime = (Date.now() - startTime) / 1000;
            const categories = scrapingResult.keywords.reduce((acc, keyword) => {
                acc[keyword.category] = (acc[keyword.category] || 0) + 1;
                return acc;
            }, {});
            console.log(`✅ 키워드 스크래핑 완료: ${scrapingResult.keywords.length}개, ${executionTime}초`);
            return {
                query,
                totalKeywords: scrapingResult.keywords.length,
                executionTime,
                categories,
                keywords: scrapingResult.keywords,
                collectionDetails: scrapingResult.collectionDetails,
            };
        }
        catch (error) {
            console.error('❌ ScrapingService.scrapeKeywords 오류:', error);
            throw error;
        }
    }
    async getCollectionLogs(query, page = 1, limit = 20) {
        try {
            const queryBuilder = this.keywordCollectionLogsRepository
                .createQueryBuilder('log')
                .orderBy('log.collectedAt', 'DESC');
            if (query) {
                queryBuilder.where('log.baseQuery LIKE :query OR log.collectedKeyword LIKE :query', {
                    query: `%${query}%`,
                });
            }
            const [logs, total] = await queryBuilder
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return {
                logs,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            console.error('❌ ScrapingService.getCollectionLogs 오류:', error);
            throw error;
        }
    }
    async getScrapingStats(days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const stats = await this.keywordCollectionLogsRepository
                .createQueryBuilder('log')
                .select([
                'DATE(log.collectedAt) as date',
                'log.collectionType as type',
                'COUNT(*) as count',
            ])
                .where('log.collectedAt >= :startDate', { startDate })
                .groupBy('DATE(log.collectedAt), log.collectionType')
                .orderBy('date', 'DESC')
                .getRawMany();
            const dailyStats = stats.reduce((acc, stat) => {
                const date = stat.date;
                if (!acc[date]) {
                    acc[date] = { date, total: 0, types: {} };
                }
                acc[date].types[stat.type] = parseInt(stat.count);
                acc[date].total += parseInt(stat.count);
                return acc;
            }, {});
            const typeStats = stats.reduce((acc, stat) => {
                acc[stat.type] = (acc[stat.type] || 0) + parseInt(stat.count);
                return acc;
            }, {});
            return {
                period: `최근 ${days}일`,
                dailyStats: Object.values(dailyStats),
                typeStats,
                totalKeywords: Object.values(typeStats).reduce((sum, count) => sum + count, 0),
            };
        }
        catch (error) {
            console.error('❌ ScrapingService.getScrapingStats 오류:', error);
            throw error;
        }
    }
    async performRealScraping(query, types, maxResults) {
        const { NaverScraper } = await Promise.resolve().then(() => require('./scraper/naver-scraper'));
        const scraper = new NaverScraper(this.browserPoolService);
        try {
            await scraper.initialize();
            const scrapingResult = await scraper.scrapeAllKeywords(query, types);
            console.log(`📊 스크래핑 완료: 총 ${scrapingResult.keywords.length}개 키워드 (개수 제한 없음)`);
            const formattedKeywords = scrapingResult.keywords.map((keyword) => ({
                keyword: keyword.keyword,
                category: keyword.category,
                rank: keyword.rank,
                source: keyword.source,
                competition: keyword.competition || 'medium',
                similarity: keyword.similarity || 'medium',
            }));
            return {
                keywords: formattedKeywords,
                collectionDetails: scrapingResult.collectionDetails
            };
        }
        finally {
            await scraper.close();
        }
    }
    async getBrowserPoolStatus() {
        return {
            status: 'disabled',
            message: '브라우저 풀 서비스가 비활성화되었습니다',
            timestamp: new Date().toISOString()
        };
    }
    async findOrCreateKeyword(keywordText) {
        console.log(`🆕 키워드 처리 (임시): ${keywordText}`);
        return { id: Date.now(), keyword: keywordText, status: 'active' };
    }
    async saveCollectionLogs(baseQuery, keywords) {
        try {
            console.log(`📝 수집 로그 저장 (임시 비활성화): ${keywords.length}개`);
        }
        catch (error) {
            console.error('❌ 수집 로그 저장 실패:', error);
        }
    }
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map