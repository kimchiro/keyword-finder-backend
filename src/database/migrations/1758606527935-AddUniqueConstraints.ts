import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraints1758606527935 implements MigrationInterface {
    name = 'AddUniqueConstraints1758606527935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 기존 테이블에 고유 제약조건을 추가합니다...');

        // keyword_collection_logs 테이블에 고유 제약조건 추가
        await queryRunner.query(`
            ALTER TABLE keyword_collection_logs 
            ADD CONSTRAINT IF NOT EXISTS UQ_keyword_collection_logs_unique_combination 
            UNIQUE (base_query_id, collected_keyword_id, collection_type, collected_at)
        `);

        // keyword_analytics 테이블에 고유 제약조건 추가 (이미 있을 수 있지만 안전하게)
        await queryRunner.query(`
            ALTER TABLE keyword_analytics 
            ADD CONSTRAINT IF NOT EXISTS UQ_keyword_id_analysis_date 
            UNIQUE (keyword_id, analysis_date)
        `);

        // related_keywords 테이블에 고유 제약조건 추가
        await queryRunner.query(`
            ALTER TABLE related_keywords 
            ADD CONSTRAINT IF NOT EXISTS UQ_base_related_keyword_analysis_date 
            UNIQUE (base_keyword_id, related_keyword_id, analysis_date)
        `);

        // search_trends 테이블에 고유 제약조건 추가
        await queryRunner.query(`
            ALTER TABLE search_trends 
            ADD CONSTRAINT IF NOT EXISTS UQ_keyword_id_period_type_period_value 
            UNIQUE (keyword_id, period_type, period_value)
        `);

        // monthly_search_ratios 테이블에 고유 제약조건 추가
        await queryRunner.query(`
            ALTER TABLE monthly_search_ratios 
            ADD CONSTRAINT IF NOT EXISTS UQ_keyword_id_month_number_analysis_year 
            UNIQUE (keyword_id, month_number, analysis_year)
        `);

        console.log('✅ 고유 제약조건 추가가 완료되었습니다!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️ 고유 제약조건을 제거합니다...');
        
        // 고유 제약조건 제거
        await queryRunner.query(`ALTER TABLE keyword_collection_logs DROP CONSTRAINT IF EXISTS UQ_keyword_collection_logs_unique_combination`);
        await queryRunner.query(`ALTER TABLE keyword_analytics DROP CONSTRAINT IF EXISTS UQ_keyword_id_analysis_date`);
        await queryRunner.query(`ALTER TABLE related_keywords DROP CONSTRAINT IF EXISTS UQ_base_related_keyword_analysis_date`);
        await queryRunner.query(`ALTER TABLE search_trends DROP CONSTRAINT IF EXISTS UQ_keyword_id_period_type_period_value`);
        await queryRunner.query(`ALTER TABLE monthly_search_ratios DROP CONSTRAINT IF EXISTS UQ_keyword_id_month_number_analysis_year`);
        
        console.log('✅ 고유 제약조건 제거가 완료되었습니다.');
    }
}
