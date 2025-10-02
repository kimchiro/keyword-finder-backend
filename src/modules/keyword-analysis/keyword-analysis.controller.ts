import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { KeywordAnalysisService } from './keyword-analysis.service';
import {
  AnalyzeKeywordDto,
  KeywordAnalysisResponseDto,
  GetAnalysisResponseDto,
} from './dto/keyword-analysis.dto';

@ApiTags('keyword-analysis')
@Controller('keyword-analysis')
export class KeywordAnalysisController {
  constructor(
    private readonly keywordAnalysisService: KeywordAnalysisService,
  ) {}

  @Post('analyze/:keyword')
  @ApiOperation({ 
    summary: '키워드 분석 실행',
    description: '지정된 키워드에 대한 종합 분석을 실행합니다.'
  })
  @ApiParam({ 
    name: 'keyword', 
    description: '분석할 키워드',
    example: '맛집'
  })
  @ApiResponse({
    status: 200,
    description: '분석 성공',
    type: KeywordAnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async analyzeKeyword(
    @Param('keyword') keyword: string,
  ): Promise<KeywordAnalysisResponseDto> {
    try {
      console.log(`📊 키워드 분석 요청: ${keyword}`);
      
      const result = await this.keywordAnalysisService.analyzeKeyword(keyword);

      return {
        success: true,
        message: '키워드 분석이 완료되었습니다.',
        data: result,
      };
    } catch (error) {
      console.error('❌ 키워드 분석 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '키워드 분석 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analysis/:keyword')
  @ApiOperation({ 
    summary: '키워드 분석 결과 조회',
    description: '저장된 키워드 분석 결과를 조회합니다.'
  })
  @ApiParam({ 
    name: 'keyword', 
    description: '조회할 키워드',
    example: '맛집'
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: GetAnalysisResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getKeywordAnalysis(
    @Param('keyword') keyword: string,
  ): Promise<GetAnalysisResponseDto> {
    try {
      console.log(`📋 키워드 분석 결과 조회: ${keyword}`);
      
      const result = await this.keywordAnalysisService.getKeywordAnalysis(keyword);

      if (!result.data.analytics) {
        throw new HttpException(
          {
            success: false,
            message: '해당 키워드의 분석 결과를 찾을 수 없습니다.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: '키워드 분석 결과를 성공적으로 조회했습니다.',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 키워드 분석 결과 조회 실패:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: '키워드 분석 결과 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  @ApiOperation({ 
    summary: '분석된 키워드 목록 조회',
    description: '분석이 완료된 키워드들의 목록을 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '목록 조회 성공',
  })
  async getAnalyzedKeywords() {
    try {
      const result = await this.keywordAnalysisService.getAnalyzedKeywords();
      
      return {
        success: true,
        message: '분석된 키워드 목록을 성공적으로 조회했습니다.',
        data: result,
      };
    } catch (error) {
      console.error('❌ 키워드 목록 조회 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '키워드 목록 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
