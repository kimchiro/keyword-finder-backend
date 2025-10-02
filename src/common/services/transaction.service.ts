import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  /**
   * 트랜잭션 내에서 작업을 실행합니다.
   * @param work 트랜잭션 내에서 실행할 작업 함수
   * @returns 작업 결과
   */
  async runInTransaction<T>(
    work: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 배치 INSERT 작업을 수행합니다.
   * @param queryRunner 쿼리 러너
   * @param entity 엔티티 클래스
   * @param data 삽입할 데이터 배열
   * @param chunkSize 배치 크기 (기본값: 1000)
   */
  async batchInsert<T>(
    queryRunner: QueryRunner,
    entity: new () => T,
    data: Partial<T>[],
    chunkSize: number = 1000
  ): Promise<void> {
    if (data.length === 0) return;

    const repository = queryRunner.manager.getRepository(entity);
    
    // 데이터를 청크 단위로 나누어 처리
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await repository.insert(chunk as any);
    }
  }

  /**
   * 배치 UPSERT 작업을 수행합니다.
   * @param queryRunner 쿼리 러너
   * @param entity 엔티티 클래스
   * @param data 삽입/업데이트할 데이터 배열
   * @param conflictColumns 충돌 감지 컬럼들
   * @param updateColumns 업데이트할 컬럼들
   * @param chunkSize 배치 크기 (기본값: 1000)
   */
  async batchUpsert<T>(
    queryRunner: QueryRunner,
    entity: new () => T,
    data: Partial<T>[],
    conflictColumns: string[],
    updateColumns: string[],
    chunkSize: number = 1000
  ): Promise<void> {
    if (data.length === 0) return;

    const repository = queryRunner.manager.getRepository(entity);
    
    // 데이터를 청크 단위로 나누어 처리
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      await repository
        .createQueryBuilder()
        .insert()
        .values(chunk as any)
        .orUpdate(updateColumns, conflictColumns)
        .execute();
    }
  }

  /**
   * 배치 DELETE 작업을 수행합니다.
   * @param queryRunner 쿼리 러너
   * @param entity 엔티티 클래스
   * @param whereConditions WHERE 조건들
   */
  async batchDelete<T>(
    queryRunner: QueryRunner,
    entity: new () => T,
    whereConditions: Record<string, any>
  ): Promise<void> {
    const repository = queryRunner.manager.getRepository(entity);
    await repository.delete(whereConditions);
  }
}
