// src/lib/services/historicalService.ts
import yahooFinance from 'yahoo-finance2';
import { TimeInterval, TimeRange } from './chartService';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export interface YahooHistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class HistoricalService {
  /**
   * Convert period to milliseconds for historical data
   */
  private static getPeriodInMs(period: TimeRange): number {
    const now = Date.now();
    switch (period) {
      case '1d': return 24 * 60 * 60 * 1000;
      case '5d': return 5 * 24 * 60 * 60 * 1000;
      case '1mo': return 30 * 24 * 60 * 60 * 1000;
      case '3mo': return 90 * 24 * 60 * 60 * 1000;
      case '6mo': return 180 * 24 * 60 * 60 * 1000;
      case '1y': return 365 * 24 * 60 * 60 * 1000;
      case '2y': return 2 * 365 * 24 * 60 * 60 * 1000;
      case '5y': return 5 * 365 * 24 * 60 * 60 * 1000;
      case '10y': return 10 * 365 * 24 * 60 * 60 * 1000;
      case 'ytd': return now - new Date(new Date().getFullYear(), 0, 1).getTime();
      case 'max': return now - new Date(1970, 0, 1).getTime();
      default: return 30 * 24 * 60 * 60 * 1000; // 1 month default
    }
  }

  /**
   * Get historical data for a stock symbol
   */
  static async getHistoricalData(
    symbol: string, 
    period: TimeRange = '1mo', 
    interval: TimeInterval = '1d'
  ): Promise<YahooHistoricalData[]> {
    try {
      const history = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - this.getPeriodInMs(period)),
        period2: new Date(),
        interval: interval as any
      });
      return history.map((item: any) => ({
        timestamp: item.date.getTime(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }
}
