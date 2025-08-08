// src/lib/services/chartService.ts
import yahooFinance from 'yahoo-finance2';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export interface YahooChartData {
  quotes: Array<{
    date: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjclose?: number;
  }>;
  meta: any; // Keep this raw
}

export type TimeInterval = '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';
export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';

export class ChartService {

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
   * Get chart data for a stock symbol (alternative method)
   */
  static async getChartData(
    symbol: string, 
    range: TimeRange = '1mo', 
    interval: TimeInterval = '1d'
  ): Promise<YahooChartData | null> {
    try {
      
      const chart = await yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - this.getPeriodInMs(range)),
        period2: new Date(),
        interval: interval as any
      } as any);

      // Debug log
      //console.log(`Chart data for ${symbol} (${range}/${interval}):`, JSON.stringify(chart, null, 2));

      const chartData = chart as any;
      if (!chartData.quotes) {
        throw new Error('Invalid chart data: missing quotes');
      }
      return chartData as YahooChartData;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return null;
    }
  }
}
