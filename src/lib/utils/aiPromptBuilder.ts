/**
 * AI Prompt Builder
 * Constructs prompts for Gemini AI based on stock data and analysis requirements
 */

import { YahooChartData } from '@/lib/services/chartService';
import { calculateAllIndicators, getRSIInterpretation, getMACDInterpretation, getSMAInterpretation } from './technicalIndicators';
import { getHorizonConfig } from './investmentHorizons';

export interface AnalysisData {
  symbol: string;
  chart: YahooChartData | null;
  investmentHorizon: string;
  interval: string;
  period: string;
  // language?: string;
}

// export interface TechnicalAnalysis {
//   prices: number[];
//   volumes: number[];
//   currentPrice: number;
//   previousClose: number;
//   priceChange: number;
//   priceChangePercent: number;
//   sma20: number | null;
//   sma50: number | null;
//   rsi: number | null;
//   macd: number | null;
//   supportLevels: number[];
//   resistanceLevels: number[];
// }

/**
 * Validate chart data structure and completeness
 * @param chart - Chart data to validate
 * @returns Validation result with details
 */
function validateChartData(chart: YahooChartData | null): { isValid: boolean; error?: string } {
  if (!chart) {
    return { isValid: false, error: 'Chart data is null' };
  }

  if (!chart.indicators?.quote?.[0]) {
    return { isValid: false, error: 'Missing quote indicators in chart data' };
  }

  const quote = chart.indicators.quote[0];
  if (!quote.open || !quote.high || !quote.low || !quote.close || !quote.volume) {
    return { isValid: false, error: 'Missing OHLCV data in quote indicators' };
  }

  if (!chart.timestamp || chart.timestamp.length === 0) {
    return { isValid: false, error: 'Missing timestamp data' };
  }

  if (chart.timestamp.length !== quote.close.length) {
    return { isValid: false, error: 'Timestamp and price data length mismatch' };
  }

  if (!chart.meta) {
    return { isValid: false, error: 'Missing meta data' };
  }

  // if (chart.meta.regularMarketPrice === undefined || chart.meta.previousClose === undefined) {
  //   return { isValid: false, error: 'Missing current price or previous close in meta data' };
  // }

  return { isValid: true };
}

/**
 * Calculate technical analysis from historical data
 * @param data - Analysis data
 * @returns Technical analysis results
 */
// export function calculateTechnicalAnalysis(data: AnalysisData): TechnicalAnalysis {
//   const { chart } = data;
  
//   // Validate chart data
//   const validation = validateChartData(chart);
//   if (!validation.isValid) {
//     throw new Error(`Invalid chart data: ${validation.error}`);
//   }

//   const prices = chart.indicators.quote[0].close;
//   const volumes = chart.indicators.quote[0].volume;
//   const currentPrice = chart.meta.regularMarketPrice;
//   const previousClose = chart.meta.previousClose;
//   const priceChange = currentPrice - previousClose;
//   const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;

//   // Create PriceData array for technical indicators
//   const priceData = chart.timestamp.map((timestamp, index) => ({
//     timestamp: timestamp,
//     open: chart.indicators.quote[0].open[index],
//     high: chart.indicators.quote[0].high[index],
//     low: chart.indicators.quote[0].low[index],
//     close: chart.indicators.quote[0].close[index],
//     volume: chart.indicators.quote[0].volume[index]
//   }));

//   const indicators = calculateAllIndicators(priceData, currentPrice);

//   return {
//     prices,
//     volumes,
//     currentPrice,
//     previousClose,
//     priceChange,
//     priceChangePercent,
//     sma20: indicators.sma20,
//     sma50: indicators.sma50,
//     rsi: indicators.rsi,
//     macd: indicators.macd,
//     supportLevels: indicators.supportLevels,
//     resistanceLevels: indicators.resistanceLevels
//   };
// }

/**
 * Build comprehensive AI prompt for stock analysis
 * @param data - Analysis data
 * @returns Formatted prompt string
 */
