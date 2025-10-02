import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RateLimitGuard, NaverApiRateLimit } from '../../common/guards/rate-limit.guard';
import { NaverApiService } from './naver-api.service';
import {
  SingleKeywordFullDataDto,
  MultipleKeywordsLimitedDataDto,
  SingleKeywordFullDataResponseDto,
  MultipleKeywordsLimitedDataResponseDto,
  BlogSearchResponseDto,
} from './dto/naver-api.dto';

@ApiTags('naver-api')
@Controller('naver')
@UseGuards(RateLimitGuard)
@NaverApiRateLimit(100, 60000) // 1분당 100회 제한
export class NaverApiController {
  constructor(private readonly naverApiService: NaverApiService) {}

  @Get('blog-search')
  @NaverApiRateLimit(50, 60000) // 블로그 검색은 1분당 50회로 제한
  @ApiOperation({ 
    summary: '네이버 블로그 검색 (상위 10개)',
    description: '네이버 블로그 검색 API를 통해 상위 10개 블로그 포스트를 검색합니다.'
  })
  @ApiQuery({ 
    name: 'query', 
    description: '검색어',
    example: '맛집'
  })
  @ApiQuery({ 
    name: 'display', 
    description: '검색 결과 개수 (1-100)',
    example: 10,
    required: false
  })
  @ApiQuery({ 
    name: 'start', 
    description: '검색 시작 위치 (1-1000)',
    example: 1,
    required: false
  })
  @ApiQuery({ 
    name: 'sort', 
    description: '정렬 방식 (sim: 정확도순, date: 날짜순)',
    example: 'sim',
    required: false
  })
  @ApiResponse({
    status: 200,
    description: '검색 성공',
    type: BlogSearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async searchBlog(
    @Query('query') query: string,
    @Query('display') display?: number,
    @Query('start') start?: number,
    @Query('sort') sort?: string,
  ): Promise<BlogSearchResponseDto> {
    try {
      console.log(`🔍 네이버 블로그 검색: ${query}`);
      
      const result = await this.naverApiService.searchBlogs(query, display, start, sort);

      return {
        success: true,
        message: '블로그 검색이 완료되었습니다.',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 블로그 검색 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '블로그 검색 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('content-counts/:query')
  @NaverApiRateLimit(30, 60000) // 콘텐츠 수 조회는 1분당 30회로 제한
  @ApiOperation({ 
    summary: '키워드 콘텐츠 발행량 조회',
    description: '해당 키워드의 블로그, 카페 콘텐츠 발행량을 조회합니다.'
  })
  @ApiParam({ 
    name: 'query', 
    description: '검색어',
    example: '맛집'
  })
  @ApiResponse({
    status: 200,
    description: '콘텐츠 수 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getContentCounts(@Param('query') query: string) {
    try {
      console.log(`📊 콘텐츠 수 조회: ${query}`);
      
      const result = await this.naverApiService.getContentCounts(query);

      return {
        success: true,
        message: '콘텐츠 수 조회가 완료되었습니다.',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 콘텐츠 수 조회 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '콘텐츠 수 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('content-counts-save')
  @NaverApiRateLimit(20, 60000) // 콘텐츠 수 저장은 1분당 20회로 제한
  @ApiOperation({ 
    summary: '키워드 콘텐츠 발행량 조회 및 저장',
    description: '해당 키워드의 블로그, 카페 콘텐츠 발행량을 조회하고 데이터베이스에 저장합니다.'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '검색어',
          example: '맛집'
        }
      },
      required: ['query']
    }
  })
  @ApiResponse({
    status: 200,
    description: '콘텐츠 수 조회 및 저장 성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getContentCountsAndSave(@Body('query') query: string) {
    try {
      console.log(`💾 콘텐츠 수 조회 및 저장: ${query}`);
      
      const result = await this.naverApiService.getContentCountsAndSave(query);

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 콘텐츠 수 조회 및 저장 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '콘텐츠 수 조회 및 저장 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('single-keyword-full-data')
  @NaverApiRateLimit(10, 60000) // 1분당 10회로 제한 (무거운 API)
  @ApiOperation({ 
    summary: '1개 키워드 전체 검색 결과',
    description: '1개 키워드의 모든 데이터를 조회합니다. 블로그 검색(상위 10개), 트렌드(어제~작년 어제)를 포함합니다.'
  })
  @ApiBody({ type: SingleKeywordFullDataDto })
  @ApiResponse({
    status: 200,
    description: '단일 키워드 전체 데이터 조회 성공',
    type: SingleKeywordFullDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getSingleKeywordFullData(@Body() request: SingleKeywordFullDataDto): Promise<SingleKeywordFullDataResponseDto> {
    try {
      console.log(`🔍 단일 키워드 전체 데이터 조회: ${request.keyword}`);
      
      const result = await this.naverApiService.getSingleKeywordFullData(request);

      return {
        success: true,
        message: '단일 키워드 전체 데이터 조회가 완료되었습니다.',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 단일 키워드 전체 데이터 조회 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '단일 키워드 전체 데이터 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('multiple-keywords-limited-data')
  @NaverApiRateLimit(15, 60000) // 1분당 15회로 제한
  @ApiOperation({ 
    summary: '5개 키워드 검색 결과',
    description: '최대 5개 키워드의 검색 결과를 조회합니다. 월간검색량과 누적발행량을 포함합니다.'
  })
  @ApiBody({ type: MultipleKeywordsLimitedDataDto })
  @ApiResponse({
    status: 200,
    description: '다중 키워드 제한 데이터 조회 성공',
    type: MultipleKeywordsLimitedDataResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getMultipleKeywordsLimitedData(@Body() request: MultipleKeywordsLimitedDataDto): Promise<MultipleKeywordsLimitedDataResponseDto> {
    try {
      console.log(`📊 다중 키워드 제한 데이터 조회: ${request.keywords.join(', ')}`);
      
      const result = await this.naverApiService.getMultipleKeywordsLimitedData(request);

      return {
        success: true,
        message: '다중 키워드 제한 데이터 조회가 완료되었습니다.',
        data: result.data,
      };
    } catch (error) {
      console.error('❌ 다중 키워드 제한 데이터 조회 실패:', error);
      throw new HttpException(
        {
          success: false,
          message: '다중 키워드 제한 데이터 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}