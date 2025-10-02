#!/bin/bash

# 배포 스크립트
set -e

echo "🚀 배포 시작..."

# 환경 변수 확인
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
fi

# 빌드
echo "📦 빌드 중..."
npm run build

# 마이그레이션 실행
echo "🗄️ 데이터베이스 마이그레이션 실행..."
npm run migrate

# 테스트 실행 (선택사항)
if [ "$SKIP_TESTS" != "true" ]; then
    echo "🧪 테스트 실행..."
    npm test
fi

echo "✅ 배포 준비 완료!"
echo "📚 API 문서: http://localhost:3001/api/docs"
echo "🔍 헬스체크: http://localhost:3001/api/health"
