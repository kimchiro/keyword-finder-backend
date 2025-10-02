import { MigrationInterface, QueryRunner } from "typeorm";
export declare class PostgreSQLSchema1758606527934 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
