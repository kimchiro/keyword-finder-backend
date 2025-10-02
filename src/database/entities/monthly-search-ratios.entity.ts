import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from './keyword.entity';

@Entity('monthly_search_ratios')
@Unique(['keywordId', 'monthNumber', 'analysisYear'])
@Index(['keywordId'])
@Index(['monthNumber'])
@Index(['analysisYear'])
@Index(['keywordId', 'analysisYear'])
@Check('"month_number" BETWEEN 1 AND 12')
export class MonthlySearchRatios {
  @ApiProperty({ description: '고유 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '키워드 ID' })
  @Column({ name: 'keyword_id', type: 'int' })
  keywordId: number;

  @ManyToOne(() => Keyword, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'keyword_id' })
  keywordEntity: Keyword;

  @ApiProperty({ description: '월 (1-12)' })
  @Column({ name: 'month_number', type: 'int' })
  monthNumber: number;

  @ApiProperty({ description: '검색 비율' })
  @Column({ name: 'search_ratio', type: 'decimal', precision: 5, scale: 2, default: 0 })
  searchRatio: number;

  @ApiProperty({ description: '분석 연도' })
  @Column({ name: 'analysis_year', type: 'year' })
  analysisYear: number;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
