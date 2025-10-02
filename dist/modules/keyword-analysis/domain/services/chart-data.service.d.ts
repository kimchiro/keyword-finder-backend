import { Repository, DataSource } from 'typeorm';
import { TransactionService } from '../../../../common/services/transaction.service';
import { SearchTrends } from '../../../../database/entities/search-trends.entity';
import { MonthlySearchRatios } from '../../../../database/entities/monthly-search-ratios.entity';
import { Keyword, AnalysisDate } from '../value-objects';
export declare class ChartDataService {
    private searchTrendsRepository;
    private monthlySearchRatiosRepository;
    private transactionService;
    private dataSource;
    constructor(searchTrendsRepository: Repository<SearchTrends>, monthlySearchRatiosRepository: Repository<MonthlySearchRatios>, transactionService: TransactionService, dataSource: DataSource);
    saveChartData(keyword: Keyword, analysisDate: AnalysisDate, naverApiData?: any): Promise<{
        searchTrends: SearchTrends[];
        monthlyRatios: MonthlySearchRatios[];
    }>;
    getChartData(keyword: Keyword, analysisDate: AnalysisDate): Promise<{
        searchTrends: any[];
        monthlyRatios: any[];
    }>;
    private clearExistingChartData;
    private extractChartDataFromNaverApi;
}
