import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CompletePostgreSQLSchema1758606527936 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
