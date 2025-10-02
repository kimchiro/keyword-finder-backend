import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ScrapeKeywordsDto {
  @ApiProperty({ description: '스크래핑할 키워드', example: '맛집' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ 
    description: '수집할 키워드 타입들 (trending, smartblock만 지원)', 
    example: ['trending', 'smartblock'],
    isArray: true,
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiProperty({ 
    description: '최대 수집 개수', 
    example: 50,
    required: false 
  })
  @IsOptional()
  maxResults?: number;
}

export class ScrapeKeywordsResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '스크래핑 결과' })
  data: {
    query: string;
    totalKeywords: number;
    executionTime: number;
    categories: {
      [key: string]: number;
    };
    keywords: Array<{
      keyword: string;
      category: string;
      rank: number;
      source: string;
    }>;
  };
}

export class GetCollectionLogsResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '수집 로그' })
  data: {
    logs: any[];
    total: number;
    page: number;
    limit: number;
  };
}

