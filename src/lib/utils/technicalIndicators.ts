/**
 * Technical Indicators Utility Functions
 * Provides calculations for common technical analysis indicators
 */

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  macd: number | null;
  sma20: number | null;
  sma50: number | null;
  supportLevels: number[];
  resistanceLevels: number[];
}

/**
 * Calculate RSI (Relative Strength Index)
 * @param prices - Array of closing prices
 * @param period - RSI period (default: 14)
 * @returns RSI value or null if insufficient data
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param prices - Array of closing prices
 * @param period - EMA period
 * @returns EMA value
 */
export function calculateEMA(prices: number[], period: number): number {
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param prices - Array of closing prices
 * @returns MACD value or null if insufficient data
 */
export function calculateMACD(prices: number[]): number | null {
  if (prices.length < 26) return null;
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  return ema12 - ema26;
}

/**
 * Calculate Simple Moving Average
 * @param prices - Array of closing prices
 * @param period - SMA period
 * @returns SMA value or null if insufficient data
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((sum, price) => sum + price, 0) / period;
}

/**
 * Find support and resistance levels
 * @param prices - Array of closing prices
 * @param currentPrice - Current stock price
 * @returns Object with support and resistance levels
 */
export function findSupportResistance(prices: number[], currentPrice: number): {
  supportLevels: number[];
  resistanceLevels: number[];
} {
  if (prices.length < 20) {
    return { supportLevels: [], resistanceLevels: [] };
  }
  
  const recentPrices = prices.slice(-20);
  const min = Math.min(...recentPrices);
  const max = Math.max(...recentPrices);
  
  // Simple support and resistance calculation
  const support1 = min * 0.98;
  const support2 = min * 0.95;
  const resistance1 = max * 1.02;
  const resistance2 = max * 1.05;
  
  return {
    supportLevels: [support1, support2].filter(level => level < currentPrice),
    resistanceLevels: [resistance1, resistance2].filter(level => level > currentPrice)
  };
}

/**
 * Calculate all technical indicators for a given price data
 * @param priceData - Array of price data points
 * @param currentPrice - Current stock price
 * @returns Object with all technical indicators
 */
export function calculateAllIndicators(priceData: PriceData[], currentPrice: number): TechnicalIndicators {
  const prices = priceData.map(p => p.close);
  
  return {
    rsi: calculateRSI(prices, 14),
    macd: calculateMACD(prices),
    sma20: calculateSMA(prices, 20),
    sma50: calculateSMA(prices, 50),
    ...findSupportResistance(prices, currentPrice)
  };
}

/**
 * Get RSI interpretation
 * @param rsi - RSI value
 * @returns RSI interpretation string
 */
export function getRSIInterpretation(rsi: number | null): string {
  if (rsi === null) return 'Insufficient data';
  if (rsi > 70) return `Overbought (${rsi.toFixed(1)})`;
  if (rsi < 30) return `Oversold (${rsi.toFixed(1)})`;
  return `Neutral (${rsi.toFixed(1)})`;
}

/**
 * Get MACD interpretation
 * @param macd - MACD value
 * @returns MACD interpretation string
 */
export function getMACDInterpretation(macd: number | null): string {
  if (macd === null) return 'Insufficient data';
  if (macd > 0) return 'Bullish momentum';
  if (macd < 0) return 'Bearish momentum';
  return 'Neutral';
}

/**
 * Get SMA interpretation
 * @param sma20 - 20-day SMA
 * @param sma50 - 50-day SMA
 * @param currentPrice - Current price
 * @returns SMA interpretation string
 */
export function getSMAInterpretation(sma20: number | null, sma50: number | null, currentPrice: number): string {
  if (sma20 === null || sma50 === null) return 'Insufficient data';
  
  if (currentPrice > sma20 && currentPrice > sma50) return 'Above both SMAs (Bullish)';
  if (currentPrice < sma20 && currentPrice < sma50) return 'Below both SMAs (Bearish)';
  if (currentPrice > sma20 && currentPrice < sma50) return 'Above 20-day, below 50-day SMA';
  return 'Below 20-day, above 50-day SMA';
} 