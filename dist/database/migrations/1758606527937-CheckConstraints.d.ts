import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CheckConstraints1758606527937 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
