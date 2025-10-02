import { MigrationInterface, QueryRunner } from "typeorm";

export class CheckConstraints1758606527937 implements MigrationInterface {
    name = 'CheckConstraints1758606527937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔍 데이터베이스 제약조건 상태를 확인합니다...');

        // keyword_collection_logs 테이블의 제약조건 확인
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
        constraints.forEach((constraint: any) => {
            console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
        });

        // 고유 제약조건이 없으면 추가
        if (constraints.length === 0) {
            console.log('⚠️ 고유 제약조건이 없습니다. 추가합니다...');
            
            try {
                await queryRunner.query(`
                    ALTER TABLE keyword_collection_logs 
                    ADD CONSTRAINT UQ_keyword_collection_logs_unique_combination 
                    UNIQUE (base_query_id, collected_keyword_id, collection_type, collected_at)
                `);
                console.log('✅ 고유 제약조건 추가 완료');
            } catch (error) {
                console.error('❌ 고유 제약조건 추가 실패:', error);
            }
        } else {
            console.log('✅ 고유 제약조건이 이미 존재합니다.');
        }

        // 다른 테이블들도 확인
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
            tableConstraints.forEach((constraint: any) => {
                console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
            });
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️ 제약조건 확인 마이그레이션은 롤백할 수 없습니다.');
    }
}
