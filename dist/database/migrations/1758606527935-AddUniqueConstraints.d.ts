import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddUniqueConstraints1758606527935 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
