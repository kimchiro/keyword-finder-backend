import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export declare class HealthService {
    private configService;
    private dataSource;
    constructor(configService: ConfigService, dataSource: DataSource);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: any;
    }>;
    checkDatabase(): Promise<{
        status: string;
        database: string;
        timestamp: string;
    }>;
    getSystemInfo(): Promise<{
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            nodeVersion: string;
            pid: number;
            uptime: number;
        };
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
            external: string;
        };
        environment: {
            nodeEnv: any;
            port: any;
            database: {
                host: any;
                port: any;
                database: any;
            };
        };
        timestamp: string;
    }>;
    private formatBytes;
}
