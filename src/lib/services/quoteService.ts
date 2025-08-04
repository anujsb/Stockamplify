// src/lib/services/quoteService.ts
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

export class QuoteService {
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
}
