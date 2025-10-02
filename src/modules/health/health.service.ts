import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    private configService: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

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
      // 간단한 쿼리로 데이터베이스 연결 확인
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 데이터베이스 연결 실패:', error);
      throw new ServiceUnavailableException({
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

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
