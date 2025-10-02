import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from '../../database/entities/keyword.entity';
import { KeywordAnalytics } from '../../database/entities/keyword-analytics.entity';

@Injectable()
export class KeywordAnalysisService {
  constructor(
    @InjectRepository(Keyword)
    private keywordRepository: Repository<Keyword>,
    @InjectRepository(KeywordAnalytics)
    private keywordAnalyticsRepository: Repository<KeywordAnalytics>,
  ) {}

  // 간단한 테스트 메서드
  async getServiceStatus() {
    const keywordCount = await this.keywordRepository.count();
    const analyticsCount = await this.keywordAnalyticsRepository.count();
    
    return {
      status: 'ok',
      keywordCount,
      analyticsCount,
      timestamp: new Date().toISOString(),
    };
  }

  // 키워드 목록 조회 (간단한 버전)
  async getKeywords(limit = 10) {
    try {
      const keywords = await this.keywordRepository.find({
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        data: keywords,
        count: keywords.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ 키워드 조회 오류:', error);
      throw error;
    }
  }

  // 키워드 추가 (간단한 버전)
  async addKeyword(keyword: string) {
    try {
      // 중복 체크
      const existing = await this.keywordRepository.findOne({
        where: { keyword },
      });

      if (existing) {
        return {
          success: false,
          message: '이미 존재하는 키워드입니다',
          data: existing,
        };
      }

      // 새 키워드 저장
      const newKeyword = this.keywordRepository.create({
        keyword,
        status: 'active',
      });

      const saved = await this.keywordRepository.save(newKeyword);

      return {
        success: true,
        message: '키워드가 추가되었습니다',
        data: saved,
      };
    } catch (error) {
      console.error('❌ 키워드 추가 오류:', error);
      throw error;
    }
  }
}
