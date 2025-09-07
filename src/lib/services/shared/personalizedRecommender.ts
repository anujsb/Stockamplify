// src/lib/services/shared/personalizedRecommender.ts

export type Action =
  | "strong_buy"
  | "buy"
  | "average_on_dips"
  | "hold"
  | "partial_sell"
  | "sell"
  | "need_attention";

export type Confidence = "low" | "medium" | "high";

export type HoldingInput = {
  symbol: string;

  // User-specific
  buyPrice: number; // user's avg buy
  quantity: number;

  // Real-time
  currentPrice: number; // LTP
  prevClose?: number | null;

  // Optional (pass when available; engine guards missing values)
  lastHourChangePct?: number | null;
  rsi14?: number | null; // 0..100
  volume?: number | null;
  avgVolume3m?: number | null;
  ma50?: number | null;
  ma200?: number | null;
  high52w?: number | null;
  low52w?: number | null;
  analystUpsidePct?: number | null;
  liquidityBucket?: "good" | "average" | "poor" | null;
};

export type HoldingDecision = {
  symbol: string;
  action: Action;
  confidence: Confidence;
  reasons: string[];
  // helpful numeric context for the UI
  pnlPct: number;
  vsMa50Pct?: number;
  vsMa200Pct?: number;
  position52wPct?: number;
  volumeRatio?: number;
  // NEW: risk management hints
  stopLossHintPct?: number;
  trailStopHintPct?: number;
  takeProfitHintPct?: number;
};

