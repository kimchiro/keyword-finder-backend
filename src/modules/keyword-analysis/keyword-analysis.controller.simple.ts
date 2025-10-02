import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { KeywordAnalysisService } from './keyword-analysis.service.simple';

@ApiTags('keyword-analysis')
@Controller('keyword-analysis')
export class KeywordAnalysisController {
  constructor(private readonly keywordAnalysisService: KeywordAnalysisService) {}

  @Get('status')
  @ApiOperation({
    summary: '키워드 분석 서비스 상태 확인',
    description: '키워드 분석 서비스의 상태와 데이터 통계를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '서비스 상태 조회 성공',
  })
  async getServiceStatus() {
    try {
      const result = await this.keywordAnalysisService.getServiceStatus();
      return {
        success: true,
        message: '키워드 분석 서비스 상태 조회 완료',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '서비스 상태 조회 실패',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('keywords')
  @ApiOperation({
    summary: '키워드 목록 조회',
    description: '저장된 키워드 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    description: '조회할 키워드 개수',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '키워드 목록 조회 성공',
  })
  async getKeywords(@Query('limit') limit?: number) {
    try {
      const result = await this.keywordAnalysisService.getKeywords(limit);
      return {
        success: true,
        message: '키워드 목록 조회 완료',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '키워드 목록 조회 실패',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('keywords')
  @ApiOperation({
    summary: '키워드 추가',
    description: '새로운 키워드를 추가합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '추가할 키워드',
          example: '맛집',
        },
      },
      required: ['keyword'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '키워드 추가 성공',
  })
  async addKeyword(@Body('keyword') keyword: string) {
    try {
      if (!keyword) {
        throw new HttpException(
          {
            success: false,
            message: '키워드가 필요합니다',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.keywordAnalysisService.addKeyword(keyword);
      return {
        success: true,
        message: '키워드 추가 완료',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '키워드 추가 실패',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
