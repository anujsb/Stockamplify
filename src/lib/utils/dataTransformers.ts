/**
 * Data Transformers
 * Utilities for transforming data between different formats
 */

export interface AnalysisData {
  recommendation: string;
  confidence: number;
  holdingPeriod: string;
  reasoning: string;
  trendAnalysis: {
    overall: string;
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    confidence: number;
  };
  supportResistance: {
    support: string[];
    resistance: string[];
  };
  priceTargets: {
    entryPoint: string;
    exitTarget: string;
    stopLoss: string;
    upside: string;
    downside: string;
  };
  indicators: {
    rsi: string;
    macd: string;
    sma: string;
  };
  riskVolatility: {
    riskLevel: string;
    volatility: string;
    volatilityScore: number;
    suitableFor: string;
  };
  weekRange: {
    currentPrice: string;
    weekHigh: string;
    weekLow: string;
    position: string;
  };
  sentiment: {
    marketSentiment: string;
    sentimentSource: string;
  };
}

export interface AIStockAnalysisResponse {
  symbol: string;
  trendDirection: string;
  trendByTimeframe: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  trendConfidenceScore: number;
  volatility: string;
  volatilityScore: number;
  riskLevel: string;
  supportLevels: string[];
  resistanceLevels: string[];
  targetPrice: {
    upside: string;
    downside: string;
  };
  entryPoint: string;
  stopLoss: string;
  exitTarget: string;
  indicators: {
    RSI: string;
    MACD: string;
    SMA: string;
  };
  recommendation: string;
  confidenceScore: number;
  recommendedHoldingPeriod: string;
  suitableFor: string[];
  marketSentiment: string;
  sentimentSource: string;
  week52Comparison: {
    currentPrice: string;
    week52High: string;
    week52Low: string;
    position: string;
  };
  reasoning: string;
}

/**
 * Transform AI analysis response to frontend format
 * @param apiResponse - Raw API response
 * @returns Transformed data for frontend
 */
export function transformAIResponseToFrontend(apiResponse: AIStockAnalysisResponse): AnalysisData {
  return {
    recommendation: apiResponse.recommendation.toLowerCase(),
    confidence: apiResponse.confidenceScore,
    holdingPeriod: apiResponse.recommendedHoldingPeriod,
    reasoning: apiResponse.reasoning,
    trendAnalysis: {
      overall: apiResponse.trendDirection,
      shortTerm: apiResponse.trendByTimeframe.shortTerm,
      mediumTerm: apiResponse.trendByTimeframe.mediumTerm,
      longTerm: apiResponse.trendByTimeframe.longTerm,
      confidence: apiResponse.trendConfidenceScore,
    },
    supportResistance: {
      support: apiResponse.supportLevels,
      resistance: apiResponse.resistanceLevels,
    },
    priceTargets: {
      entryPoint: apiResponse.entryPoint,
      exitTarget: apiResponse.exitTarget,
      stopLoss: apiResponse.stopLoss,
      upside: apiResponse.targetPrice.upside,
      downside: apiResponse.targetPrice.downside,
    },
    indicators: {
      rsi: apiResponse.indicators.RSI,
      macd: apiResponse.indicators.MACD,
      sma: apiResponse.indicators.SMA,
    },
    riskVolatility: {
      riskLevel: apiResponse.riskLevel,
      volatility: apiResponse.volatility,
      volatilityScore: apiResponse.volatilityScore,
      suitableFor: apiResponse.suitableFor.join(", "),
    },
    weekRange: {
      currentPrice: apiResponse.week52Comparison.currentPrice,
      weekHigh: apiResponse.week52Comparison.week52High,
      weekLow: apiResponse.week52Comparison.week52Low,
      position: apiResponse.week52Comparison.position,
    },
    sentiment: {
      marketSentiment: apiResponse.marketSentiment,
      sentimentSource: apiResponse.sentimentSource,
    },
  };
}

/**
 * Validate stock symbol format for Indian stocks
 * @param symbol - Stock symbol to validate
 * @returns True if valid
 */
export function validateIndianStockSymbol(symbol: string): boolean {
  const symbolPattern = /^[A-Z0-9&-]{1,12}\.(NS|BO)$/;
  return symbolPattern.test(symbol);
}

/**
 * Format stock symbol for display
 * @param symbol - Raw stock symbol
 * @returns Formatted symbol
 */
export function formatStockSymbol(symbol: string): string {
  return symbol.toUpperCase().trim();
}

/**
 * Get recommendation color class
 * @param recommendation - Recommendation string
 * @returns CSS class for recommendation
 */
export function getRecommendationColor(recommendation: string): string {
  switch (recommendation?.toLowerCase()) {
    case "buy":
      return "bg-green-100 text-green-800 border-green-200";
    case "sell":
      return "bg-red-100 text-red-800 border-red-200";
    case "hold":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Get trend icon based on trend direction
 * @param trend - Trend string
 * @returns Icon component or null
 */
export function getTrendIcon(trend: string): "bullish" | "bearish" | "neutral" {
  if (trend?.toLowerCase().includes("bullish")) return "bullish";
  if (trend?.toLowerCase().includes("bearish")) return "bearish";
  return "neutral";
}
