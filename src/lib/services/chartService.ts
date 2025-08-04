// src/lib/services/chartService.ts
import yahooFinance from 'yahoo-finance2';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export interface YahooChartData {
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }>;
  };
  meta: {
    symbol: string;
    regularMarketTime: number;
    gmtoffset: number;
    timezone: string;
    exchangeName: string;
    regularMarketPrice: number;
    chartPreviousClose: number;
    previousClose: number;
    scale: number;
    priceHint: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    currentTradingPeriod: {
      pre: {
        timezone: string;
        start: number;
        end: number;
        gmtoffset: number;
      };
      regular: {
        timezone: string;
        start: number;
        end: number;
        gmtoffset: number;
      };
      post: {
        timezone: string;
        start: number;
        end: number;
        gmtoffset: number;
      };
    };
    dataGranularity: string;
    validRanges: string[];
  };
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
   * Get chart data for a stock symbol
   */
  static async getChartData(
    symbol: string, 
    period: TimeRange = '1mo', 
    interval: TimeInterval = '1d'
  ): Promise<YahooChartData | null> {
    try {
      const chart = await yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - this.getPeriodInMs(period)),
        period2: new Date(),
        interval: interval as any
      });
      
      // Transform the chart data to match our interface
      const transformedChart: YahooChartData = {
        timestamp: chart.quotes.map((q: any) => q.timestamp),
        indicators: {
          quote: [{
            open: chart.quotes.map((q: any) => q.open),
            high: chart.quotes.map((q: any) => q.high),
            low: chart.quotes.map((q: any) => q.low),
            close: chart.quotes.map((q: any) => q.close),
            volume: chart.quotes.map((q: any) => q.volume)
          }]
        },
        meta: {
          symbol: chart.meta.symbol || '',
          regularMarketTime: chart.meta.regularMarketTime?.getTime() || Date.now(),
          gmtoffset: chart.meta.gmtoffset || 0,
          timezone: chart.meta.timezone || '',
          exchangeName: chart.meta.exchangeName || '',
          regularMarketPrice: chart.meta.regularMarketPrice || 0,
          chartPreviousClose: chart.meta.chartPreviousClose || 0,
          previousClose: chart.meta.previousClose || 0,
          scale: chart.meta.scale || 1,
          priceHint: chart.meta.priceHint || 0,
          fiftyTwoWeekHigh: (chart.meta as any).fiftyTwoWeekHigh,
          fiftyTwoWeekLow: (chart.meta as any).fiftyTwoWeekLow,
          currentTradingPeriod: {
            pre: { 
              timezone: chart.meta.currentTradingPeriod?.pre?.timezone || '', 
              start: chart.meta.currentTradingPeriod?.pre?.start?.getTime() || 0, 
              end: chart.meta.currentTradingPeriod?.pre?.end?.getTime() || 0, 
              gmtoffset: chart.meta.currentTradingPeriod?.pre?.gmtoffset || 0 
            },
            regular: { 
              timezone: chart.meta.currentTradingPeriod?.regular?.timezone || '', 
              start: chart.meta.currentTradingPeriod?.regular?.start?.getTime() || 0, 
              end: chart.meta.currentTradingPeriod?.regular?.end?.getTime() || 0, 
              gmtoffset: chart.meta.currentTradingPeriod?.regular?.gmtoffset || 0 
            },
            post: { 
              timezone: chart.meta.currentTradingPeriod?.post?.timezone || '', 
              start: chart.meta.currentTradingPeriod?.post?.start?.getTime() || 0, 
              end: chart.meta.currentTradingPeriod?.post?.end?.getTime() || 0, 
              gmtoffset: chart.meta.currentTradingPeriod?.post?.gmtoffset || 0 
            }
          },
          dataGranularity: chart.meta.dataGranularity || '',
          validRanges: chart.meta.validRanges || []
        }
      };
      return transformedChart;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return null;
    }
  }
}