const pct = (num?: number | null) => (Number.isFinite(Number(num)) ? Number(num)! : undefined);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function recommendForHolding(h: HoldingInput): HoldingDecision {
  const reasons: string[] = [];
  const buy = Number(h.buyPrice);
  const px = Number(h.currentPrice);
  const prevClose = pct(h.prevClose);
  const lastHour = pct(h.lastHourChangePct);
  const rsi = pct(h.rsi14);
  const vol = pct(h.volume);
  const avgVol = pct(h.avgVolume3m);
  const ma50 = pct(h.ma50);
  const ma200 = pct(h.ma200);
  const hi = pct(h.high52w);
  const lo = pct(h.low52w);
  const analystUpside = pct(h.analystUpsidePct);

  const pnlPct = buy > 0 ? ((px - buy) / buy) * 100 : 0;
  const vsMa50 = ma50 ? ((px - ma50) / ma50) * 100 : undefined;
  const vsMa200 = ma200 ? ((px - ma200) / ma200) * 100 : undefined;
  const position52w = hi && lo && hi > lo ? ((px - lo) / (hi - lo)) * 100 : undefined;
  const sessionDrop = prevClose ? ((px - prevClose) / prevClose) * 100 : undefined;
  const volumeRatio = vol && avgVol && avgVol > 0 ? vol / avgVol : undefined;

  // ---- Immediate “Need attention” rules ----
  if ((sessionDrop ?? 0) <= -10) {
    reasons.push("Down >10% today");
    return {
      symbol: h.symbol,
      action: "need_attention",
      confidence: "high",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      volumeRatio,
      stopLossHintPct: -6,
    };
  }
  if ((lastHour ?? 0) <= -5 && (volumeRatio ?? 1) >= 1.5) {
    reasons.push("Sharp last-hour selloff on high volume");
    return {
      symbol: h.symbol,
      action: "need_attention",
      confidence: "medium",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      volumeRatio,
      stopLossHintPct: -5,
    };
  }

  // ---- Trend & momentum context ----
  if (vsMa200 !== undefined)
    reasons.push(vsMa200 > 0 ? "Above MA200 (long-term uptrend)" : "Below MA200 (long-term weak)");
  if (vsMa50 !== undefined)
    reasons.push(vsMa50 > 0 ? "Above MA50 (short-term uptrend)" : "Below MA50 (short-term weak)");
  if (position52w !== undefined) {
    if (position52w >= 85) reasons.push("Near 52-week high");
    if (position52w <= 15) reasons.push("Near 52-week low");
  }
  if (rsi !== undefined) {
    if (rsi >= 75) reasons.push("RSI overbought");
    if (rsi <= 30) reasons.push("RSI oversold");
  }
  if (volumeRatio !== undefined) {
    if (volumeRatio >= 2) reasons.push("High volume spike");
    else if (volumeRatio >= 1.5) reasons.push("Above-average volume");
    else if (volumeRatio < 0.8) reasons.push("Thin/quiet volume");
  }
  if (h.liquidityBucket === "poor") reasons.push("Illiquid – slippage risk");
  if (analystUpside !== undefined) {
    if (analystUpside > 20) reasons.push("Strong analyst upside");
    else if (analystUpside < -10) reasons.push("Analysts expect downside");
  }

  // ---- Position-aware rules ----
  // 1) Overbought high entry → SELL / PARTIAL_SELL
  if (
    (rsi ?? 0) >= 75 &&
    (position52w ?? 0) >= 85 &&
    (volumeRatio ?? 1) < 1 &&
    (vsMa50 ?? 0) <= 0
  ) {
    if (pnlPct <= 10) {
      reasons.push("Risky entry at highs; fading momentum");
      return {
        symbol: h.symbol,
        action: "sell",
        confidence: "high",
        reasons,
        pnlPct,
        vsMa50Pct: vsMa50,
        vsMa200Pct: vsMa200,
        position52wPct: position52w,
        volumeRatio,
        stopLossHintPct: -5,
      };
    }
    reasons.push("Lock in gains; stretched & weakening");
    return {
      symbol: h.symbol,
      action: "partial_sell",
      confidence: "high",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      volumeRatio,
      takeProfitHintPct: clamp(pnlPct * 0.5, 8, 20),
      trailStopHintPct: -6,
    };
  }

  // 2) Oversold low entry → AVERAGE/BUY
  if ((pnlPct <= -5 || (position52w ?? 100) <= 25) && (rsi ?? 50) <= 35 && (vsMa200 ?? 0) >= -5) {
    reasons.push("Oversold near lows; mean-revert setup");
    return {
      symbol: h.symbol,
      action: pnlPct < -10 ? "average_on_dips" : "buy",
      confidence: "medium",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      volumeRatio,
      stopLossHintPct: -6,
    };
  }

  // 3) Trend-following above MAs → HOLD / PARTIAL_SELL
  if ((vsMa50 ?? -999) > 0 && (vsMa200 ?? -999) > 0 && (rsi ?? 50) <= 70) {
    reasons.push("Uptrend intact");
    if (pnlPct >= 25) {
      reasons.push("Large gain – book partial");
      return {
        symbol: h.symbol,
        action: "partial_sell",
        confidence: "medium",
        reasons,
        pnlPct,
        vsMa50Pct: vsMa50,
        vsMa200Pct: vsMa200,
        position52wPct: position52w,
        trailStopHintPct: -5,
        takeProfitHintPct: 15,
      };
    }
    return {
      symbol: h.symbol,
      action: "hold",
      confidence: "medium",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      trailStopHintPct: -4,
    };
  }

  // 4) Downtrend below MAs → SELL / PARTIAL_SELL
  if ((vsMa200 ?? 0) < 0 && (vsMa50 ?? 0) < 0) {
    reasons.push("Downtrend: below MA50 & MA200");
    return {
      symbol: h.symbol,
      action: pnlPct > 0 ? "partial_sell" : "sell",
      confidence: "medium",
      reasons,
      pnlPct,
      vsMa50Pct: vsMa50,
      vsMa200Pct: vsMa200,
      position52wPct: position52w,
      stopLossHintPct: -5,
    };
  }

  // Default HOLD with hints
  return {
    symbol: h.symbol,
    action: "hold",
    confidence: "low",
    reasons,
    pnlPct,
    vsMa50Pct: vsMa50,
    vsMa200Pct: vsMa200,
    position52wPct: position52w,
    volumeRatio,
    stopLossHintPct: -6,
    takeProfitHintPct: 12,
  };
}

// Batch
export function recommendForPortfolio(rows: HoldingInput[]): HoldingDecision[] {
  return rows.map(recommendForHolding);
}
