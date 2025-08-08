/**
 * AI Prompt Builder
 * Constructs prompts for Gemini AI based on stock data and analysis requirements
 */

import { YahooChartData } from '@/lib/services/chartService';
import { getHorizonConfig } from './investmentHorizons';

export interface AnalysisData {
  symbol: string;
  chart: YahooChartData | null;
  investmentHorizon: string;
  interval: string;
  period: string;
  language?: string;
}


/**
 * Build comprehensive AI prompt for stock analysis
 * @param data - Analysis data
 * @returns Formatted prompt string
 */
export function buildAnalysisPrompt(data: AnalysisData): string {
  const { symbol, chart, investmentHorizon, interval, period, language = 'english' } = data;

   if (!chart || !chart.meta || !Array.isArray(chart.quotes) || chart.quotes.length === 0) {
    return 'Chart data is missing or incomplete.';
  }

  const meta = chart.meta;
  const quotes = chart.quotes;

  const jsonData = JSON.stringify({
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    historicalQuotes: quotes.map(q => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume
    }))
  }, null, 2);

  const prompt = `You are a senior financial market analyst with expertise in technical analysis.

  **ANALYSIS TASK:**
  Analyze the stock ${symbol} based on price and volume data of ${getPeriodDescription(period)} with interval ${interval} (in yfinance JSON format) and the investment horizon: ${investmentHorizon}.

  Your analysis and recommendations must dynamically adapt based on BOTH the investment horizon and the data interval. Translate result in ${language} language.

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
    //console.log(prompt);
    return prompt;
} 

export function getPeriodDescription(period: string): string {
  const periodMap: Record<string, string> = {
    '1d': '1 day',
    '5d': '5 days',
    '1mo': '1 month',
    '3mo': '3 months',
    '6mo': '6 months',
    '1y': '1 year',
    '2y': '2 years',
    '5y': '5 years',
    '10y': '10 years',
    'ytd': 'Year-to-date',
    'max': 'Maximum available'
  };

  return periodMap[period] || `${period}`;
}
