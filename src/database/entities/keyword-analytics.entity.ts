import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from './keyword.entity';

@Entity('keyword_analytics')
@Unique(['keywordId', 'analysisDate'])
@Index(['keywordId'])
@Index(['analysisDate'])
@Index(['monthlySearchTotal'])
export class KeywordAnalytics {
  @ApiProperty({ description: '고유 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '키워드 ID' })
  @Column({ name: 'keyword_id', type: 'int' })
  keywordId: number;


  @ManyToOne(() => Keyword, (keyword) => keyword.analytics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'keyword_id' })
  keywordEntity: Keyword;

  @ApiProperty({ description: '월간 PC 검색량' })
  @Column({ name: 'monthly_search_pc', type: 'bigint', default: 0 })
  monthlySearchPc: number;

  @ApiProperty({ description: '월간 모바일 검색량' })
  @Column({ name: 'monthly_search_mobile', type: 'bigint', default: 0 })
  monthlySearchMobile: number;

  @ApiProperty({ description: '월간 총 검색량' })
  @Column({ name: 'monthly_search_total', type: 'bigint', default: 0 })
  monthlySearchTotal: number;

  @ApiProperty({ description: '월간 블로그 콘텐츠 발행량' })
  @Column({ name: 'monthly_content_blog', type: 'int', default: 0 })
  monthlyContentBlog: number;

  @ApiProperty({ description: '월간 카페 콘텐츠 발행량' })
  @Column({ name: 'monthly_content_cafe', type: 'int', default: 0 })
  monthlyContentCafe: number;

  @ApiProperty({ description: '월간 총 콘텐츠 발행량' })
  @Column({ name: 'monthly_content_all', type: 'int', default: 0 })
  monthlyContentAll: number;

  @ApiProperty({ description: '어제까지 예상 검색량' })
  @Column({ name: 'estimated_search_yesterday', type: 'bigint', default: 0 })
  estimatedSearchYesterday: number;

  @ApiProperty({ description: '월말까지 예상 검색량' })
  @Column({ name: 'estimated_search_end_month', type: 'bigint', default: 0 })
  estimatedSearchEndMonth: number;

  @ApiProperty({ description: '블로그 콘텐츠 포화지수' })
  @Column({ name: 'saturation_index_blog', type: 'decimal', precision: 5, scale: 2, default: 0 })
  saturationIndexBlog: number;

  @ApiProperty({ description: '카페 콘텐츠 포화지수' })
  @Column({ name: 'saturation_index_cafe', type: 'decimal', precision: 5, scale: 2, default: 0 })
  saturationIndexCafe: number;

  @ApiProperty({ description: '전체 콘텐츠 포화지수' })
  @Column({ name: 'saturation_index_all', type: 'decimal', precision: 5, scale: 2, default: 0 })
  saturationIndexAll: number;

  @ApiProperty({ description: '분석 날짜' })
  @Column({ name: 'analysis_date', type: 'date' })
  analysisDate: Date;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
