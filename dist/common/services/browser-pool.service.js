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
var BrowserPoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserPoolService = void 0;
const common_1 = require("@nestjs/common");
const playwright_1 = require("playwright");
let BrowserPoolService = BrowserPoolService_1 = class BrowserPoolService {
    constructor() {
        this.logger = new common_1.Logger(BrowserPoolService_1.name);
        this.pool = new Map();
        this.maxPoolSize = 3;
        this.browserTimeout = 5 * 60 * 1000;
        this.cleanupInterval = 60 * 1000;
        this.cleanupTimer = null;
        this.startCleanupTimer();
        this.logger.log('🏊‍♂️ 브라우저 풀 서비스 초기화 완료');
    }
    async acquireBrowser() {
        this.logger.debug('🔍 브라우저 세션 요청');
        const availableInstance = this.findAvailableBrowser();
        if (availableInstance) {
            this.logger.debug(`♻️ 기존 브라우저 재사용: ${availableInstance.id}`);
            return await this.createSession(availableInstance);
        }
        if (this.pool.size < this.maxPoolSize) {
            this.logger.debug('🆕 새 브라우저 인스턴스 생성');
            const newInstance = await this.createBrowserInstance();
            return await this.createSession(newInstance);
        }
        const oldestInstance = this.findOldestInactiveBrowser();
        if (oldestInstance) {
            this.logger.debug(`🔄 오래된 브라우저 교체: ${oldestInstance.id}`);
            await this.removeBrowserInstance(oldestInstance.id);
            const newInstance = await this.createBrowserInstance();
            return await this.createSession(newInstance);
        }
        this.logger.warn('⚠️ 풀이 가득 참, 임시 브라우저 생성');
        return await this.createTemporarySession();
    }
    async releaseBrowser(session) {
        try {
            if (session.page && !session.page.isClosed()) {
                await session.page.close();
            }
            const instance = this.pool.get(session.instanceId);
            if (instance) {
                instance.isActive = false;
                instance.lastUsed = new Date();
                this.logger.debug(`📤 브라우저 반환: ${session.instanceId}`);
            }
            else {
                if (session.browser && session.browser.isConnected()) {
                    await session.browser.close();
                    this.logger.debug('🗑️ 임시 브라우저 종료');
                }
            }
        }
        catch (error) {
            this.logger.error('❌ 브라우저 반환 중 오류:', error);
        }
    }
    getPoolStatus() {
        const instances = Array.from(this.pool.values());
        const activeCount = instances.filter(i => i.isActive).length;
        const inactiveCount = instances.filter(i => !i.isActive).length;
        return {
            totalInstances: this.pool.size,
            activeInstances: activeCount,
            inactiveInstances: inactiveCount,
            maxPoolSize: this.maxPoolSize,
            instances: instances.map(i => ({
                id: i.id,
                isActive: i.isActive,
                lastUsed: i.lastUsed,
                createdAt: i.createdAt,
                age: Date.now() - i.createdAt.getTime(),
            })),
        };
    }
    findAvailableBrowser() {
        for (const instance of this.pool.values()) {
            if (!instance.isActive && instance.browser.isConnected()) {
                return instance;
            }
        }
        return null;
    }
    findOldestInactiveBrowser() {
        let oldest = null;
        for (const instance of this.pool.values()) {
            if (!instance.isActive) {
                if (!oldest || instance.lastUsed < oldest.lastUsed) {
                    oldest = instance;
                }
            }
        }
        return oldest;
    }
    async createBrowserInstance() {
        const id = this.generateInstanceId();
        try {
            const browser = await playwright_1.chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                ],
            });
            const instance = {
                id,
                browser,
                isActive: false,
                lastUsed: new Date(),
                createdAt: new Date(),
            };
            this.pool.set(id, instance);
            this.logger.log(`✅ 브라우저 인스턴스 생성: ${id} (풀 크기: ${this.pool.size})`);
            return instance;
        }
        catch (error) {
            this.logger.error(`❌ 브라우저 인스턴스 생성 실패: ${id}`, error);
            throw error;
        }
    }
    async createSession(instance) {
        try {
            const page = await instance.browser.newPage();
            await page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });
            instance.isActive = true;
            instance.lastUsed = new Date();
            return {
                browser: instance.browser,
                page,
                instanceId: instance.id,
            };
        }
        catch (error) {
            this.logger.error(`❌ 브라우저 세션 생성 실패: ${instance.id}`, error);
            throw error;
        }
    }
    async createTemporarySession() {
        const browser = await playwright_1.chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        return {
            browser,
            page,
            instanceId: 'temp-' + this.generateInstanceId(),
        };
    }
    async removeBrowserInstance(instanceId) {
        const instance = this.pool.get(instanceId);
        if (!instance)
            return;
        try {
            if (instance.browser.isConnected()) {
                await instance.browser.close();
            }
            this.pool.delete(instanceId);
            this.logger.log(`🗑️ 브라우저 인스턴스 제거: ${instanceId} (풀 크기: ${this.pool.size})`);
        }
        catch (error) {
            this.logger.error(`❌ 브라우저 인스턴스 제거 실패: ${instanceId}`, error);
        }
    }
    async cleanupTimedOutBrowsers() {
        const now = new Date();
        const instancesToRemove = [];
        for (const [id, instance] of this.pool.entries()) {
            const timeSinceLastUse = now.getTime() - instance.lastUsed.getTime();
            if (!instance.isActive && timeSinceLastUse > this.browserTimeout) {
                instancesToRemove.push(id);
            }
        }
        for (const id of instancesToRemove) {
            this.logger.debug(`⏰ 타임아웃된 브라우저 정리: ${id}`);
            await this.removeBrowserInstance(id);
        }
        if (instancesToRemove.length > 0) {
            this.logger.log(`🧹 타임아웃 정리 완료: ${instancesToRemove.length}개 제거`);
        }
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.cleanupTimedOutBrowsers();
            }
            catch (error) {
                this.logger.error('❌ 브라우저 정리 중 오류:', error);
            }
        }, this.cleanupInterval);
    }
    generateInstanceId() {
        return `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async onModuleDestroy() {
        this.logger.log('🛑 브라우저 풀 서비스 종료 중...');
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        const closePromises = Array.from(this.pool.entries()).map(async ([id, instance]) => {
            try {
                if (instance.browser.isConnected()) {
                    await instance.browser.close();
                    this.logger.debug(`🔒 브라우저 종료: ${id}`);
                }
            }
            catch (error) {
                this.logger.error(`❌ 브라우저 종료 실패: ${id}`, error);
            }
        });
        await Promise.allSettled(closePromises);
        this.pool.clear();
        this.logger.log('✅ 브라우저 풀 서비스 종료 완료');
    }
};
exports.BrowserPoolService = BrowserPoolService;
exports.BrowserPoolService = BrowserPoolService = BrowserPoolService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BrowserPoolService);
//# sourceMappingURL=browser-pool.service.js.map