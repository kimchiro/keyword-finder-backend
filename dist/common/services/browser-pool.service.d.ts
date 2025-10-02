import { OnModuleDestroy } from '@nestjs/common';
import { Browser, Page } from 'playwright';
interface BrowserSession {
    browser: Browser;
    page: Page;
    instanceId: string;
}
export declare class BrowserPoolService implements OnModuleDestroy {
    private readonly logger;
    private readonly pool;
    private readonly maxPoolSize;
    private readonly browserTimeout;
    private readonly cleanupInterval;
    private cleanupTimer;
    constructor();
    acquireBrowser(): Promise<BrowserSession>;
    releaseBrowser(session: BrowserSession): Promise<void>;
    getPoolStatus(): {
        totalInstances: number;
        activeInstances: number;
        inactiveInstances: number;
        maxPoolSize: number;
        instances: {
            id: string;
            isActive: boolean;
            lastUsed: Date;
            createdAt: Date;
            age: number;
        }[];
    };
    private findAvailableBrowser;
    private findOldestInactiveBrowser;
    private createBrowserInstance;
    private createSession;
    private createTemporarySession;
    private removeBrowserInstance;
    private cleanupTimedOutBrowsers;
    private startCleanupTimer;
    private generateInstanceId;
    onModuleDestroy(): Promise<void>;
}
export {};
