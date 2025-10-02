import { AppDataSource } from '../src/config/data-source';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetMigrations() {
  try {
    console.log('🔄 마이그레이션 초기화를 시작합니다...');
    
    // 데이터소스 초기화
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 기존 마이그레이션 되돌리기
    console.log('⏪ 기존 마이그레이션을 되돌립니다...');
    
    // 모든 마이그레이션을 되돌리기 위해 반복 실행
    let hasMoreMigrations = true;
    while (hasMoreMigrations) {
      try {
        await AppDataSource.undoLastMigration();
        console.log('↩️  마이그레이션 하나를 되돌렸습니다.');
      } catch (error) {
        // 더 이상 되돌릴 마이그레이션이 없으면 종료
        hasMoreMigrations = false;
        console.log('✅ 모든 마이그레이션 되돌리기 완료');
      }
    }

    // 마이그레이션 재실행
    console.log('🚀 마이그레이션을 다시 실행합니다...');
    await AppDataSource.runMigrations();
    console.log('✅ 마이그레이션 재실행 완료');

    console.log('🎉 마이그레이션 초기화가 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 초기화 중 오류가 발생했습니다:', error);
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
resetMigrations();
