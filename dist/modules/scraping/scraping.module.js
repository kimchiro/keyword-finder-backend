"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scraping_controller_1 = require("./scraping.controller");
const scraping_service_1 = require("./scraping.service");
const keyword_entity_1 = require("../../database/entities/keyword.entity");
const keyword_collection_logs_entity_1 = require("../../database/entities/keyword-collection-logs.entity");
const app_config_1 = require("../../config/app.config");
const common_module_1 = require("../../common/common.module");
let ScrapingModule = class ScrapingModule {
};
exports.ScrapingModule = ScrapingModule;
exports.ScrapingModule = ScrapingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([keyword_entity_1.Keyword, keyword_collection_logs_entity_1.KeywordCollectionLogs]),
            common_module_1.CommonModule,
        ],
        controllers: [scraping_controller_1.ScrapingController],
        providers: [scraping_service_1.ScrapingService, app_config_1.AppConfigService],
        exports: [scraping_service_1.ScrapingService],
    })
], ScrapingModule);
//# sourceMappingURL=scraping.module.js.map