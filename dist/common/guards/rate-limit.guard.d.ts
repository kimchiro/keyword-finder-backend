import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
export interface RateLimitConfig {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (request: any) => string;
    skipIf?: (request: any) => boolean;
    message?: string;
}
export interface RateLimitEntry {
    count: number;
    resetTime: number;
}
export declare class RateLimitGuard implements CanActivate {
    private configService;
    private reflector;
    private readonly logger;
    private readonly store;
    private readonly cleanupInterval;
    constructor(configService: ConfigService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getRateLimitConfig;
    private generateKey;
    private getClientIp;
    private cleanup;
    onModuleDestroy(): void;
    getRateLimitStatus(): Record<string, RateLimitEntry & {
        remainingTime: number;
    }>;
    resetRateLimit(key: string): boolean;
    resetAllRateLimits(): void;
}
export declare const RateLimit: (config: RateLimitConfig) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare const NaverApiRateLimit: (maxRequests?: number, windowMs?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare const IpRateLimit: (maxRequests?: number, windowMs?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare const UserRateLimit: (maxRequests?: number, windowMs?: number) => (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
