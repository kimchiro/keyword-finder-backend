import { DataSource, QueryRunner } from 'typeorm';
export declare class TransactionService {
    private dataSource;
    constructor(dataSource: DataSource);
    runInTransaction<T>(work: (queryRunner: QueryRunner) => Promise<T>): Promise<T>;
    batchInsert<T>(queryRunner: QueryRunner, entity: new () => T, data: Partial<T>[], chunkSize?: number): Promise<void>;
    batchUpsert<T>(queryRunner: QueryRunner, entity: new () => T, data: Partial<T>[], conflictColumns: string[], updateColumns: string[], chunkSize?: number): Promise<void>;
    batchDelete<T>(queryRunner: QueryRunner, entity: new () => T, whereConditions: Record<string, any>): Promise<void>;
}
