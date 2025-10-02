"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const common_module_1 = require("./common/common.module");
const keyword_analysis_module_1 = require("./modules/keyword-analysis/keyword-analysis.module");
const naver_api_module_1 = require("./modules/naver-api/naver-api.module");
const scraping_module_1 = require("./modules/scraping/scraping.module");
const health_module_1 = require("./modules/health/health.module");
const workflow_module_1 = require("./modules/workflow/workflow.module");
const database_config_1 = require("./config/database.config");
const validation_schema_1 = require("./config/validation.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validate: validation_schema_1.validateEnvironment,
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: true,
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: database_config_1.DatabaseConfig,
            }),
            common_module_1.CommonModule,
            keyword_analysis_module_1.KeywordAnalysisModule,
            naver_api_module_1.NaverApiModule,
            scraping_module_1.ScrapingModule,
            health_module_1.HealthModule,
            workflow_module_1.WorkflowModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map