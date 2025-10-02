// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { KeywordAnalysisService } from './keyword-analysis.service';
// import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';
// import { RelatedKeywords } from '../../database/entities/related-keywords.entity';
// import { SearchTrends } from '../../database/entities/search-trends.entity';
// import { MonthlySearchRatios } from '../../database/entities/monthly-search-ratios.entity';
// import { WeekdaySearchRatios } from '../../database/entities/weekday-search-ratios.entity';
// import { GenderSearchRatios } from '../../database/entities/gender-search-ratios.entity';
// import { IssueAnalysis } from '../../database/entities/issue-analysis.entity';
// import { IntentAnalysis } from '../../database/entities/intent-analysis.entity';

// describe('KeywordAnalysisService', () => {
//   let service: KeywordAnalysisService;
//   let keywordAnalyticsRepository: Repository<KeywordAnalytics>;
//   let relatedKeywordsRepository: Repository<RelatedKeywords>;

//   const mockKeywordAnalyticsRepository = {
//     findOne: jest.fn(),
//     save: jest.fn(),
//     find: jest.fn(),
//     create: jest.fn(),
//     createQueryBuilder: jest.fn(),
//   };

//   const mockRelatedKeywordsRepository = {
//     find: jest.fn(),
//     save: jest.fn(),
//     delete: jest.fn(),
//   };

//   const mockRepository = {
//     find: jest.fn(),
//     save: jest.fn(),
//     delete: jest.fn(),
//     findOne: jest.fn(),
//     create: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         KeywordAnalysisService,
//         {
//           provide: getRepositoryToken(KeywordAnalytics),
//           useValue: mockKeywordAnalyticsRepository,
//         },
//         {
//           provide: getRepositoryToken(RelatedKeywords),
//           useValue: mockRelatedKeywordsRepository,
//         },
//         {
//           provide: getRepositoryToken(SearchTrends),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(MonthlySearchRatios),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(WeekdaySearchRatios),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(GenderSearchRatios),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(IssueAnalysis),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(IntentAnalysis),
//           useValue: mockRepository,
//         },
//       ],
//     }).compile();

//     service = module.get<KeywordAnalysisService>(KeywordAnalysisService);
//     keywordAnalyticsRepository = module.get<Repository<KeywordAnalytics>>(
//       getRepositoryToken(KeywordAnalytics),
//     );
//     relatedKeywordsRepository = module.get<Repository<RelatedKeywords>>(
//       getRepositoryToken(RelatedKeywords),
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('analyzeKeyword', () => {
//     it('새로운 키워드 분석 시 데이터를 생성하고 저장해야 함', async () => {
//       // Given
//       const keyword = '맛집';
//       const analysisDate = '2025-09-21';
      
//       mockKeywordAnalyticsRepository.findOne.mockResolvedValue(null);
//       mockKeywordAnalyticsRepository.create.mockReturnValue({
//         keyword,
//         monthlySearchPc: 50000,
//         monthlySearchMobile: 80000,
//         monthlySearchTotal: 130000,
//       });
//       mockKeywordAnalyticsRepository.save.mockResolvedValue({
//         id: 1,
//         keyword,
//         monthlySearchPc: 50000,
//         monthlySearchMobile: 80000,
//         monthlySearchTotal: 130000,
//         analysisDate,
//       });
      
//       mockRelatedKeywordsRepository.save.mockResolvedValue([
//         { keyword: '맛집 추천', monthlySearchVolume: 10000 },
//         { keyword: '맛집 리스트', monthlySearchVolume: 8000 },
//       ]);

//       // When
//       const result = await service.analyzeKeyword(keyword, analysisDate);

//       // Then
//       expect(result.analytics).toBeDefined();
//       expect(result.relatedKeywords).toBeDefined();
//       expect(result.chartData).toBeDefined();
//       expect(mockKeywordAnalyticsRepository.findOne).toHaveBeenCalledWith({
//         where: { keyword, analysisDate: expect.any(Date) },
//       });
//     });

//     it('이미 존재하는 키워드 분석 시 기존 데이터를 반환해야 함', async () => {
//       // Given
//       const keyword = '맛집';
//       const analysisDate = '2025-09-21';
//       const existingAnalytics = {
//         id: 1,
//         keyword,
//         monthlySearchPc: 50000,
//         monthlySearchMobile: 80000,
//         monthlySearchTotal: 130000,
//         monthlyContentBlog: 2500,
//         monthlyContentCafe: 180,
//         monthlyContentAll: 2680,
//         estimatedSearchYesterday: 104000,
//         estimatedSearchEndMonth: 135000,
//         saturationIndexBlog: 75.5,
//         saturationIndexCafe: 60.2,
//         saturationIndexAll: 68.1,
//         analysisDate: new Date(analysisDate),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
      
//       mockKeywordAnalyticsRepository.findOne.mockResolvedValue(existingAnalytics);
      
//       // Mock getKeywordAnalysis method
//       jest.spyOn(service, 'getKeywordAnalysis').mockResolvedValue({
//         success: true,
//         data: {
//           analytics: existingAnalytics,
//           relatedKeywords: [],
//           chartData: { searchTrends: [], monthlyRatios: [], weekdayRatios: [], genderRatios: null, issueAnalysis: null, intentAnalysis: null },
//         },
//       });

//       // When
//       const result = await service.analyzeKeyword(keyword, analysisDate);

//       // Then
//       expect(result).toBeDefined();
//       expect(service.getKeywordAnalysis).toHaveBeenCalledWith(keyword);
//     });
//   });

//   describe('getKeywordAnalysis', () => {
//     it('키워드 분석 데이터를 성공적으로 조회해야 함', async () => {
//       // Given
//       const keyword = '맛집';
//       const analytics = {
//         id: 1,
//         keyword,
//         monthlySearchPc: 50000,
//         monthlySearchMobile: 80000,
//         monthlySearchTotal: 130000,
//       };
//       const relatedKeywords = [
//         { keyword: '맛집 추천', monthlySearchVolume: 10000 },
//         { keyword: '맛집 리스트', monthlySearchVolume: 8000 },
//       ];

//       mockKeywordAnalyticsRepository.findOne.mockResolvedValue(analytics);
//       mockRelatedKeywordsRepository.find.mockResolvedValue(relatedKeywords);

//       // When
//       const result = await service.getKeywordAnalysis(keyword);

//       // Then
//       expect(result.success).toBe(true);
//       expect(result.data.analytics).toEqual(analytics);
//       expect(result.data.relatedKeywords).toEqual(relatedKeywords);
//     });

//     it('존재하지 않는 키워드 조회 시 빈 데이터를 반환해야 함', async () => {
//       // Given
//       const keyword = '존재하지않는키워드';
      
//       mockKeywordAnalyticsRepository.findOne.mockResolvedValue(null);

//       // When
//       const result = await service.getKeywordAnalysis(keyword);

//       // Then
//       expect(result.success).toBe(false);
//       expect(result.data.analytics).toBeNull();
//       expect(result.data.relatedKeywords).toEqual([]);
//     });
//   });

//   describe('getKeywordAnalysis', () => {
//     it('존재하지 않는 키워드 조회 시 빈 데이터를 반환해야 함', async () => {
//       // Given
//       const keyword = '존재하지않는키워드';
      
//       mockKeywordAnalyticsRepository.findOne.mockResolvedValue(null);

//       // When
//       const result = await service.getKeywordAnalysis(keyword);

//       // Then
//       expect(result.success).toBe(false);
//       expect(result.data.analytics).toBeNull();
//       expect(result.data.relatedKeywords).toEqual([]);
//     });
//   });
// });
