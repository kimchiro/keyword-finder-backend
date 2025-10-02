import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 설정 검증 수행
  const appConfig = app.get(AppConfigService);
  appConfig.validateAllConfigs();

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
  });

  // 전역 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API 프리픽스 설정
  app.setGlobalPrefix('api');

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Keyword Finder API')
    .setDescription('네이버 키워드 분석 및 스크래핑 API')
    .setVersion('2.0')
    .addTag('keyword-analysis', '키워드 분석')
    .addTag('naver-api', '네이버 API')
    .addTag('scraping', '스크래핑')
    .addTag('health', '헬스체크')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = appConfig.port;
  await app.listen(port);

  console.log(`🚀 NestJS 애플리케이션이 포트 ${port}에서 실행 중입니다.`);
  console.log(`📚 API 문서: http://localhost:${port}/api/docs`);
  console.log(`🔧 설정 요약:`, JSON.stringify(appConfig.getConfigSummary(), null, 2));
}

bootstrap();
