import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';

interface BrowserInstance {
  id: string;
  browser: Browser;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

interface BrowserSession {
  browser: Browser;
  page: Page;
  instanceId: string;
}

@Injectable()
export class BrowserPoolService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserPoolService.name);
  private readonly pool: Map<string, BrowserInstance> = new Map();
  private readonly maxPoolSize = 3;
  private readonly browserTimeout = 5 * 60 * 1000; // 5분
  private readonly cleanupInterval = 60 * 1000; // 1분마다 정리
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
    this.logger.log('🏊‍♂️ 브라우저 풀 서비스 초기화 완료');
  }

  /**
   * 브라우저 세션 획득
   */
  async acquireBrowser(): Promise<BrowserSession> {
    this.logger.debug('🔍 브라우저 세션 요청');

    // 사용 가능한 브라우저 찾기
    const availableInstance = this.findAvailableBrowser();
    
    if (availableInstance) {
      this.logger.debug(`♻️ 기존 브라우저 재사용: ${availableInstance.id}`);
      return await this.createSession(availableInstance);
    }

    // 풀에 여유가 있으면 새 브라우저 생성
    if (this.pool.size < this.maxPoolSize) {
      this.logger.debug('🆕 새 브라우저 인스턴스 생성');
      const newInstance = await this.createBrowserInstance();
      return await this.createSession(newInstance);
    }

    // 풀이 가득 찬 경우 가장 오래된 비활성 브라우저 교체
    const oldestInstance = this.findOldestInactiveBrowser();
    if (oldestInstance) {
      this.logger.debug(`🔄 오래된 브라우저 교체: ${oldestInstance.id}`);
      await this.removeBrowserInstance(oldestInstance.id);
      const newInstance = await this.createBrowserInstance();
      return await this.createSession(newInstance);
    }

    // 모든 브라우저가 활성 상태인 경우 임시 브라우저 생성
    this.logger.warn('⚠️ 풀이 가득 참, 임시 브라우저 생성');
    return await this.createTemporarySession();
  }

  /**
   * 브라우저 세션 반환
   */
  async releaseBrowser(session: BrowserSession): Promise<void> {
    try {
      // 페이지 닫기
      if (session.page && !session.page.isClosed()) {
        await session.page.close();
      }

      // 풀에 있는 브라우저인 경우 비활성 상태로 변경
      const instance = this.pool.get(session.instanceId);
      if (instance) {
        instance.isActive = false;
        instance.lastUsed = new Date();
        this.logger.debug(`📤 브라우저 반환: ${session.instanceId}`);
      } else {
        // 임시 브라우저인 경우 즉시 종료
        if (session.browser && session.browser.isConnected()) {
          await session.browser.close();
          this.logger.debug('🗑️ 임시 브라우저 종료');
        }
      }
    } catch (error) {
      this.logger.error('❌ 브라우저 반환 중 오류:', error);
    }
  }

  /**
   * 풀 상태 조회
   */
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

  /**
   * 사용 가능한 브라우저 찾기
   */
  private findAvailableBrowser(): BrowserInstance | null {
    for (const instance of this.pool.values()) {
      if (!instance.isActive && instance.browser.isConnected()) {
        return instance;
      }
    }
    return null;
  }

  /**
   * 가장 오래된 비활성 브라우저 찾기
   */
  private findOldestInactiveBrowser(): BrowserInstance | null {
    let oldest: BrowserInstance | null = null;
    
    for (const instance of this.pool.values()) {
      if (!instance.isActive) {
        if (!oldest || instance.lastUsed < oldest.lastUsed) {
          oldest = instance;
        }
      }
    }
    
    return oldest;
  }

  /**
   * 새 브라우저 인스턴스 생성
   */
  private async createBrowserInstance(): Promise<BrowserInstance> {
    const id = this.generateInstanceId();
    
    try {
      const browser = await chromium.launch({
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

      const instance: BrowserInstance = {
        id,
        browser,
        isActive: false,
        lastUsed: new Date(),
        createdAt: new Date(),
      };

      this.pool.set(id, instance);
      this.logger.log(`✅ 브라우저 인스턴스 생성: ${id} (풀 크기: ${this.pool.size})`);
      
      return instance;
    } catch (error) {
      this.logger.error(`❌ 브라우저 인스턴스 생성 실패: ${id}`, error);
      throw error;
    }
  }

  /**
   * 브라우저 세션 생성
   */
  private async createSession(instance: BrowserInstance): Promise<BrowserSession> {
    try {
      const page = await instance.browser.newPage();
      
      // 사용자 에이전트 설정
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
    } catch (error) {
      this.logger.error(`❌ 브라우저 세션 생성 실패: ${instance.id}`, error);
      throw error;
    }
  }

  /**
   * 임시 브라우저 세션 생성 (풀 외부)
   */
  private async createTemporarySession(): Promise<BrowserSession> {
    const browser = await chromium.launch({
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

  /**
   * 브라우저 인스턴스 제거
   */
  private async removeBrowserInstance(instanceId: string): Promise<void> {
    const instance = this.pool.get(instanceId);
    if (!instance) return;

    try {
      if (instance.browser.isConnected()) {
        await instance.browser.close();
      }
      this.pool.delete(instanceId);
      this.logger.log(`🗑️ 브라우저 인스턴스 제거: ${instanceId} (풀 크기: ${this.pool.size})`);
    } catch (error) {
      this.logger.error(`❌ 브라우저 인스턴스 제거 실패: ${instanceId}`, error);
    }
  }

  /**
   * 타임아웃된 브라우저 정리
   */
  private async cleanupTimedOutBrowsers(): Promise<void> {
    const now = new Date();
    const instancesToRemove: string[] = [];

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

  /**
   * 정리 타이머 시작
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupTimedOutBrowsers();
      } catch (error) {
        this.logger.error('❌ 브라우저 정리 중 오류:', error);
      }
    }, this.cleanupInterval);
  }

  /**
   * 인스턴스 ID 생성
   */
  private generateInstanceId(): string {
    return `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 모듈 종료 시 모든 브라우저 정리
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('🛑 브라우저 풀 서비스 종료 중...');

    // 정리 타이머 중지
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // 모든 브라우저 인스턴스 종료
    const closePromises = Array.from(this.pool.entries()).map(async ([id, instance]) => {
      try {
        if (instance.browser.isConnected()) {
          await instance.browser.close();
          this.logger.debug(`🔒 브라우저 종료: ${id}`);
        }
      } catch (error) {
        this.logger.error(`❌ 브라우저 종료 실패: ${id}`, error);
      }
    });

    await Promise.allSettled(closePromises);
    this.pool.clear();
    
    this.logger.log('✅ 브라우저 풀 서비스 종료 완료');
  }
}
