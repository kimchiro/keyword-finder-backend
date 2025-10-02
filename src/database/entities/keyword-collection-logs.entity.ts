import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from './keyword.entity';

export enum CollectionType {
  TRENDING = 'trending',
  SMARTBLOCK = 'smartblock',
  RELATED_SEARCH = 'related_search',
}

@Entity('keyword_collection_logs')
@Unique(['baseQueryId', 'collectedKeywordId', 'collectionType', 'collectedAt'])
@Index(['baseQueryId'])
@Index(['collectedKeywordId'])
@Index(['collectionType'])
@Index(['collectedAt'])
export class KeywordCollectionLogs {
  @ApiProperty({ description: '고유 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '기준 검색어 ID' })
  @Column({ name: 'base_query_id', type: 'int' })
  baseQueryId: number;

  @ApiProperty({ description: '수집된 키워드 ID' })
  @Column({ name: 'collected_keyword_id', type: 'int' })
  collectedKeywordId: number;


  @ManyToOne(() => Keyword, (keyword) => keyword.collectionLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'base_query_id' })
  baseQueryEntity: Keyword;

  @ManyToOne(() => Keyword, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collected_keyword_id' })
  collectedKeywordEntity: Keyword;

  @ApiProperty({ description: '수집 타입', enum: CollectionType })
  @Column({
    name: 'collection_type',
    type: 'enum',
    enum: CollectionType,
  })
  collectionType: CollectionType;


  @ApiProperty({ description: '순위' })
  @Column({ name: 'rank_position', type: 'int', default: 0 })
  rankPosition: number;

  @ApiProperty({ description: '수집일시' })
  @CreateDateColumn({ name: 'collected_at' })
  collectedAt: Date;
}
