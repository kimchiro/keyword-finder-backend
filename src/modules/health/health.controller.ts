import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { ApiRetryService } from '../../common/services/api-retry.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly apiRetryService: ApiRetryService,
    private readonly rateLimitGuard: RateLimitGuard,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: '서비스 헬스체크',
    description: '서비스의 전반적인 상태를 확인합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '헬스체크 성공',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-09-21T08:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
      },
    },
  })
  check() {
    return this.healthService.check();
  }

  @Get('circuit-breaker')
  @ApiOperation({
    summary: '서킷 브레이커 상태 조회',
    description: '모든 서킷 브레이커의 현재 상태를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '서킷 브레이커 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        circuitBreakers: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              failures: { type: 'number', example: 2 },
              successes: { type: 'number', example: 10 },
              lastFailureTime: { type: 'number', example: 1632211800000 },
              state: { type: 'string', enum: ['CLOSED', 'OPEN', 'HALF_OPEN'] },
            },
          },
        },
        timestamp: { type: 'string', example: '2025-09-21T08:30:00.000Z' },
      },
    },
  })
  getCircuitBreakerStatus() {
    const circuitBreakers = this.apiRetryService.getCircuitBreakerStatus();
    
    return {
      success: true,
      message: '서킷 브레이커 상태 조회 완료',
      data: {
        circuitBreakers,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('rate-limit')
  @ApiOperation({
    summary: 'Rate Limit 상태 조회',
    description: '현재 활성화된 Rate Limit 상태를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: 'Rate Limit 상태 조회 성공',
  })
  getRateLimitStatus() {
    const rateLimits = this.rateLimitGuard.getRateLimitStatus();
    
    return {
      success: true,
      message: 'Rate Limit 상태 조회 완료',
      data: {
        rateLimits,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('api-metrics')
  @ApiOperation({
    summary: 'API 메트릭 조회',
    description: 'API 재시도 시스템과 Rate Limiting의 종합 메트릭을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: 'API 메트릭 조회 성공',
  })
  getApiMetrics() {
    const circuitBreakers = this.apiRetryService.getCircuitBreakerStatus();
    const rateLimits = this.rateLimitGuard.getRateLimitStatus();

    // 서킷 브레이커 통계 계산
    const cbStats = Object.entries(circuitBreakers).reduce((acc, [key, stats]) => {
      acc.totalServices++;
      acc.totalFailures += stats.failures;
      acc.totalSuccesses += stats.successes;
      
      if (stats.state === 'OPEN') acc.openCircuits++;
      else if (stats.state === 'HALF_OPEN') acc.halfOpenCircuits++;
      else acc.closedCircuits++;
      
      return acc;
    }, {
      totalServices: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      openCircuits: 0,
      halfOpenCircuits: 0,
      closedCircuits: 0,
    });

    // Rate Limit 통계 계산
    const rlStats = Object.entries(rateLimits).reduce((acc, [key, stats]) => {
      acc.totalKeys++;
      acc.totalRequests += stats.count;
      
      if (stats.remainingTime > 0) acc.activeWindows++;
      
      return acc;
    }, {
      totalKeys: 0,
      totalRequests: 0,
      activeWindows: 0,
    });

    return {
      success: true,
      message: 'API 메트릭 조회 완료',
      data: {
        circuitBreaker: {
          ...cbStats,
          successRate: cbStats.totalSuccesses + cbStats.totalFailures > 0 
            ? (cbStats.totalSuccesses / (cbStats.totalSuccesses + cbStats.totalFailures) * 100).toFixed(2) + '%'
            : '0%',
        },
        rateLimit: rlStats,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('reset-circuit-breaker/:key')
  @ApiOperation({
    summary: '서킷 브레이커 리셋',
    description: '특정 서킷 브레이커를 리셋합니다.'
  })
  resetCircuitBreaker(@Param('key') key: string) {
    this.apiRetryService.resetCircuitBreaker(key);
    
    return {
      success: true,
      message: `서킷 브레이커 '${key}'가 리셋되었습니다.`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reset-rate-limit/:key')
  @ApiOperation({
    summary: 'Rate Limit 리셋',
    description: '특정 Rate Limit을 리셋합니다.'
  })
  resetRateLimit(@Param('key') key: string) {
    const success = this.rateLimitGuard.resetRateLimit(key);
    
    return {
      success,
      message: success 
        ? `Rate Limit '${key}'가 리셋되었습니다.`
        : `Rate Limit '${key}'를 찾을 수 없습니다.`,
      timestamp: new Date().toISOString(),
    };
  }
}