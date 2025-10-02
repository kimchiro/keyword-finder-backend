"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const app_config_1 = require("./config/app.config");
const data_source_1 = require("./config/data-source");
async function bootstrap() {
    try {
        console.log('🔄 데이터베이스 마이그레이션을 실행합니다...');
        await data_source_1.AppDataSource.initialize();
        await data_source_1.AppDataSource.runMigrations();
        console.log('✅ 데이터베이스 마이그레이션이 완료되었습니다.');
    }
    catch (error) {
        console.error('❌ 데이터베이스 마이그레이션 실패:', error);
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const appConfig = app.get(app_config_1.AppConfigService);
    appConfig.validateAllConfigs();
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            'https://keyword-finder-frontend-khgykri2a-kimchiros-projects.vercel.app',
            process.env.FRONTEND_URL || 'http://localhost:3000'
        ],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Keyword Finder API')
        .setDescription('네이버 키워드 분석 및 스크래핑 API')
        .setVersion('2.0')
        .addTag('keyword-analysis', '키워드 분석')
        .addTag('naver-api', '네이버 API')
        .addTag('scraping', '스크래핑')
        .addTag('health', '헬스체크')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = appConfig.port;
    await app.listen(port);
    console.log(`🚀 NestJS 애플리케이션이 포트 ${port}에서 실행 중입니다.`);
    console.log(`📚 API 문서: http://localhost:${port}/api/docs`);
    console.log(`🔧 설정 요약:`, JSON.stringify(appConfig.getConfigSummary(), null, 2));
}
bootstrap();
//# sourceMappingURL=main.js.map