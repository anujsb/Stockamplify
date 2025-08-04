// src/lib/services/searchService.ts
import yahooFinance from 'yahoo-finance2';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export class SearchService {
  /**
   * Search stocks by keywords using yahoo-finance2
   */
  static async searchStocks(keywords: string): Promise<any[]> {
    try {
      const searchData = await yahooFinance.search(keywords);
      return searchData.quotes || [];
    } catch (error) {
      console.error(`Error searching stocks with keywords ${keywords}:`, error);
      return [];
    }
  }
}
