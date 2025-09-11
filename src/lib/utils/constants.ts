//src/lib/utils/constants.ts
export const FEATURE_CODES = {
  PORTFOLIO: "PORTFOLIO",
  AI_ANALYSIS: "AI_ANALYSIS",
  MARKET_NEWS: "MARKET_NEWS",
  STOCK_SEARCH: "STOCK_SEARCH",
  AI_PORTFOLIO_ADVISOR: "AI_PORTFOLIO_ADVISOR",
  TRADE_SIGNALS: "TRADE_SIGNALS",
  SMART_MONEY: "SMART_MONEY",
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];
export const FEATURE_CODE_LIST: FeatureCode[] = Object.values(FEATURE_CODES);

// Optional: user friendly metadata that can be used on UI or admin pages
export const FEATURE_META: Record<FeatureCode, { short: string; description: string }> = {
  PORTFOLIO: {
    short: "Portfolio Management",
    description: "Comprehensive portfolio tracking and performance insights",
  },
  AI_ANALYSIS: {
    short: "AI Stock Analytics",
    description: "Advanced AI-driven market analysis and stock insights",
  },
  MARKET_NEWS: {
    short: "Market News",
    description: "Latest financial news and market updates",
  },
  STOCK_SEARCH: {
    short: "Stock Search",
    description: "Advanced stock discovery and exploration tools",
  },

  SMART_MONEY: {
    short: "Smart-Money",
    description: "See your portfolio match with Ace investor and institution",
  },
  AI_PORTFOLIO_ADVISOR: {
    short: "AI Portfolio Advisor",
    description: "AI-based portfolio analysis and rebalance suggestions",
  },
  TRADE_SIGNALS: {
    short: "Trade Signals",
    description: "Momentum & volume spike signals for your portfolio",
  },
};

