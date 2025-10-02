import { MigrationInterface, QueryRunner } from "typeorm";

export class PostgreSQLSchema1758606527934 implements MigrationInterface {
    name = 'PostgreSQLSchema1758606527934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔄 PostgreSQL 데이터베이스 스키마를 생성합니다...');

        // 1. Keywords 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS keywords (
                id SERIAL PRIMARY KEY,
                keyword VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
                created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_keyword UNIQUE (keyword)
            )
        `);

        // 2. Keyword Analytics 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS keyword_analytics (
                id SERIAL PRIMARY KEY,
                keyword_id INTEGER NOT NULL,
                monthly_search_pc BIGINT NOT NULL DEFAULT 0,
                monthly_search_mobile BIGINT NOT NULL DEFAULT 0,
                monthly_search_total BIGINT NOT NULL DEFAULT 0,
                monthly_content_blog INTEGER NOT NULL DEFAULT 0,
                monthly_content_cafe INTEGER NOT NULL DEFAULT 0,
                monthly_content_all INTEGER NOT NULL DEFAULT 0,
                estimated_search_yesterday BIGINT NOT NULL DEFAULT 0,
                estimated_search_end_month BIGINT NOT NULL DEFAULT 0,
                saturation_index_blog DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                saturation_index_cafe DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                saturation_index_all DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                analysis_date DATE NOT NULL,
                created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_keyword_id_analysis_date UNIQUE (keyword_id, analysis_date),
                CONSTRAINT FK_keyword_analytics_keyword_id FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
            )
        `);

        // 3. Related Keywords 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS related_keywords (
                id SERIAL PRIMARY KEY,
                base_keyword_id INTEGER NOT NULL,
                related_keyword_id INTEGER NOT NULL,
                monthly_search_volume BIGINT NOT NULL DEFAULT 0,
                blog_cumulative_posts INTEGER NOT NULL DEFAULT 0,
                similarity_score VARCHAR(10) NOT NULL DEFAULT '보통' CHECK (similarity_score IN ('낮음', '보통', '높음')),
                rank_position INTEGER NOT NULL,
                analysis_date DATE NOT NULL,
                created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_base_related_keyword_analysis_date UNIQUE (base_keyword_id, related_keyword_id, analysis_date),
                CONSTRAINT FK_related_keywords_base_keyword_id FOREIGN KEY (base_keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
                CONSTRAINT FK_related_keywords_related_keyword_id FOREIGN KEY (related_keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
            )
        `);

        // 4. Search Trends 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS search_trends (
                id SERIAL PRIMARY KEY,
                keyword_id INTEGER NOT NULL,
                period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
                period_value VARCHAR(20) NOT NULL,
                search_volume BIGINT NOT NULL DEFAULT 0,
                search_ratio DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_keyword_id_period_type_period_value UNIQUE (keyword_id, period_type, period_value),
                CONSTRAINT FK_search_trends_keyword_id FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
            )
        `);

        // 5. Monthly Search Ratios 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS monthly_search_ratios (
                id SERIAL PRIMARY KEY,
                keyword_id INTEGER NOT NULL,
                month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
                search_ratio DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                analysis_year INTEGER NOT NULL,
                created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT UQ_keyword_id_month_number_analysis_year UNIQUE (keyword_id, month_number, analysis_year),
                CONSTRAINT FK_monthly_search_ratios_keyword_id FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
            )
        `);

        // 6. Keyword Collection Logs 테이블 생성
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS keyword_collection_logs (
                id SERIAL PRIMARY KEY,
                base_query_id INTEGER NOT NULL,
                collected_keyword_id INTEGER NOT NULL,
                collection_type VARCHAR(20) NOT NULL CHECK (collection_type IN ('trending', 'smartblock', 'related_search')),
                rank_position INTEGER NOT NULL DEFAULT 0,
                collected_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT FK_keyword_collection_logs_base_query_id FOREIGN KEY (base_query_id) REFERENCES keywords(id) ON DELETE CASCADE,
                CONSTRAINT FK_keyword_collection_logs_collected_keyword_id FOREIGN KEY (collected_keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
                CONSTRAINT UQ_keyword_collection_logs_unique_combination UNIQUE (base_query_id, collected_keyword_id, collection_type, collected_at)
            )
        `);

        // 인덱스 생성
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_analytics_keyword_id ON keyword_analytics(keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_analytics_analysis_date ON keyword_analytics(analysis_date)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_analytics_monthly_search_total ON keyword_analytics(monthly_search_total)`);
        
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_related_keywords_base_keyword_id ON related_keywords(base_keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_related_keywords_related_keyword_id ON related_keywords(related_keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_related_keywords_analysis_date ON related_keywords(analysis_date)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_related_keywords_rank_position ON related_keywords(rank_position)`);
        
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_search_trends_keyword_id ON search_trends(keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_search_trends_period_type ON search_trends(period_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_search_trends_period_value ON search_trends(period_value)`);
        
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_monthly_search_ratios_keyword_id ON monthly_search_ratios(keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_monthly_search_ratios_month_number ON monthly_search_ratios(month_number)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_monthly_search_ratios_analysis_year ON monthly_search_ratios(analysis_year)`);
        
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_collection_logs_base_query_id ON keyword_collection_logs(base_query_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_collection_logs_collected_keyword_id ON keyword_collection_logs(collected_keyword_id)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_collection_logs_collection_type ON keyword_collection_logs(collection_type)`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_keyword_collection_logs_collected_at ON keyword_collection_logs(collected_at)`);

        console.log('✅ PostgreSQL 데이터베이스 스키마 생성이 완료되었습니다!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('⚠️ PostgreSQL 스키마를 롤백합니다...');
        
        // 테이블 삭제 (역순)
        await queryRunner.query(`DROP TABLE IF EXISTS keyword_collection_logs CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS monthly_search_ratios CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS search_trends CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS related_keywords CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS keyword_analytics CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS keywords CASCADE`);
        
        console.log('✅ PostgreSQL 스키마 롤백이 완료되었습니다.');
    }
}
