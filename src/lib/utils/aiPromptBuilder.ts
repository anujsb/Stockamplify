/**
 * AI Prompt Builder
 * Constructs prompts for Gemini AI based on stock data and analysis requirements
 */

import { YahooQuoteData, YahooModulesData, YahooHistoricalData } from '@/lib/services/yahooFinanceService';
import { calculateAllIndicators, getRSIInterpretation, getMACDInterpretation, getSMAInterpretation } from './technicalIndicators';
import { getHorizonConfig } from './investmentHorizons';

export interface AnalysisData {
  symbol: string;
  quote: YahooQuoteData | null;
  modules: YahooModulesData | null;
  historical: YahooHistoricalData[];
  chart: any;
  investmentHorizon: string;
  interval: string;
  period: string;
  language?: string;
}

export interface TechnicalAnalysis {
  prices: number[];
  volumes: number[];
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  sma20: number | null;
  sma50: number | null;
  rsi: number | null;
  macd: number | null;
  supportLevels: number[];
  resistanceLevels: number[];
}

/**
 * Calculate technical analysis from historical data
 * @param data - Analysis data
 * @returns Technical analysis results
 */
export function calculateTechnicalAnalysis(data: AnalysisData): TechnicalAnalysis {
  const { historical, quote } = data;
  
  const prices = historical.map(h => h.close);
  const volumes = historical.map(h => h.volume);
  const currentPrice = quote?.regularMarketPrice || prices[prices.length - 1];
  const previousClose = quote?.regularMarketPreviousClose || prices[prices.length - 2];
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;

  const indicators = calculateAllIndicators(historical, currentPrice);

  return {
    prices,
    volumes,
    currentPrice,
    previousClose,
    priceChange,
    priceChangePercent,
    sma20: indicators.sma20,
    sma50: indicators.sma50,
    rsi: indicators.rsi,
    macd: indicators.macd,
    supportLevels: indicators.supportLevels,
    resistanceLevels: indicators.resistanceLevels
  };
}

/**
 * Build comprehensive AI prompt for stock analysis
 * @param data - Analysis data
 * @returns Formatted prompt string
 */
export function buildAnalysisPrompt(data: AnalysisData): string {
  const { symbol, quote, modules, historical, investmentHorizon, interval, period, language = 'english' } = data;
  const technical = calculateTechnicalAnalysis(data);

  // Convert historical data to JSON format for AI analysis
  const jsonData = JSON.stringify({
    symbol,
    currentPrice: technical.currentPrice,
    previousClose: technical.previousClose,
    priceChange: technical.priceChange,
    priceChangePercent: technical.priceChangePercent,
    volume: quote?.regularMarketVolume,
    marketCap: quote?.marketCap,
    peRatio: quote?.trailingPE,
    fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: quote?.fiftyTwoWeekLow,
    sector: modules?.summaryProfile?.sector,
    industry: modules?.summaryProfile?.industry,
    historicalData: historical.map(h => ({
      timestamp: h.timestamp,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume
    })),
    technicalIndicators: {
      sma20: technical.sma20,
      sma50: technical.sma50,
      rsi: technical.rsi,
      macd: technical.macd,
      supportLevels: technical.supportLevels,
      resistanceLevels: technical.resistanceLevels
    },
    fundamentalData: {
      totalRevenue: modules?.financialData?.totalRevenue,
      debtToEquity: modules?.financialData?.debtToEquity,
      profitMargins: modules?.financialData?.profitMargins,
      returnOnEquity: modules?.financialData?.returnOnEquity
    }
  }, null, 2);

  const prompt = `You are a senior financial market analyst.

Analyze the stock ${symbol} based on price and volume data of ${period} with interval ${interval} (in yfinance JSON format) and the investment horizon: ${investmentHorizon}.

IMPORTANT: Provide your analysis response in ${language === 'hindi' ? 'Hindi' : language === 'marathi' ? 'Marathi' : 'English'} language. All text fields in the JSON response should be in ${language === 'hindi' ? 'Hindi' : language === 'marathi' ? 'Marathi' : 'English'}.

Your analysis and recommendations must dynamically adapt based on BOTH the investment horizon and the data interval.

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