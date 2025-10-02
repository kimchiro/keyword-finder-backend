import { AppDataSource } from '../src/config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    console.log('🔄 데이터베이스 초기화를 시작합니다...');
    
    // 데이터소스 초기화
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 모든 테이블 드롭
    console.log('🗑️  기존 테이블들을 삭제합니다...');
    await AppDataSource.dropDatabase();
    console.log('✅ 기존 테이블 삭제 완료');

    // 데이터베이스 재생성
    console.log('🏗️  데이터베이스를 재생성합니다...');
    await AppDataSource.synchronize();
    console.log('✅ 데이터베이스 스키마 재생성 완료');

    // 마이그레이션 실행
    console.log('🚀 마이그레이션을 실행합니다...');
    await AppDataSource.runMigrations();
    console.log('✅ 마이그레이션 실행 완료');

    console.log('🎉 데이터베이스 초기화가 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류가 발생했습니다:', error);
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
resetDatabase();
