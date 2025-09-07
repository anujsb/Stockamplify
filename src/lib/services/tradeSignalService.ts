// src/lib/services/tradeSignalService.ts
import {
  Candle,
  computeAnalystBlock,
  computeATR,
  computeLiquidityMetrics,
  computeRelativeStrength,
  computeRSI,
  detectGapAndSpike,
} from "@/lib/services/shared/analytics";

export function GetTradeSignalsData(portfolio: any[]) {
  const movingAverageData: Array<{
    symbol: string;
    currentPrice: number;
    ma50: number;
    ma200: number;
    ma50Signal: "Bullish" | "Bearish" | string;
    ma200Signal: "Bullish" | "Bearish" | string;
    goldenCross: boolean;
    priceVsMa50: number;
    priceVsMa200: number;
  }> = [];

  const volumeAnalysisData: Array<{
    symbol: string;
    currentVolume: number;
    avgVolume: number;
    volumeRatio: number;
    activity: string;
    signal: string;
    level: "high_spike" | "elevated" | "normal_plus" | "below_avg";
    returnPct: number;
  }> = [];

  const weekRangeData: Array<{
    symbol: string;
    current: number;
    high: number;
    low: number;
    position: number; // % within 52w range [0..100]
    range: number;
    signal: "Near High" | "Near Low" | "Mid Range";
    momentum: "Strong" | "Moderate" | "Weak";
  }> = [];

  const analystTargetData: Array<{
    symbol: string;
    currentPrice: number;
    targetHigh: number | null;
    targetLow: number | null;
    upside: number | null;
    recommendation: string | null;
    recommendationNorm: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell" | "none" | "unknown";
    analysts: number;
  }> = [];

  // Optional: extra indicators if UI wants to show them
  const extraIndicators: Array<{
    symbol: string;
    rsi14: number | null;
    atr14: number | null;
    rsRatio: number | null;
    rsSlopePct: number | null;
    liquidity: { dollarVolume: number; bucket: "poor" | "ok" | "good" | "excellent" };
    gaps: { gapUpPct: number | null; gapDownPct: number | null; volumeSpike: boolean };
  }> = [];

  // Build datasets per stock
  portfolio.forEach((item: any) => {
    const symbol: string = item.stock?.symbol || "N/A";
    const currentPrice = getCurrentPrice(item);

    // ----- Moving Average Data -----
    if (item.intradayPrice) {
      const ma50 = Number(item.intradayPrice.fiftyDayMovingAverage || currentPrice);
      const ma200 = Number(item.intradayPrice.twoHundredDayMovingAverage || currentPrice);

      movingAverageData.push({
        symbol,
        currentPrice,
        ma50,
        ma200,
        ma50Signal: currentPrice > ma50 ? "Bullish" : "Bearish",
        ma200Signal: currentPrice > ma200 ? "Bullish" : "Bearish",
        goldenCross: ma50 > ma200,
        priceVsMa50: ma50 !== 0 ? ((currentPrice - ma50) / ma50) * 100 : 0,
        priceVsMa200: ma200 !== 0 ? ((currentPrice - ma200) / ma200) * 100 : 0,
      });
    }

    // ----- Volume Analysis Data -----
    if (
      item.realTimePrice?.volume != null &&
      item.intradayPrice?.averageDailyVolume3Month != null
    ) {
      const currentVolume = Number(item.realTimePrice.volume) || 0;
      const avgVolume = Number(item.intradayPrice.averageDailyVolume3Month) || 0;

      if (avgVolume > 0) {
        const volumeRatio = currentVolume / avgVolume;

        const invested = Number(item.buyPrice) * Number(item.quantity || 0);
        const lastPrice = Number(item.realTimePrice?.price ?? item.buyPrice);
        const currentValue = lastPrice * Number(item.quantity || 0);
        const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;

        const level =
          volumeRatio >= 2
            ? "high_spike"
            : volumeRatio >= 1.5
              ? "elevated"
              : volumeRatio >= 1.0
                ? "normal_plus"
                : "below_avg";

        const activity =
          volumeRatio >= 2
            ? "High"
            : volumeRatio >= 1.5
              ? "Above Average"
              : volumeRatio >= 1.0
                ? "Normal"
                : "Low";

        const signal =
          volumeRatio >= 2 && returnPct > 0
            ? "Strong Buy Signal"
            : volumeRatio >= 2 && returnPct < 0
              ? "Strong Sell Signal"
              : "Normal";

        volumeAnalysisData.push({
          symbol,
          currentVolume,
          avgVolume,
          volumeRatio,
          activity,
          signal,
          level,
          returnPct,
        });
      }
    }

    // ----- 52-Week Range Data -----
    const high = Number(item.intradayPrice?.fiftyTwoWeekHigh || currentPrice * 1.2);
    const low = Number(item.intradayPrice?.fiftyTwoWeekLow || currentPrice * 0.8);
    const position = high > low ? ((currentPrice - low) / (high - low)) * 100 : 50;

    weekRangeData.push({
      symbol,
      current: currentPrice,
      high,
      low,
      position,
      range: high - low,
      signal: position > 80 ? "Near High" : position < 20 ? "Near Low" : "Mid Range",
      momentum: position > 70 ? "Strong" : position > 30 ? "Moderate" : "Weak",
    });

    // ----- Analyst Targets & Upside (shared analytics) -----
    if (item.analystRating?.targetPriceHigh != null || item.analystRating?.recommendation != null) {
      const block = computeAnalystBlock({
        symbol,
        currentPrice,
        targetPriceHigh: item.analystRating?.targetPriceHigh,
        targetPriceLow: item.analystRating?.targetLowPrice ?? currentPrice * 0.8,
        recommendation: item.analystRating?.recommendation,
        numberOfAnalysts: item.analystRating?.numberOfAnalysts,
      });
      analystTargetData.push(block);
    }

    // ----- Optional: extra indicators (RSI/ATR/RS/Liquidity/Gap) -----
    // These require historical arrays if you have them. If not, this gracefully returns nulls.
    const closes: number[] = Array.isArray(item.history?.closes) ? item.history.closes : [];
    const candles: Candle[] = Array.isArray(item.history?.candles)
      ? (item.history.candles as Candle[])
      : [];
    const benchmarkCloses: number[] = Array.isArray(item.benchmark?.closes)
      ? item.benchmark.closes
      : [];

    const rsi14 = computeRSI(closes, 14);
    const atr14 = computeATR(candles, 14);
    const { rsRatio, rsSlopePct } = computeRelativeStrength(closes, benchmarkCloses, 60);

    const liquidity = computeLiquidityMetrics({
      avgDailyVolume: Number(item.intradayPrice?.averageDailyVolume3Month ?? 0),
      price: currentPrice,
    });

    const gaps = detectGapAndSpike({
      todayOpen: Number(item.intradayPrice?.open ?? null),
      prevClose: Number(item.intradayPrice?.previousClose ?? null),
      todayVolume: Number(item.realTimePrice?.volume ?? null),
      avg3mVolume: Number(item.intradayPrice?.averageDailyVolume3Month ?? null),
    });

    extraIndicators.push({
      symbol,
      rsi14,
      atr14,
      rsRatio,
      rsSlopePct,
      liquidity,
      gaps,
    });
  });

  // Sort volume spikes: biggest first (ratio, then absolute volume)
  volumeAnalysisData.sort((a, b) => {
    const r = (b.volumeRatio || 0) - (a.volumeRatio || 0);
    if (r !== 0) return r;
    return (b.currentVolume || 0) - (a.currentVolume || 0);
  });

  const TOP_N_VOLUME = 6;
  const volumeAnalysisTop = volumeAnalysisData.slice(0, TOP_N_VOLUME);

  // Build PnL map for recommendations
  const pnlBySymbol = portfolio.reduce((acc: Record<string, number>, it: any) => {
    const sym = it.stock?.symbol;
    if (!sym) return acc;
    const invested = Number(it.buyPrice) * Number(it.quantity || 0);
    const curVal = Number(it.realTimePrice?.price ?? it.buyPrice) * Number(it.quantity || 0);
    acc[sym] = invested > 0 ? ((curVal - invested) / invested) * 100 : 0;
    return acc;
  }, {});

  return {
    movingAverageData,
    volumeAnalysisData,
    volumeAnalysisTop,
    weekRangeData,
    analystTargetData,
    extraIndicators,
  };
}

// helper (same as before)
function getCurrentPrice(item: any) {
  return Number(item.realTimePrice?.price || item.buyPrice);
}
