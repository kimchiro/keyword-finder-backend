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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let HealthService = class HealthService {
    constructor(configService, dataSource) {
        this.configService = configService;
        this.dataSource = dataSource;
    }
    async check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '2.0.0',
            environment: this.configService.get('NODE_ENV', 'development'),
        };
    }
    async checkDatabase() {
        try {
            await this.dataSource.query('SELECT 1');
            return {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('❌ 데이터베이스 연결 실패:', error);
            throw new common_1.ServiceUnavailableException({
                status: 'error',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getSystemInfo() {
        const memoryUsage = process.memoryUsage();
        return {
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                pid: process.pid,
                uptime: process.uptime(),
            },
            memory: {
                rss: this.formatBytes(memoryUsage.rss),
                heapTotal: this.formatBytes(memoryUsage.heapTotal),
                heapUsed: this.formatBytes(memoryUsage.heapUsed),
                external: this.formatBytes(memoryUsage.external),
            },
            environment: {
                nodeEnv: this.configService.get('NODE_ENV', 'development'),
                port: this.configService.get('PORT', 3001),
                database: {
                    host: this.configService.get('MYSQL_HOST', 'localhost'),
                    port: this.configService.get('MYSQL_PORT', 3306),
                    database: this.configService.get('MYSQL_DATABASE', 'keyword_finder'),
                },
            },
            timestamp: new Date().toISOString(),
        };
    }
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.DataSource])
], HealthService);
//# sourceMappingURL=health.service.js.map