export function buildAnalysisPrompt(data: AnalysisData): string {
// const { symbol, chart, investmentHorizon, interval, period, language = 'english' } = data;
const { symbol, chart, investmentHorizon, interval, period } = data;
  
  // Validate chart data first
  const validation = validateChartData(chart);
  if (!validation.isValid) {
    throw new Error(`Invalid chart data: ${validation.error}`);
  }
  
  // Calculate additional metrics from chart data
  const currentVolume = chart!.indicators.quote[0].volume[chart!.indicators.quote[0].volume.length - 1];
  const avgVolume = chart!.indicators.quote[0].volume.reduce((a, b) => a + b, 0) / chart!.indicators.quote[0].volume.length;
  const highestHigh = Math.max(...chart!.indicators.quote[0].high);
  const lowestLow = Math.min(...chart!.indicators.quote[0].low);
  const priceRange = highestHigh - lowestLow;
  // const currentPrice = chart!.meta.regularMarketPrice;
  // const previousClose = chart!.meta.previousClose;
  // const currentFromHigh = ((highestHigh - currentPrice) / highestHigh) * 100;
  // const currentFromLow = ((currentPrice - lowestLow) / lowestLow) * 100;
  
  // Helper function to get human-readable interval description
  const getIntervalDescription = (interval: string): string => {
    const intervalMap: Record<string, string> = {
      '1m': '1 minute candles',
      '2m': '2 minute candles', 
      '5m': '5 minute candles',
      '15m': '15 minute candles',
      '30m': '30 minute candles',
      '60m': '60 minute candles',
      '90m': '90 minute candles',
      '1h': '1 hour candles',
      '1d': '1 day (daily) candles',
      '5d': '5 day candles',
      '1wk': '1 week (weekly) candles',
      '1mo': '1 month (monthly) candles',
      '3mo': '3 month candles'
    };
    return intervalMap[interval] || `${interval} interval candles`;
  };

  // Helper function to get human-readable period description
  const getPeriodDescription = (period: string): string => {
    const periodMap: Record<string, string> = {
      '1d': '1 day of historical data',
      '5d': '5 days of historical data',
      '1mo': '1 month of historical data',
      '3mo': '3 months of historical data', 
      '6mo': '6 months of historical data',
      '1y': '1 year of historical data',
      '2y': '2 years of historical data',
      '5y': '5 years of historical data',
      '10y': '10 years of historical data',
      'ytd': 'Year-to-date historical data',
      'max': 'Maximum available historical data'
    };
    return periodMap[period] || `${period} of historical data`;
  };

  // Convert chart data to comprehensive JSON format for AI analysis
  const jsonData = JSON.stringify({
    // Data Context and Parameters
    analysisParameters: {
      symbol: symbol,
      interval: interval,
      intervalDescription: getIntervalDescription(interval),
      period: period, 
      periodDescription: getPeriodDescription(period),
      investmentHorizon: investmentHorizon,
      explanation: `This data contains ${getPeriodDescription(period)} with ${getIntervalDescription(interval)} for stock ${symbol}`
    },
    
    // Basic stock info
    stockInfo: {
      symbol,
      // currentPrice: currentPrice,
      // previousClose: previousClose,
      // priceChange: currentPrice - previousClose,
      // priceChangePercent: previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
      currency: 'INR' // Assuming Indian market based on .BO suffix
    },
    
    // Volume analysis
    volumeAnalysis: {
      currentVolume: currentVolume,
      averageVolume: Math.round(avgVolume),
      volumeRatio: currentVolume ? (currentVolume / avgVolume).toFixed(2) : null,
      explanation: 'Volume ratio above 1.0 indicates higher than average trading activity'
    },
    
    // Market data from meta
    marketData: {
      fiftyTwoWeekHigh: chart!.meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: chart!.meta.fiftyTwoWeekLow,
      // exchangeName: chart!.meta.exchangeName,
      // timezone: chart!.meta.timezone
    },

    // Price position analysis
    pricePositionAnalysis: {
      highestInPeriod: highestHigh,
      lowestInPeriod: lowestLow,
      priceRangeInPeriod: priceRange,
      // currentDistanceFromHigh: `${currentFromHigh.toFixed(2)}%`,
      // currentDistanceFromLow: `${currentFromLow.toFixed(2)}%`,
      totalDataPoints: chart!.timestamp.length,
      explanation: 'Distance percentages show how far current price is from period highs/lows'
    },
    
    // Complete historical OHLCV data
    historicalCandles: {
      explanation: `Each candle represents ${getIntervalDescription(interval)} of trading data with OHLCV (Open, High, Low, Close, Volume)`,
      totalCandles: chart!.timestamp.length,
      data: chart!.timestamp.map((timestamp, index) => {
        // Safely convert timestamp to date string
        let dateString = 'Invalid Date';
        let timeString = 'Invalid Time';
        try {
          if (timestamp && typeof timestamp === 'number' && timestamp > 0) {
            // Check if timestamp is in seconds (typical Unix timestamp) or milliseconds
            const timestampMs = timestamp > 1e12 ? timestamp : timestamp * 1000;
            const date = new Date(timestampMs);
            if (!isNaN(date.getTime())) {
              dateString = date.toISOString().split('T')[0];
              timeString = date.toISOString().split('T')[1].split('.')[0];
            }
          }
        } catch (error) {
          console.warn('Invalid timestamp:', timestamp);
        }
        
        return {
          timestamp: timestamp,
          date: dateString,
          time: timeString,
          open: chart!.indicators.quote[0].open[index],
          high: chart!.indicators.quote[0].high[index],
          low: chart!.indicators.quote[0].low[index],
          close: chart!.indicators.quote[0].close[index],
          volume: chart!.indicators.quote[0].volume[index]
        };
      })
    },
    
    // Technical indicators
    // technicalIndicators: {
    //   sma20: technical.sma20,
    //   sma50: technical.sma50,
    //   rsi: technical.rsi,
    //   macd: technical.macd,
    //   supportLevels: technical.supportLevels,
    //   resistanceLevels: technical.resistanceLevels
    // },
    
    // Data quality and metadata
    dataQuality: {
      period: period,
      periodDescription: getPeriodDescription(period),
      interval: interval,
      intervalDescription: getIntervalDescription(interval),
      dataPoints: chart!.timestamp.length,
      latestDataTime: chart!.meta.regularMarketTime ? new Date(chart!.meta.regularMarketTime * 1000).toISOString() : 'Unknown',
      hasFiftyTwoWeekData: !!(chart!.meta.fiftyTwoWeekHigh && chart!.meta.fiftyTwoWeekLow),
      dataIntegrity: {
        hasCompleteOHLCV: true,
        timeRangeValid: true,
        explanation: 'All OHLCV data points are present and timestamps are validated'
      }
    }
  }, null, 2);

  const getIntervalDesc = (interval: string): string => {
    const map: Record<string, string> = {
      '1m': '1-minute', '2m': '2-minute', '5m': '5-minute', '15m': '15-minute', 
      '30m': '30-minute', '60m': '60-minute', '90m': '90-minute', '1h': '1-hour',
      '1d': 'daily', '5d': '5-day', '1wk': 'weekly', '1mo': 'monthly', '3mo': '3-monthly'
    };
    return map[interval] || interval;
  };

  const getPeriodDesc = (period: string): string => {
    const map: Record<string, string> = {
      '1d': '1 day', '5d': '5 days', '1mo': '1 month', '3mo': '3 months',
      '6mo': '6 months', '1y': '1 year', '2y': '2 years', '5y': '5 years',
      '10y': '10 years', 'ytd': 'year-to-date', 'max': 'maximum available'
    };
    return map[period] || period;
  };

  const prompt = `You are a senior financial market analyst with expertise in technical analysis.

**ANALYSIS TASK:**
Analyze the stock ${symbol} using the provided historical price and volume data.

**DATA SPECIFICATIONS:**
- Historical Period: ${getPeriodDesc(period)} (${period})
- Data Interval: ${getIntervalDesc(interval)} candles (${interval})
- Investment Horizon: ${investmentHorizon}
- Data Format: Yahoo Finance OHLCV format

**ANALYSIS APPROACH:**
Your analysis and recommendations must dynamically adapt based on BOTH the investment horizon and the data interval (candle timeframe).

-------------------------
DATA INTERVAL → HOW TO INTERPRET
-------------------------
- If ${interval} is 1m, 5m, or 15m (intraday candles)
  → focus on micro-trends, immediate momentum, short-lived support/resistance zones, and very tight stop-loss levels.

- If ${interval} is 1h or 4h (short swing candles)
  → capture broader intraday swings, short-term breakouts/breakdowns, and moving averages relevant for a few days.

- If ${interval} is 1d or above (daily/weekly candles)
  → analyze medium-to-long-term trends, stable support/resistance, and trend sustainability.

-------------------------
INVESTMENT HORIZON → OVERRIDES FOCUS
-------------------------
- Scalping (Minutes to Hours)
  → ONLY micro-trends using 1m/5m intervals, extreme precision on support/resistance, and very tight stop-loss.

- Intraday (Same Day)
  → focus on 1m/5m/15m intervals, detecting momentum shifts, volume bursts, and same-day reversals.

- Swing-Short (1–5 Days)
  → combine 15m/1h/4h + Daily to identify quick multi-day momentum, breakout/breakdown levels, and short-lived swing opportunities.

- Swing-Medium (1–4 Weeks)
  → rely mostly on 4h & Daily data for classic swing trading trends, medium-term moving averages, and key resistance/support zones.

- Position Trading (1–6 Months)
  → prioritize Daily & Weekly candles, capturing trend continuation, accumulation/distribution patterns, and larger trend reversals.

- Long-term (6–12 Months)
  → emphasize Weekly/Monthly data, major support/resistance, macro trend direction, and sustainability.

-------------------------
ANALYSIS RULES
-------------------------
- Match the horizon's typical holding period.
- Choose appropriate support/resistance precision (tight for short-term, broad for long-term).
- Scale risk levels & confidence scores logically (scalping = high volatility, long-term = more stable).
- Adapt stop-loss & exit targets based on horizon.
- Highlight the most relevant indicators (e.g., short-term RSI/MACD for scalping vs. long-term SMA for investing).
- Market sentiment should come from price action or implied recent news.

Return ONLY a structured JSON response in this exact format:

{
  "symbol": "string",
  "trendDirection": "string",             // Overall technical trend: Bullish, Bearish, Sideways
  "trendByTimeframe": {
    "shortTerm": "string",               // 1–5 days outlook
    "mediumTerm": "string",              // 1–3 weeks outlook
    "longTerm": "string"                 // 1–6 months outlook
  },
  "trendConfidenceScore": int,            // 0–100, how reliable the trend is
  "volatility": "string",               // High, Low, Increasing, Decreasing
  "volatilityScore": int,                 // 0–100 volatility level
  "riskLevel": "Low" / "Medium" / "High",
  "supportLevels": ["value", "value"],
  "resistanceLevels": ["value", "value"],
  "targetPrice": {
    "upside": "value",
    "downside": "value"
  },
  "entryPoint": "value",               // If it's a good zone to enter
  "stopLoss": "value",
  "exitTarget": "value",
  "indicators": {
    "RSI": "string",                    // e.g. 'Oversold (34)', 'Neutral (50)'
    "MACD": "string",                   // e.g. 'Bearish crossover'
    "SMA": "string"                     // e.g. 'Below 20-day SMA'
  },
  "recommendation": "Buy" / "Sell" / "Hold",
  "confidenceScore": int,                 // 0–100 recommendation strength
  "recommendedHoldingPeriod": "string", // e.g. 'Intraday', '1–2 weeks', '1–3 months'
  "suitableFor": ["string"],            // e.g. ["Short-term Traders", "Long-term Investors"]
  "marketSentiment": "Bullish" / "Bearish" / "Neutral",
  "sentimentSource": "string",          // Summarized from recent news if possible
  "week52Comparison": {
    "currentPrice": "value",
    "week52High": "value",
    "week52Low": "value",
    "position": "Near High" / "Near Low" / "Mid Range"
  },
  "reasoning": "Short summary (1–3 sentences) justifying the recommendation"
}

Important (Guidance):
- Return only the valid JSON.
- Do not wrap it in markdown, text, explanation, or code blocks.
- Keep the explanation short and structured.
- Base your analysis strictly on the provided stock data.
- Provide realistic and logical numbers for confidence, volatility, and support/resistance levels.
- Sentiment should be derived from **price action**, or if available, from latest news headlines about the company.
- Week52 comparison should position current price relatively.

Here is the yfinance data for analysis:
${jsonData}`;

  return prompt;
} 