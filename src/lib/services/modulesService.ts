// src/lib/services/modulesService.ts
import yahooFinance from 'yahoo-finance2';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export interface YahooModulesData {
  summaryProfile?: {
    sector?: string;
    industry?: string;
  };
  financialData?: {
    totalRevenue?: number;
    totalCash?: number;
    totalDebt?: number;
    debtToEquity?: number;
    currentRatio?: number;
    quickRatio?: number;
    profitMargins?: number;
    grossMargins?: number;
    operatingMargins?: number;
    ebitdaMargins?: number;
    returnOnAssets?: number;
    returnOnEquity?: number;
    revenueGrowth?: number;
    earningsGrowth?: number;
    recommendationKey?: string;
    numberOfAnalystOpinions?: number;
    targetHighPrice?: number;
    targetLowPrice?: number;
  };
  defaultKeyStatistics?: {
    heldPercentInstitutions?: number;
    heldPercentInsiders?: number;
    lastSplitFactor?: string;
    lastSplitDate?: number;
    lastDividendValue?: number;
    lastDividendDate?: number;
  };
  calendarEvents?: {
    earnings?: {
      earningsDate?: number[];
      earningsCallDate?: number[];
    };
  };
}

export class ModulesService {
  /**
   * Get detailed modules data for a stock symbol
   */
  static async getModulesData(symbol: string): Promise<YahooModulesData | null> {
    try {
      const modules = await yahooFinance.quoteSummary(symbol, {
        modules: [
          'summaryProfile',
          'financialData',
          'defaultKeyStatistics',
          'calendarEvents'
        ]
      });
      return modules as YahooModulesData;
    } catch (error) {
      console.error(`Error fetching modules data for ${symbol}:`, error);
      return null;
    }
  }
}
