"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordAnalysisAggregate = void 0;
const value_objects_1 = require("../value-objects");
class KeywordAnalysisAggregate {
    constructor(keyword, analysisDate, analytics, relatedKeywords, chartData) {
        this._keyword = keyword;
        this._analysisDate = analysisDate;
        this._analytics = analytics;
        this._relatedKeywords = relatedKeywords;
        this._chartData = chartData;
    }
    get keyword() {
        return this._keyword;
    }
    get analysisDate() {
        return this._analysisDate;
    }
    get analytics() {
        return this._analytics;
    }
    get relatedKeywords() {
        return [...this._relatedKeywords];
    }
    get chartData() {
        return {
            searchTrends: [...this._chartData.searchTrends],
            monthlyRatios: [...this._chartData.monthlyRatios],
        };
    }
    get searchVolume() {
        const pc = this._analytics.monthlySearchPc;
        const mobile = this._analytics.monthlySearchMobile;
        const total = pc + mobile;
        return {
            pc,
            mobile,
            total,
            pcRatio: total > 0 ? Math.round((pc / total) * 100) : 0,
            mobileRatio: total > 0 ? Math.round((mobile / total) * 100) : 0,
        };
    }
    get relatedKeywordCount() {
        return this._relatedKeywords.length;
    }
    getTopRelatedKeywords(limit = 10) {
        return this._relatedKeywords
            .slice(0, limit)
            .map(keyword => ({ ...keyword }));
    }
    getMonthlyTrendSummary() {
        const ratios = this._chartData.monthlyRatios.map(item => item.searchRatio);
        if (ratios.length === 0) {
            return {
                averageRatio: 0,
                maxRatio: 0,
                minRatio: 0,
                trendDirection: 'stable',
            };
        }
        const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
        const maxRatio = Math.max(...ratios);
        const minRatio = Math.min(...ratios);
        let trendDirection = 'stable';
        if (ratios.length >= 6) {
            const recentAvg = ratios.slice(-3).reduce((sum, ratio) => sum + ratio, 0) / 3;
            const previousAvg = ratios.slice(-6, -3).reduce((sum, ratio) => sum + ratio, 0) / 3;
            if (recentAvg > previousAvg * 1.1) {
                trendDirection = 'up';
            }
            else if (recentAvg < previousAvg * 0.9) {
                trendDirection = 'down';
            }
        }
        return {
            averageRatio: Math.round(averageRatio * 100) / 100,
            maxRatio,
            minRatio,
            trendDirection,
        };
    }
    toDto() {
        return {
            analytics: this._analytics,
            relatedKeywords: this.relatedKeywords,
            chartData: this.chartData,
        };
    }
    validate() {
        try {
            if (!this._keyword || !this._analysisDate) {
                return false;
            }
            if (!this._analytics) {
                return false;
            }
            const analyticsDate = new value_objects_1.AnalysisDate(this._analytics.analysisDate);
            if (!this._analysisDate.isSameDay(analyticsDate)) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.KeywordAnalysisAggregate = KeywordAnalysisAggregate;
//# sourceMappingURL=keyword-analysis.aggregate.js.map