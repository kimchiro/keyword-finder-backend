import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

// 1개 키워드 전체 검색 결과 요청 DTO
export class SingleKeywordFullDataDto {
  @ApiProperty({ 
    description: '검색어 (어제부터 작년 어제까지의 데이터를 자동으로 조회)', 
    example: '맛집' 
  })
  @IsString()
  @IsNotEmpty()
  keyword: string;
}

// 5개 키워드 검색 결과 요청 DTO
export class MultipleKeywordsLimitedDataDto {
  @ApiProperty({ 
    description: '검색어 목록 (최대 5개)', 
    example: ['맛집', '카페', '레스토랑', '음식점', '디저트'],
    maxItems: 5
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  keywords: string[];
}

// 블로그 검색 응답 DTO
export class BlogSearchResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '검색 결과' })
  data: {
    total: number;
    start: number;
    display: number;
    items: Array<{
      title: string;
      link: string;
      description: string;
      bloggername: string;
      bloggerlink: string;
      postdate: string;
    }>;
  };
}

// 1개 키워드 전체 검색 결과 응답 DTO
export class SingleKeywordFullDataResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '키워드 전체 데이터' })
  data: {
    keyword: string;
    blogSearch: {
      total: number;
      start: number;
      display: number;
      items: Array<{
        title: string;
        link: string;
        description: string;
        bloggername: string;
        bloggerlink: string;
        postdate: string;
      }>;
    };
    datalab: any;
    searchPeriod: {
      startDate: string;
      endDate: string;
    };
    timestamp: string;
  };
}

// 5개 키워드 검색 결과 응답 DTO
export class MultipleKeywordsLimitedDataResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '키워드별 제한 데이터' })
  data: {
    keywords: string[];
    results: Array<{
      keyword: string;
      monthlySearchVolume: number;
    }>;
    searchPeriod: {
      startDate: string;
      endDate: string;
    };
    timestamp: string;
  };
}