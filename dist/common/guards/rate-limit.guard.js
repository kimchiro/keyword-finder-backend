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
var RateLimitGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRateLimit = exports.IpRateLimit = exports.NaverApiRateLimit = exports.RateLimit = exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
let RateLimitGuard = RateLimitGuard_1 = class RateLimitGuard {
    constructor(configService, reflector) {
        this.configService = configService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(RateLimitGuard_1.name);
        this.store = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const config = this.getRateLimitConfig(context);
        if (!config || (config.skipIf && config.skipIf(request))) {
            return true;
        }
        const key = this.generateKey(request, config);
        const now = Date.now();
        const windowMs = config.windowMs || 60000;
        const maxRequests = config.maxRequests || 100;
        let entry = this.store.get(key);
        if (!entry || now >= entry.resetTime) {
            entry = {
                count: 1,
                resetTime: now + windowMs,
            };
            this.store.set(key, entry);
            this.logger.debug(`새로운 Rate Limit 윈도우 시작: ${key} (1/${maxRequests})`);
            return true;
        }
        if (entry.count >= maxRequests) {
            const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
            this.logger.warn(`Rate Limit 초과: ${key} (${entry.count}/${maxRequests}), 재시도까지 ${remainingTime}초`);
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                message: config.message || 'Too many requests',
                retryAfter: remainingTime,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count++;
        this.logger.debug(`Rate Limit 카운트 증가: ${key} (${entry.count}/${maxRequests})`);
        return true;
    }
    getRateLimitConfig(context) {
        const handler = context.getHandler();
        const classRef = context.getClass();
        const handlerConfig = this.reflector.get('rate-limit', handler);
        const classConfig = this.reflector.get('rate-limit', classRef);
        return handlerConfig || classConfig || null;
    }
    generateKey(request, config) {
        if (config.keyGenerator) {
            return config.keyGenerator(request);
        }
        const ip = this.getClientIp(request);
        const userAgent = request.headers['user-agent'] || 'unknown';
        const path = request.route?.path || request.url;
        return `${ip}:${userAgent}:${path}`;
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            'unknown');
    }
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.store.entries()) {
            if (now >= entry.resetTime) {
                this.store.delete(key);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.logger.debug(`Rate Limit 스토어 정리: ${cleanedCount}개 엔트리 삭제`);
        }
    }
    onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
    getRateLimitStatus() {
        const now = Date.now();
        const status = {};
        this.store.forEach((entry, key) => {
            status[key] = {
                ...entry,
                remainingTime: Math.max(0, entry.resetTime - now),
            };
        });
        return status;
    }
    resetRateLimit(key) {
        return this.store.delete(key);
    }
    resetAllRateLimits() {
        this.store.clear();
        this.logger.log('모든 Rate Limit 리셋됨');
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = RateLimitGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        core_1.Reflector])
], RateLimitGuard);
const RateLimit = (config) => {
    return (target, propertyKey, descriptor) => {
        if (propertyKey && descriptor) {
            Reflect.defineMetadata('rate-limit', config, descriptor.value);
        }
        else {
            Reflect.defineMetadata('rate-limit', config, target);
        }
    };
};
exports.RateLimit = RateLimit;
const NaverApiRateLimit = (maxRequests = 100, windowMs = 60000) => {
    return (0, exports.RateLimit)({
        maxRequests,
        windowMs,
        keyGenerator: (request) => {
            const clientId = request.headers['x-naver-client-id'] || 'default';
            const ip = request.headers['x-forwarded-for']?.split(',')[0] ||
                request.connection?.remoteAddress || 'unknown';
            return `naver-api:${clientId}:${ip}`;
        },
        message: '네이버 API 호출 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
    });
};
exports.NaverApiRateLimit = NaverApiRateLimit;
const IpRateLimit = (maxRequests = 1000, windowMs = 60000) => {
    return (0, exports.RateLimit)({
        maxRequests,
        windowMs,
        keyGenerator: (request) => {
            const ip = request.headers['x-forwarded-for']?.split(',')[0] ||
                request.connection?.remoteAddress || 'unknown';
            return `ip:${ip}`;
        },
        message: 'IP별 요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
    });
};
exports.IpRateLimit = IpRateLimit;
const UserRateLimit = (maxRequests = 500, windowMs = 60000) => {
    return (0, exports.RateLimit)({
        maxRequests,
        windowMs,
        keyGenerator: (request) => {
            const userId = request.user?.id || request.headers['x-user-id'] || 'anonymous';
            return `user:${userId}`;
        },
        skipIf: (request) => {
            return request.user?.role === 'admin';
        },
        message: '사용자별 요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.',
    });
};
exports.UserRateLimit = UserRateLimit;
//# sourceMappingURL=rate-limit.guard.js.map