# 🔍 키워드 수집기 백엔드 (Keyword Finder Backend)

네이버 검색 키워드 수집기 백엔드 API 서버입니다. 자동완성, 함께 많이 찾는, 인기주제 데이터를 수집하고 분석하는 NestJS 기반 애플리케이션입니다.

## ✨ 주요 기능

- 🕷️ **네이버 스크래핑**: Playwright를 사용한 키워드 자동 수집
- 📊 **키워드 분석**: 수집된 데이터의 통계 및 트렌드 분석
- 🔗 **네이버 API 연동**: 블로그 검색, 콘텐츠 발행량 조회
- 🗄️ **데이터베이스**: PostgreSQL을 사용한 데이터 저장
- 🚀 **워크플로우**: 통합된 키워드 분석 파이프라인
- 📈 **모니터링**: 헬스체크, 메트릭, 서킷 브레이커

## 🏗️ 기술 스택

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL + TypeORM
- **Scraping**: Playwright
- **API**: 네이버 검색 API
- **Deployment**: Docker, Railway, CloudType, Vercel

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/kimdongeun/keyword-finder-backend.git
cd keyword-finder-backend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 필수 환경 변수 설정
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=keyword_finder
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 4. 데이터베이스 마이그레이션
```bash
npm run migrate
```

### 5. 애플리케이션 실행
```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run build
npm start
```

## 📚 API 문서

서버 실행 후 Swagger API 문서에 접근할 수 있습니다:
- **로컬**: http://localhost:3001/api/docs
- **프로덕션**: https://your-domain.com/api/docs

## 🔗 주요 API 엔드포인트

### 헬스체크
- `GET /api/health` - 기본 헬스체크
- `GET /api/health/circuit-breaker` - 서킷 브레이커 상태
- `GET /api/health/rate-limit` - Rate Limit 상태
- `GET /api/health/api-metrics` - API 메트릭

### 스크래핑
- `POST /api/scraping/scrape` - 키워드 스크래핑 실행
- `GET /api/scraping/logs` - 수집 로그 조회
- `GET /api/scraping/stats` - 스크래핑 통계
- `GET /api/scraping/browser-pool/status` - 브라우저 풀 상태

### 키워드 분석
- `POST /api/keyword-analysis/analyze/:keyword` - 키워드 분석 실행
- `GET /api/keyword-analysis/analysis/:keyword` - 분석 결과 조회
- `GET /api/keyword-analysis/list` - 분석된 키워드 목록

### 네이버 API
- `GET /api/naver/blog-search` - 블로그 검색
- `GET /api/naver/content-counts/:query` - 콘텐츠 발행량 조회
- `POST /api/naver/single-keyword-full-data` - 단일 키워드 전체 데이터
- `POST /api/naver/multiple-keywords-limited-data` - 다중 키워드 제한 데이터

### 워크플로우
- `POST /api/workflow/complete/:query` - 통합 워크플로우 실행
- `GET /api/workflow/health` - 워크플로우 상태 체크

## 🐳 Docker 배포

### Docker Compose 사용
```bash
# 환경 변수 설정 후
docker-compose up -d
```

### 개별 Docker 이미지
```bash
# 이미지 빌드
docker build -t keyword-finder-backend .

# 컨테이너 실행
docker run -p 3001:3001 \
  -e DB_HOST=your_db_host \
  -e NAVER_CLIENT_ID=your_client_id \
  -e NAVER_CLIENT_SECRET=your_client_secret \
  keyword-finder-backend
```

## ☁️ 클라우드 배포

### Railway
1. Railway 계정에 로그인
2. 새 프로젝트 생성
3. GitHub 저장소 연결
4. 환경 변수 설정
5. 자동 배포 완료

### CloudType
1. CloudType 계정에 로그인
2. 새 서비스 생성
3. Docker 이미지 업로드 또는 GitHub 연결
4. 환경 변수 설정
5. 배포 실행

### Vercel
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 🧪 테스트

```bash
# 단위 테스트
npm test

# 테스트 커버리지
npm run test:cov

# 테스트 감시 모드
npm run test:watch
```

## 📊 모니터링

### 헬스체크
- **기본 상태**: `GET /api/health`
- **서비스 상태**: `GET /api/workflow/health`

### 메트릭
- **API 메트릭**: `GET /api/health/api-metrics`
- **스크래핑 통계**: `GET /api/scraping/stats`
- **브라우저 풀**: `GET /api/scraping/browser-pool/status`

## 🔧 개발

### 프로젝트 구조
```
src/
├── common/           # 공통 모듈
├── config/           # 설정 파일
├── constants/        # 상수 정의
├── database/         # 데이터베이스 엔티티 및 마이그레이션
├── modules/          # 기능별 모듈
│   ├── health/       # 헬스체크
│   ├── scraping/     # 스크래핑
│   ├── keyword-analysis/ # 키워드 분석
│   ├── naver-api/    # 네이버 API
│   └── workflow/     # 워크플로우
└── main.ts          # 애플리케이션 진입점
```

### 스크립트
```bash
# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 데이터베이스 마이그레이션
npm run migrate

# 데이터베이스 리셋 (개발용)
npm run db:reset
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. [Issues](https://github.com/kimdongeun/keyword-finder-backend/issues) 페이지
2. [배포 가이드](DEPLOYMENT.md)
3. 로그 파일 및 환경 변수 설정

## 🙏 감사의 말

- [NestJS](https://nestjs.com/) - Node.js 프레임워크
- [Playwright](https://playwright.dev/) - 웹 스크래핑
- [TypeORM](https://typeorm.io/) - ORM
- [네이버 개발자센터](https://developers.naver.com/) - API 제공