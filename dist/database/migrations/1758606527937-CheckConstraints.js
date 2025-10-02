"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckConstraints1758606527937 = void 0;
class CheckConstraints1758606527937 {
    constructor() {
        this.name = 'CheckConstraints1758606527937';
    }
    async up(queryRunner) {
        console.log('🔍 데이터베이스 제약조건 상태를 확인합니다...');
        const constraints = await queryRunner.query(`
            SELECT 
                conname as constraint_name,
                contype as constraint_type,
                pg_get_constraintdef(oid) as constraint_definition
            FROM pg_constraint 
            WHERE conrelid = 'keyword_collection_logs'::regclass
            AND contype = 'u'
        `);
        console.log('📋 keyword_collection_logs 테이블의 고유 제약조건:');
        constraints.forEach((constraint) => {
            console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
        });
        if (constraints.length === 0) {
            console.log('⚠️ 고유 제약조건이 없습니다. 추가합니다...');
            try {
                await queryRunner.query(`
                    ALTER TABLE keyword_collection_logs 
                    ADD CONSTRAINT UQ_keyword_collection_logs_unique_combination 
                    UNIQUE (base_query_id, collected_keyword_id, collection_type, collected_at)
                `);
                console.log('✅ 고유 제약조건 추가 완료');
            }
            catch (error) {
                console.error('❌ 고유 제약조건 추가 실패:', error);
            }
        }
        else {
            console.log('✅ 고유 제약조건이 이미 존재합니다.');
        }
        const otherTables = ['keyword_analytics', 'related_keywords', 'search_trends', 'monthly_search_ratios'];
        for (const tableName of otherTables) {
            const tableConstraints = await queryRunner.query(`
                SELECT 
                    conname as constraint_name,
                    contype as constraint_type,
                    pg_get_constraintdef(oid) as constraint_definition
                FROM pg_constraint 
                WHERE conrelid = '${tableName}'::regclass
                AND contype = 'u'
            `);
            console.log(`📋 ${tableName} 테이블의 고유 제약조건: ${tableConstraints.length}개`);
            tableConstraints.forEach((constraint) => {
                console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
            });
        }
    }
    async down(queryRunner) {
        console.log('⚠️ 제약조건 확인 마이그레이션은 롤백할 수 없습니다.');
    }
}
exports.CheckConstraints1758606527937 = CheckConstraints1758606527937;
//# sourceMappingURL=1758606527937-CheckConstraints.js.map