"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisDate = void 0;
class AnalysisDate {
    constructor(value) {
        if (value) {
            this._value = this.parseDate(value);
        }
        else {
            this._value = new Date();
        }
        this.validate();
    }
    get value() {
        return new Date(this._value);
    }
    get dateString() {
        return this._value.toISOString().split('T')[0];
    }
    get year() {
        return this._value.getFullYear();
    }
    get month() {
        return this._value.getMonth() + 1;
    }
    get day() {
        return this._value.getDate();
    }
    parseDate(value) {
        if (value instanceof Date) {
            return new Date(value);
        }
        if (typeof value === 'string') {
            const parsed = new Date(value);
            if (isNaN(parsed.getTime())) {
                throw new Error('유효하지 않은 날짜 형식입니다.');
            }
            return parsed;
        }
        throw new Error('날짜는 Date 객체 또는 문자열이어야 합니다.');
    }
    validate() {
        if (isNaN(this._value.getTime())) {
            throw new Error('유효하지 않은 날짜입니다.');
        }
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        if (this._value < oneYearAgo || this._value > oneYearLater) {
            throw new Error('분석 날짜는 현재 날짜 기준 1년 전후 범위 내여야 합니다.');
        }
    }
    equals(other) {
        return this._value.getTime() === other._value.getTime();
    }
    isSameDay(other) {
        return this.dateString === other.dateString;
    }
    toString() {
        return this.dateString;
    }
}
exports.AnalysisDate = AnalysisDate;
//# sourceMappingURL=analysis-date.vo.js.map