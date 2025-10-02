"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_controller_1 = require("./workflow.controller");
const workflow_service_1 = require("./workflow.service");
const naver_api_module_1 = require("../naver-api/naver-api.module");
const scraping_module_1 = require("../scraping/scraping.module");
const keyword_analysis_module_1 = require("../keyword-analysis/keyword-analysis.module");
const app_config_1 = require("../../config/app.config");
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            naver_api_module_1.NaverApiModule,
            scraping_module_1.ScrapingModule,
            keyword_analysis_module_1.KeywordAnalysisModule,
        ],
        controllers: [workflow_controller_1.WorkflowController],
        providers: [workflow_service_1.WorkflowService, app_config_1.AppConfigService],
        exports: [workflow_service_1.WorkflowService],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map