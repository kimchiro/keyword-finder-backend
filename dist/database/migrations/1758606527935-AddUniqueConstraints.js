"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUniqueConstraints1758606527935 = void 0;
class AddUniqueConstraints1758606527935 {
    constructor() {
        this.name = 'AddUniqueConstraints1758606527935';
    }
    async up(queryRunner) {
        console.log('🔄 기존 테이블에 고유 제약조건을 추가합니다...');
        try {
            await queryRunner.query(`
                ALTER TABLE keyword_collection_logs 
                ADD CONSTRAINT UQ_keyword_collection_logs_unique_combination 
                UNIQUE (base_query_id, collected_keyword_id, collection_type, collected_at)
            `);
            console.log('✅ keyword_collection_logs 고유 제약조건 추가 완료');
        }
        catch (error) {
            console.log('⚠️ keyword_collection_logs 고유 제약조건이 이미 존재합니다.');
        }
        try {
            await queryRunner.query(`
                ALTER TABLE keyword_analytics 
                ADD CONSTRAINT UQ_keyword_id_analysis_date 
                UNIQUE (keyword_id, analysis_date)
            `);
            console.log('✅ keyword_analytics 고유 제약조건 추가 완료');
        }
        catch (error) {
            console.log('⚠️ keyword_analytics 고유 제약조건이 이미 존재합니다.');
        }
        try {
            await queryRunner.query(`
                ALTER TABLE related_keywords 
                ADD CONSTRAINT UQ_base_related_keyword_analysis_date 
                UNIQUE (base_keyword_id, related_keyword_id, analysis_date)
            `);
            console.log('✅ related_keywords 고유 제약조건 추가 완료');
        }
        catch (error) {
            console.log('⚠️ related_keywords 고유 제약조건이 이미 존재합니다.');
        }
        try {
            await queryRunner.query(`
                ALTER TABLE search_trends 
                ADD CONSTRAINT UQ_keyword_id_period_type_period_value 
                UNIQUE (keyword_id, period_type, period_value)
            `);
            console.log('✅ search_trends 고유 제약조건 추가 완료');
        }
        catch (error) {
            console.log('⚠️ search_trends 고유 제약조건이 이미 존재합니다.');
        }
        try {
            await queryRunner.query(`
                ALTER TABLE monthly_search_ratios 
                ADD CONSTRAINT UQ_keyword_id_month_number_analysis_year 
                UNIQUE (keyword_id, month_number, analysis_year)
            `);
            console.log('✅ monthly_search_ratios 고유 제약조건 추가 완료');
        }
        catch (error) {
            console.log('⚠️ monthly_search_ratios 고유 제약조건이 이미 존재합니다.');
        }
        console.log('✅ 고유 제약조건 추가가 완료되었습니다!');
    }
    async down(queryRunner) {
        console.log('⚠️ 고유 제약조건을 제거합니다...');
        await queryRunner.query(`ALTER TABLE keyword_collection_logs DROP CONSTRAINT IF EXISTS UQ_keyword_collection_logs_unique_combination`);
        await queryRunner.query(`ALTER TABLE keyword_analytics DROP CONSTRAINT IF EXISTS UQ_keyword_id_analysis_date`);
        await queryRunner.query(`ALTER TABLE related_keywords DROP CONSTRAINT IF EXISTS UQ_base_related_keyword_analysis_date`);
        await queryRunner.query(`ALTER TABLE search_trends DROP CONSTRAINT IF EXISTS UQ_keyword_id_period_type_period_value`);
        await queryRunner.query(`ALTER TABLE monthly_search_ratios DROP CONSTRAINT IF EXISTS UQ_keyword_id_month_number_analysis_year`);
        console.log('✅ 고유 제약조건 제거가 완료되었습니다.');
    }
}
exports.AddUniqueConstraints1758606527935 = AddUniqueConstraints1758606527935;
//# sourceMappingURL=1758606527935-AddUniqueConstraints.js.map