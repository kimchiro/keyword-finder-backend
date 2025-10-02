# Workflow Module

워크플로우 모듈은 키워드 분석의 전체 프로세스를 관리하는 핵심 모듈입니다.

## 📁 폴더 구조

```
workflow/
├── workflow.controller.ts    # REST API 엔드포인트
├── workflow.service.ts       # 비즈니스 로직
├── workflow.module.ts        # NestJS 모듈 설정
├── README.md                 # 모듈 문서
└── tests/                    # 테스트 파일들
    ├── workflow.controller.spec.ts     # 컨트롤러 단위 테스트
    ├── workflow.service.spec.ts        # 서비스 단위 테스트
    ├── workflow.integration.spec.ts    # 통합 테스트
    ├── workflow.simple.spec.ts         # 간단한 테스트
    ├── jest.config.js                  # Jest 설정
    └── test-setup.ts                   # 테스트 셋업
```

## 🚀 주요 기능

### 1. 완전한 워크플로우 (`executeCompleteWorkflow`)
- 스크래핑 → 데이터 저장 → 키워드 추출 → 네이버 API 호출 → 분석 저장
- 전체 키워드 분석 프로세스를 순차적으로 실행

### 2. 빠른 분석 (`executeQuickAnalysis`)
- 네이버 API만 호출하여 빠른 분석 제공
- 스크래핑 없이 즉시 결과 반환

### 3. 스크래핑 전용 (`executeScrapingOnly`)
- 스크래핑만 실행하고 결과 반환
- 키워드 수집에 특화

### 4. 상태 체크 (`checkWorkflowHealth`)
- 모든 의존 서비스의 상태 확인
- 시스템 헬스 체크

## 🔧 의존성

- **NaverApiService**: 네이버 API 호출
- **ScrapingService**: 웹 스크래핑
- **KeywordAnalysisService**: 키워드 분석 및 저장
- **AppConfigService**: 설정 관리

## 📊 API 엔드포인트

```typescript
POST /api/workflow/complete/:query     # 완전한 워크플로우 실행
POST /api/workflow/quick/:query        # 빠른 분석 실행  
POST /api/workflow/scraping/:query     # 스크래핑 전용 실행
GET  /api/workflow/health              # 워크플로우 상태 체크
```

## 🧪 테스트 실행

```bash
# 모든 테스트 실행
npm test -- --testPathPattern=workflow

# 특정 테스트 파일 실행
npm test -- --testPathPattern=workflow.simple.spec.ts

# 통합 테스트 실행
npm test -- --testPathPattern=workflow.integration.spec.ts
```

## 📝 테스트 구조

### Unit Tests
- `workflow.service.spec.ts`: 서비스 로직 테스트
- `workflow.controller.spec.ts`: 컨트롤러 테스트

### Integration Tests  
- `workflow.integration.spec.ts`: 실제 API 호출 테스트

### Simple Tests
- `workflow.simple.spec.ts`: 기본 기능 테스트

## 🔄 워크플로우 프로세스

1. **Phase 1**: 스크래핑 실행
   - 네이버 연관검색어, 스마트블록 등 수집

2. **Phase 2**: 스크래핑 데이터 DB 저장
   - 수집된 키워드를 데이터베이스에 저장

3. **Phase 3**: 상위 키워드 추출
   - DB에서 랭킹 기반 상위 5개 키워드 추출

4. **Phase 4**: 네이버 API 호출
   - 원본 키워드 + 추출된 키워드로 API 호출
   - 트렌드, 검색량, 콘텐츠 수 등 수집

5. **Phase 5**: 분석 데이터 저장
   - 최종 분석 결과를 데이터베이스에 저장

## ⚠️ 주의사항

- 테스트 파일들은 `tests/` 폴더에서 관리
- import 경로는 상대 경로로 설정 (`../`)
- Mock 서비스는 실제 API 구조와 일치해야 함
