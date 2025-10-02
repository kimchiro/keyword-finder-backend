"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("./services/transaction.service");
const api_retry_service_1 = require("./services/api-retry.service");
const rate_limit_guard_1 = require("./guards/rate-limit.guard");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            transaction_service_1.TransactionService,
            api_retry_service_1.ApiRetryService,
            rate_limit_guard_1.RateLimitGuard,
        ],
        exports: [
            transaction_service_1.TransactionService,
            api_retry_service_1.ApiRetryService,
            rate_limit_guard_1.RateLimitGuard,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.simple.js.map