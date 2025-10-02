"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TransactionService = class TransactionService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async runInTransaction(work) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const result = await work(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async batchInsert(queryRunner, entity, data, chunkSize = 1000) {
        if (data.length === 0)
            return;
        const repository = queryRunner.manager.getRepository(entity);
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await repository.insert(chunk);
        }
    }
    async batchUpsert(queryRunner, entity, data, conflictColumns, updateColumns, chunkSize = 1000) {
        if (data.length === 0)
            return;
        const repository = queryRunner.manager.getRepository(entity);
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await repository
                .createQueryBuilder()
                .insert()
                .values(chunk)
                .orUpdate(updateColumns, conflictColumns)
                .execute();
        }
    }
    async batchDelete(queryRunner, entity, whereConditions) {
        const repository = queryRunner.manager.getRepository(entity);
        await repository.delete(whereConditions);
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map