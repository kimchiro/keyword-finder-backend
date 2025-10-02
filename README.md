# 🚀 Railway 배포용 백엔드

Railway에서 이 디렉토리를 직접 배포하세요.

## 📋 배포 설정

- **Nixpacks 설정**: `nixpacks.toml`
- **Railway 설정**: `railway.json` 
- **포트**: 3001
- **헬스체크**: `/health`

## 🔧 Railway 배포 방법

1. Railway에서 **Root Directory**를 `app/backend`로 설정
2. 환경 변수 설정:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=your_database_url
   NAVER_CLIENT_ID=your_naver_client_id
   NAVER_CLIENT_SECRET=your_naver_client_secret
   ```

## ✅ 배포 확인

배포 후 헬스체크: `https://your-app.railway.app/health`

---

# 키워드 파인더 백엔드 v2.0

네이버 검색 키워드 수집 및 분석을 위한 백엔드 API 서버입니다.

## 🏗️ 아키텍처 (v2.0 업데이트)

### 레이어드 패턴 구조

```
src/
├── app.js                 # 메인 애플리케이션 서버 (NEW)
├── modules/               # 기능별 모듈 (NEW)
│   ├── keywords/          # 키워드 관리 모듈
│   │   ├── routes/        # 라우터
│   │   ├── controllers/   # 컨트롤러
│   │   ├── services/      # 비즈니스 로직
│   │   └── dao/          # 데이터 액세스
│   ├── naver-api/        # 네이버 API 모듈
│   ├── scraping/         # 스크래핑 모듈
│   └── stats/            # 통계 모듈
├── shared/               # 공통 모듈 (NEW)
│   ├── database/         # 통합 데이터베이스 연결
│   ├── middleware/       # 미들웨어
│   └── utils/           # 유틸리티
├── scraper/             # 스크래핑 엔진
├── collectors/          # 데이터 수집기
└── database/            # 레거시 파일 백업
```

## 🎯 주요 기능

### 1. 키워드 스크래핑
- 네이버 자동완성 키워드
- 함께 많이 찾는 키워드
- 인기주제 키워드
- 연관검색어

### 2. 네이버 API 통합
- 블로그 검색 API
- 데이터랩 통합검색어 트렌드
- 검색광고 키워드 도구
- 종합 분석 (모든 API 데이터 통합)

### 3. 데이터 관리
- MySQL 데이터베이스 저장
- TypeORM 기반 데이터 액세스
- 캐시 시스템 (메모리 + DB)
- 자동 데이터 정제

### 4. 통계 및 분석
- 실시간 대시보드 통계
- 키워드별 상세 분석
- 시스템 성능 모니터링

## 🚀 시작하기

### 1. 환경 설정

```bash
# 환경 변수 파일 생성
cp env.example .env

# 필요한 환경 변수 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=keyword_finder
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret
```

### 2. 데이터베이스 설정

```bash
# 데이터베이스 테이블 생성
npm run setup-db
```

### 3. 서버 실행

```bash
# 개발 모드 (NEW)
npm run dev

# 프로덕션 모드 (NEW)
npm start

# 스크래핑만 실행
npm run scraper
```

## 📋 API 엔드포인트 (v2.0)

### 🔍 키워드 관리 (`/api/keywords`)

- `GET /` - 키워드 목록 조회
- `GET /stats` - 키워드 통계 조회
- `POST /` - 키워드 저장
- `DELETE /:query` - 키워드 삭제

### 🌐 네이버 API (`/api/naver`)

- `POST /search` - 네이버 블로그 검색
- `POST /datalab` - 데이터랩 트렌드 조회
- `POST /comprehensive-analysis` - 종합 분석
- `GET /search-results/:query` - 저장된 검색 결과 조회
- `GET /trend-data/:query` - 저장된 트렌드 데이터 조회
- `GET /integrated-data/:query` - 통합 데이터 조회
- `DELETE /cache` - 캐시 정리

### 🕷️ 스크래핑 (`/api/scraping`)

