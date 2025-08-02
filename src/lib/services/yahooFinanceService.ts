// src/lib/services/yahooFinanceService.ts
import yahooFinance from 'yahoo-finance2';

// Suppress the survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

export interface YahooQuoteData {
  symbol: string;
  longName?: string;
  fullExchangeName?: string;
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  averageDailyVolume3Month?: number;
  averageDailyVolume10Day?: number;
  marketCap?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  bookValue?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
}

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

export interface YahooHistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

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

export class YahooFinanceService {
  /**
   * Get quote data for a stock symbol
   */
  static async getQuote(symbol: string): Promise<YahooQuoteData | null> {
    try {
      const quote = await yahooFinance.quote(symbol);
      return quote as YahooQuoteData;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

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

  /**
   * Get comprehensive stock data for AI analysis
   */
  static async getStockDataForAnalysis(
    symbol: string, 
    period: TimeRange = '1mo', 
    interval: TimeInterval = '1d'
  ): Promise<{
    quote: YahooQuoteData | null;
    modules: YahooModulesData | null;
    historical: YahooHistoricalData[];
    chart: YahooChartData | null;
  }> {
    try {
      const [quote, modules, historical, chart] = await Promise.all([
        this.getQuote(symbol),
        this.getModulesData(symbol),
        this.getHistoricalData(symbol, period, interval),
        this.getChartData(symbol, period, interval)
      ]);

      return { quote, modules, historical, chart };
    } catch (error) {
      console.error(`Error fetching comprehensive data for ${symbol}:`, error);
      return { 
        quote: null, 
        modules: null, 
        historical: [], 
        chart: null 
      };
    }
  }

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

  /**
   * Get comprehensive stock data (quote + modules)
   */
  static async getComprehensiveStockData(symbol: string): Promise<{
    quote: YahooQuoteData | null;
    modules: YahooModulesData | null;
  }> {
    try {
      const [quote, modules] = await Promise.all([
        this.getQuote(symbol),
        this.getModulesData(symbol)
      ]);

      return { quote, modules };
    } catch (error) {
      console.error(`Error fetching comprehensive data for ${symbol}:`, error);
      return { quote: null, modules: null };
    }
  }

  /**
   * Validate if a symbol exists and is tradeable
   */
  static async validateSymbol(symbol: string): Promise<boolean> {
    try {
      const quote = await this.getQuote(symbol);
      return quote !== null && quote.regularMarketPrice !== undefined;
    } catch (error) {
      console.error(`Error validating symbol ${symbol}:`, error);
      return false;
    }
  }

  /**
   * Get default interval and period based on investment horizon
   * @deprecated Use getHorizonConfig from @/lib/utils/investmentHorizons instead
   */
  static getDefaultsFromHorizon(investmentHorizon: string): {
    interval: TimeInterval;
    period: TimeRange;
  } {
    const { getHorizonConfig } = require('@/lib/utils/investmentHorizons');
    const config = getHorizonConfig(investmentHorizon);
    return { interval: config.interval, period: config.period };
  }
}