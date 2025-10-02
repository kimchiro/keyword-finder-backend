# 🚀 배포 가이드

이 문서는 키워드 수집기 백엔드 애플리케이션의 배포 방법을 설명합니다.

## 📋 사전 요구사항

- Node.js 20.0.0 이상
- npm 10.0.0 이상
- Docker (선택사항)
- PostgreSQL 데이터베이스

## 🔧 환경 변수 설정

배포 전에 다음 환경 변수들을 설정해야 합니다:

```bash
# 서버 설정
PORT=3001
NODE_ENV=production

# 데이터베이스 설정
DB_HOST=your_database_host
DB_PORT=5432
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_DATABASE=your_database_name

# 네이버 API 설정
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_API_BASE_URL=https://openapi.naver.com

# 기타 설정 (선택사항)
API_TIMEOUT_MS=10000
SCRAPING_MAX_RESULTS=50
BROWSER_POOL_SIZE=3
RATE_LIMIT_MAX=100
```

## 🐳 Docker 배포

### 1. Docker 이미지 빌드
```bash
docker build -t keyword-finder-backend .
```

### 2. Docker Compose로 실행
```bash
# 환경 변수 설정 후
docker-compose up -d
```

### 3. 개별 컨테이너 실행
```bash
docker run -p 3001:3001 \
  -e DB_HOST=your_db_host \
  -e DB_USERNAME=your_username \
  -e DB_PASSWORD=your_password \
  -e NAVER_CLIENT_ID=your_client_id \
  -e NAVER_CLIENT_SECRET=your_client_secret \
  keyword-finder-backend
```

## ☁️ 클라우드 배포

### Railway 배포
1. Railway 계정에 로그인
2. 새 프로젝트 생성
3. GitHub 저장소 연결
4. 환경 변수 설정
5. 자동 배포 완료

### CloudType 배포
1. CloudType 계정에 로그인
2. 새 서비스 생성
3. Docker 이미지 업로드 또는 GitHub 연결
4. 환경 변수 설정
5. 배포 실행

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 🗄️ 데이터베이스 설정

### 1. 마이그레이션 실행
```bash
npm run migrate
```

### 2. 데이터베이스 리셋 (개발용)
```bash
npm run db:reset
```

## 📊 헬스체크

배포 후 다음 엔드포인트로 서비스 상태를 확인할 수 있습니다:

- **기본 헬스체크**: `GET /api/health`
- **서킷 브레이커 상태**: `GET /api/health/circuit-breaker`
- **Rate Limit 상태**: `GET /api/health/rate-limit`
- **API 메트릭**: `GET /api/health/api-metrics`

## 🔍 모니터링

### 로그 확인
```bash
# Docker 로그
docker logs keyword-finder-backend

# Docker Compose 로그
docker-compose logs -f app
```

### 성능 모니터링
- API 메트릭: `/api/health/api-metrics`
- 브라우저 풀 상태: `/api/scraping/browser-pool/status`
- 스크래핑 통계: `/api/scraping/stats`

## 🚨 문제 해결

### 일반적인 문제들

1. **데이터베이스 연결 실패**
   - 환경 변수 확인
   - 데이터베이스 서버 상태 확인
   - 네트워크 연결 확인

2. **네이버 API 인증 실패**
   - 클라이언트 ID/Secret 확인
   - API 사용량 한도 확인

3. **Playwright 브라우저 오류**
   - Docker 이미지에서 `--with-deps` 옵션 사용
   - 시스템 의존성 설치 확인

### 로그 레벨 조정
```bash
# 개발 모드
NODE_ENV=development npm start

# 프로덕션 모드
NODE_ENV=production npm start
```

## 📚 API 문서

배포 후 Swagger API 문서에 접근할 수 있습니다:
- **로컬**: http://localhost:3001/api/docs
- **프로덕션**: https://your-domain.com/api/docs

## 🔄 업데이트 배포

1. 코드 변경사항 커밋
2. 새 버전 태그 생성
3. 자동 배포 트리거 또는 수동 배포 실행
4. 헬스체크로 배포 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일
2. 환경 변수 설정
3. 데이터베이스 연결
4. 네트워크 상태