- `POST /scrape` - 키워드 스크래핑 실행
- `POST /batch` - 배치 스크래핑
- `GET /keywords/:query` - 스크래핑된 키워드 조회
- `GET /status/:query` - 스크래핑 상태 확인
- `POST /test` - 테스트 스크래핑

### 📊 통계 (`/api/stats`)

- `GET /` - 대시보드 통계
- `GET /keyword/:query` - 키워드별 통계
- `GET /system` - 시스템 통계

### ❤️ 헬스체크

- `GET /health` - 서버 상태 확인

## 🛠️ 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: TypeORM
- **Scraping**: Playwright
- **HTTP Client**: Axios
- **Process Manager**: Nodemon

## 📁 모듈 구조 (v2.0)

### Keywords Module
- **DAO**: 키워드 데이터 액세스
- **Service**: 키워드 비즈니스 로직
- **Controller**: HTTP 요청 처리
- **Routes**: API 라우팅

### Naver API Module
- **DAO**: 네이버 API 데이터 관리
- **Service**: API 호출 및 캐싱 로직
- **Controller**: API 요청/응답 처리
- **Routes**: 네이버 API 라우팅

### Scraping Module
- **DAO**: 스크래핑 데이터 저장
- **Service**: 스크래핑 실행 및 관리
- **Controller**: 스크래핑 API 처리
- **Routes**: 스크래핑 라우팅

### Stats Module
- **Service**: 통계 데이터 생성
- **Controller**: 통계 API 처리
- **Routes**: 통계 라우팅

## 🔄 v2.0 주요 변경사항

### ✅ 개선된 점들

1. **레이어드 패턴 적용**: Router → Controller → Service → DAO
2. **모듈별 분리**: 키워드, 네이버API, 스크래핑, 통계
3. **통합 데이터베이스 연결**: 중복 제거 및 일관성 확보
4. **환경변수 통일**: 모든 DB 설정을 `DB_*` 형식으로 통일
5. **코드 정리**: 불필요한 파일 제거 및 백업 처리
6. **확장성 향상**: 새로운 모듈 추가가 쉬워짐
7. **유지보수성**: 명확한 책임 분리

### 🗂️ 파일 구조 변경

**이전 (v1.0)**:
```
src/
├── server.js           # 거대한 단일 파일
├── database/
│   ├── connection.js   # 중복된 연결 설정
│   ├── naver-api-models.js # 비즈니스 로직 혼재
│   └── ...
```

**현재 (v2.0)**:
```
src/
├── app.js              # 깔끔한 메인 서버
├── modules/            # 기능별 모듈
├── shared/             # 공통 기능
└── database/           # 백업 파일들
```

### 🔧 마이그레이션 가이드

1. **기존 코드 백업**: 모든 기존 파일이 `.backup` 확장자로 보존됨
2. **새로운 구조 적용**: 레이어드 패턴으로 완전히 재구성
3. **API 호환성**: 기존 API 엔드포인트 유지
4. **환경변수**: `DB_*` 형식으로 통일 (기존 설정 확인 필요)

## 🚨 주의사항

- 네이버 API 키 설정 필수
- MySQL 데이터베이스 연결 필요
- 스크래핑 시 적절한 딜레이 설정 권장
- 프로덕션 환경에서는 환경 변수 보안 관리

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정 (`DB_*` 형식)
2. 데이터베이스 연결
3. 네이버 API 키 유효성
4. 로그 파일 확인

## 📈 성능 개선

v2.0에서는 다음과 같은 성능 개선이 이루어졌습니다:

- **단일 DB 연결 풀**: 4개의 중복 연결 → 1개의 통합 연결
- **모듈화**: 필요한 기능만 로드
- **캐시 최적화**: 메모리 + DB 이중 캐시
- **에러 처리**: 레이어별 적절한 에러 핸들링

---

**Version**: 2.0.0  
**Last Updated**: 2025-09-19  
**Architecture**: Layered Pattern with Modular Design