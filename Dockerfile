# 멀티스테이지 빌드를 위한 Node.js 이미지
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성 포함)
RUN npm ci && npm cache clean --force

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 프로덕션 이미지 (Ubuntu 기반으로 변경)
FROM node:20-slim AS production

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성 설치
RUN npm ci --omit=dev && npm cache clean --force

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# Playwright 브라우저 설치 (Ubuntu 기반)
RUN npx playwright install chromium --with-deps

# 포트 노출
EXPOSE 3001

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# 애플리케이션 실행
CMD ["node", "dist/main.js"]
