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
  const { symbol, quote, modules, historical, investmentHorizon, interval, period } = data;
  const horizonConfig = getHorizonConfig(investmentHorizon);
  const technical = calculateTechnicalAnalysis(data);

  const prompt = `
You are a senior financial market analyst specializing in Indian stock markets.

Analyze the stock ${symbol} based on the following data and investment horizon: ${horizonConfig.name} (${horizonConfig.description}).

STOCK DATA:
- Symbol: ${symbol}
- Current Price: ₹${technical.currentPrice?.toFixed(2) || 'N/A'}
- Previous Close: ₹${technical.previousClose?.toFixed(2) || 'N/A'}
- Price Change: ₹${technical.priceChange?.toFixed(2) || 'N/A'} (${technical.priceChangePercent?.toFixed(2) || 'N/A'}%)
- 52-Week High: ₹${quote?.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
- 52-Week Low: ₹${quote?.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}
- Market Cap: ₹${quote?.marketCap ? (quote.marketCap / 10000000).toFixed(2) + ' Cr' : 'N/A'}
- Volume: ${quote?.regularMarketVolume?.toLocaleString() || 'N/A'}

TECHNICAL INDICATORS:
- SMA 20: ₹${technical.sma20?.toFixed(2) || 'N/A'}
- SMA 50: ₹${technical.sma50?.toFixed(2) || 'N/A'}
- RSI (14): ${technical.rsi?.toFixed(2) || 'N/A'} - ${getRSIInterpretation(technical.rsi)}
- MACD: ${technical.macd?.toFixed(4) || 'N/A'} - ${getMACDInterpretation(technical.macd)}
- SMA Analysis: ${getSMAInterpretation(technical.sma20, technical.sma50, technical.currentPrice)}
- Support Levels: ${technical.supportLevels.map(level => '₹' + level.toFixed(2)).join(', ')}
- Resistance Levels: ${technical.resistanceLevels.map(level => '₹' + level.toFixed(2)).join(', ')}

FUNDAMENTAL DATA:
- Sector: ${modules?.summaryProfile?.sector || 'N/A'}
- Industry: ${modules?.summaryProfile?.industry || 'N/A'}
- P/E Ratio: ${quote?.trailingPE?.toFixed(2) || 'N/A'}
- Forward P/E: ${quote?.forwardPE?.toFixed(2) || 'N/A'}
- Price-to-Book: ${quote?.priceToBook?.toFixed(2) || 'N/A'}
- EPS TTM: ₹${quote?.epsTrailingTwelveMonths?.toFixed(2) || 'N/A'}

FINANCIAL METRICS:
- Total Revenue: ₹${modules?.financialData?.totalRevenue ? (modules.financialData.totalRevenue / 10000000).toFixed(2) + ' Cr' : 'N/A'}
- Debt-to-Equity: ${modules?.financialData?.debtToEquity?.toFixed(2) || 'N/A'}
- Profit Margin: ${modules?.financialData?.profitMargins ? (modules.financialData.profitMargins * 100).toFixed(2) + '%' : 'N/A'}
- ROE: ${modules?.financialData?.returnOnEquity ? (modules.financialData.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}

ANALYSIS PARAMETERS:
- Investment Horizon: ${horizonConfig.name} (${horizonConfig.description})
- Focus: ${horizonConfig.focus}
- Typical Holding Period: ${horizonConfig.typicalHoldingPeriod}
- Data Interval: ${interval}
- Data Period: ${period}
- Historical Data Points: ${historical.length}

INVESTMENT HORIZON GUIDELINES:
- Scalping (Minutes to Hours): Focus on micro-trends, immediate momentum, tight stop-loss
- Intraday (Same Day): Focus on same-day momentum shifts and volume bursts
- Swing-Short (1-5 Days): Combine intraday + daily moves for quick momentum
- Swing-Medium (1-4 Weeks): Focus on daily candles and medium-term trends
- Positional (1-6 Months): Emphasize trend continuation and larger reversals
- Long-term (6-12 Months): Focus on major support/resistance and macro trends

Return ONLY a valid JSON response in this exact format:

{
  "symbol": "${symbol}",
  "trendDirection": "Bullish/Bearish/Sideways",
  "trendByTimeframe": {
    "shortTerm": "1-5 days outlook",
    "mediumTerm": "1-3 weeks outlook", 
    "longTerm": "1-6 months outlook"
  },
  "trendConfidenceScore": 0-100,
  "volatility": "Low/Medium/High/Increasing/Decreasing",
  "volatilityScore": 0-100,
  "riskLevel": "Low/Medium/High",
  "supportLevels": ["₹value", "₹value"],
  "resistanceLevels": ["₹value", "₹value"],
  "targetPrice": {
    "upside": "₹value",
    "downside": "₹value"
  },
  "entryPoint": "₹value",
  "stopLoss": "₹value",
  "exitTarget": "₹value",
  "indicators": {
    "RSI": "description (value)",
    "MACD": "description",
    "SMA": "description"
  },
  "recommendation": "Buy/Sell/Hold",
  "confidenceScore": 0-100,
  "recommendedHoldingPeriod": "e.g., Intraday, 1-2 weeks, 1-3 months",
  "suitableFor": ["Short-term Traders", "Long-term Investors"],
  "marketSentiment": "Bullish/Bearish/Neutral",
  "sentimentSource": "Brief explanation based on price action and data",
  "week52Comparison": {
    "currentPrice": "₹${technical.currentPrice?.toFixed(2) || 'N/A'}",
    "week52High": "₹${quote?.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}",
    "week52Low": "₹${quote?.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}",
    "position": "Near High/Near Low/Mid Range"
  },
  "reasoning": "1-3 sentences justifying the recommendation"
}

IMPORTANT:
- Base analysis strictly on provided data
- Adapt analysis to investment horizon: ${horizonConfig.focus}
- Provide realistic confidence scores
- Use ₹ symbol for all price values
- Keep reasoning concise and actionable
- Return only valid JSON, no markdown or explanations
- Consider the typical holding period: ${horizonConfig.typicalHoldingPeriod}
- Focus on ${horizonConfig.focus}`;

  return prompt;
} 