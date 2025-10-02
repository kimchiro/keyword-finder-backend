import { KeywordAnalysisService } from './keyword-analysis.service';
import { KeywordAnalysisResponseDto, GetAnalysisResponseDto } from './dto/keyword-analysis.dto';
export declare class KeywordAnalysisController {
    private readonly keywordAnalysisService;
    constructor(keywordAnalysisService: KeywordAnalysisService);
    analyzeKeyword(keyword: string): Promise<KeywordAnalysisResponseDto>;
    getKeywordAnalysis(keyword: string): Promise<GetAnalysisResponseDto>;
    getAnalyzedKeywords(): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
}
