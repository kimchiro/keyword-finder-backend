"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyword = void 0;
class Keyword {
    constructor(value) {
        this.validate(value);
        this._value = this.normalize(value);
    }
    get value() {
        return this._value;
    }
    validate(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('키워드는 문자열이어야 합니다.');
        }
        if (value.trim().length === 0) {
            throw new Error('키워드는 빈 문자열일 수 없습니다.');
        }
        if (value.length > 100) {
            throw new Error('키워드는 100자를 초과할 수 없습니다.');
        }
        const allowedPattern = /^[가-힣a-zA-Z0-9\s\-_().]+$/;
        if (!allowedPattern.test(value)) {
            throw new Error('키워드에 허용되지 않는 특수문자가 포함되어 있습니다.');
        }
    }
    normalize(value) {
        return value.trim().toLowerCase();
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
}
exports.Keyword = Keyword;
//# sourceMappingURL=keyword.vo.js.map