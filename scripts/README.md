# 데이터베이스 초기화 스크립트

이 폴더에는 데이터베이스를 초기화하는 스크립트들이 포함되어 있습니다.

## 📋 스크립트 목록

### 1. `reset-database.ts`
**완전한 데이터베이스 초기화** - 모든 테이블과 데이터를 삭제하고 처음부터 재생성합니다.

- 기존 데이터베이스 스키마 완전 삭제
- 새로운 스키마 생성
- 모든 마이그레이션 재실행

### 2. `reset-migrations.ts`
**마이그레이션만 초기화** - 데이터는 유지하면서 마이그레이션만 되돌리고 재실행합니다.

- 기존 마이그레이션 되돌리기
- 마이그레이션 재실행
- 데이터 보존 (스키마 변경만 적용)

### 3. `clear-data.ts`
**데이터만 삭제** - 테이블 구조는 유지하고 모든 데이터만 삭제합니다.

- 모든 테이블의 데이터 삭제
- 테이블 구조 및 스키마 유지
- AUTO_INCREMENT 값 초기화
- 외래키 제약 조건 안전 처리

## 🚀 사용법

### 완전한 데이터베이스 초기화 (권장)
```bash
# backend 디렉토리에서 실행
cd packages/backend
npm run db:reset
```

### 마이그레이션만 초기화
```bash
# backend 디렉토리에서 실행
cd packages/backend
npm run db:reset-migrations
```

### 데이터만 삭제 (테이블 구조 유지)
```bash
# backend 디렉토리에서 실행
cd packages/backend
npm run db:clear-data
```

### 수동 실행
```bash
# 완전 초기화
npx ts-node scripts/reset-database.ts

# 마이그레이션만 초기화
npx ts-node scripts/reset-migrations.ts

# 데이터만 삭제
npx ts-node scripts/clear-data.ts
```

## ⚠️ 주의사항

1. **데이터 손실**: `db:reset`과 `db:clear-data` 명령어는 **모든 데이터를 삭제**합니다.
2. **백업**: 중요한 데이터가 있다면 실행 전에 반드시 백업하세요.
3. **환경변수**: `.env` 파일에 올바른 데이터베이스 설정이 있는지 확인하세요.
4. **권한**: 데이터베이스 드롭/생성 권한이 있는 계정을 사용해야 합니다.

## 🔧 환경변수 설정

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=keyword_finder
```

## 📝 실행 순서

1. 데이터베이스 서버가 실행 중인지 확인
2. 환경변수 설정 확인
3. 백업 필요시 데이터 백업
4. 초기화 스크립트 실행
5. 애플리케이션 재시작

## 🐛 문제 해결

### 연결 오류
- 데이터베이스 서버 상태 확인
- 환경변수 설정 확인
- 네트워크 연결 확인

### 권한 오류
- 데이터베이스 사용자 권한 확인
- DROP/CREATE DATABASE 권한 필요

### 마이그레이션 오류
- 기존 마이그레이션 파일 확인
- 데이터베이스 스키마 상태 확인
