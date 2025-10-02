import { AppDataSource } from '../src/config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

async function clearAllData() {
  try {
    console.log('🧹 데이터베이스 데이터 삭제를 시작합니다...');
    
    // 데이터소스 초기화
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 외래키 제약 조건 비활성화
    console.log('🔓 외래키 제약 조건을 비활성화합니다...');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // 모든 테이블의 데이터 삭제 (테이블 구조는 유지)
    const tables = [
      'keyword_collection_logs',
      'monthly_search_ratios',
      'search_trends',
      'related_keywords',
      'keyword_analytics',
      'keywords'
    ];

    console.log('🗑️  테이블 데이터를 삭제합니다...');
    
    for (const table of tables) {
      try {
        const result = await AppDataSource.query(`DELETE FROM ${table}`);
        console.log(`   ✅ ${table} 테이블 데이터 삭제 완료`);
      } catch (error) {
        console.log(`   ⚠️  ${table} 테이블 삭제 중 오류 (테이블이 없을 수 있음): ${error.message}`);
      }
    }

    // AUTO_INCREMENT 값 초기화
    console.log('🔄 AUTO_INCREMENT 값을 초기화합니다...');
    for (const table of tables) {
      try {
        await AppDataSource.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
        console.log(`   ✅ ${table} AUTO_INCREMENT 초기화 완료`);
      } catch (error) {
        console.log(`   ⚠️  ${table} AUTO_INCREMENT 초기화 중 오류: ${error.message}`);
      }
    }

    // 외래키 제약 조건 재활성화
    console.log('🔒 외래키 제약 조건을 재활성화합니다...');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🎉 모든 데이터 삭제가 완료되었습니다!');
    console.log('📋 테이블 구조는 그대로 유지되었습니다.');
    
  } catch (error) {
    console.error('❌ 데이터 삭제 중 오류가 발생했습니다:', error);
    
    // 오류 발생 시에도 외래키 제약 조건 재활성화
    try {
      await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (fkError) {
      console.error('❌ 외래키 제약 조건 재활성화 실패:', fkError);
    }
    
    process.exit(1);
  } finally {
    // 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 데이터베이스 연결을 종료했습니다.');
    }
  }
}

// 스크립트 실행
clearAllData();
