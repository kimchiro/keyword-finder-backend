"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
beforeAll(() => {
    process.env.NODE_ENV = 'test';
    if (process.env.SILENT_TESTS === 'true') {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    }
});
afterAll(() => {
    jest.restoreAllMocks();
});
global.createMockWorkflowResult = (overrides = {}) => ({
    success: true,
    data: {
        query: '테스트',
        naverApiData: {
            original: { blogSearch: {}, datalab: {} },
            firstBatch: null,
            secondBatch: null,
        },
        scrapingData: {
            query: '테스트',
            totalKeywords: 0,
            executionTime: 0,
            categories: {},
            keywords: [],
            collectionDetails: {
                timestamp: new Date().toISOString(),
                browser: 'test',
                userAgent: 'test'
            }
        },
        analysisData: {
            keyword: '테스트',
            analytics: {},
            relatedKeywords: [],
            chartData: {},
        },
        topKeywords: [],
        keywordsWithRank: [],
        executionTime: 1.0,
        timestamp: new Date().toISOString(),
        ...overrides,
    },
    message: '테스트 완료',
});
//# sourceMappingURL=test-setup.js.map