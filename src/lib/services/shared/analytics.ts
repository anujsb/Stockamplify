// src/lib/services/shared/analytics.ts

export type AnalystBlock = {
  symbol: string;
  currentPrice: number;
  targetHigh: number | null;
  targetLow: number | null;
  upside: number | null; // in %
  recommendation: string | null; // raw
  recommendationNorm: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell" | "none" | "unknown";
  analysts: number;
};

export function normalizeRecommendation(rec?: string): AnalystBlock["recommendationNorm"] {
  const r = String(rec ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (["strong_buy", "buy", "hold", "sell", "strong_sell", "none"].includes(r)) return r as any;
  // handle common variants
  if (r === "overweight") return "buy";
  if (r === "underweight") return "sell";
  if (r === "neutral") return "hold";
  return "unknown";
}

/**
 * Builds a hardened analyst insight block. Safe if some fields are missing.
 */
export function computeAnalystBlock(opts: {
  symbol: string;
  currentPrice: number;
  targetPriceHigh?: number | null;
  targetPriceLow?: number | null;
  recommendation?: string | null;
  numberOfAnalysts?: number | null;
}): AnalystBlock {
  const { symbol, currentPrice } = opts;
  const th = numOrNull(opts.targetPriceHigh);
  const tl = numOrNull(opts.targetPriceLow);
  const up = numOrNull(
    th != null && isFinite(currentPrice) && currentPrice > 0
      ? ((th - currentPrice) / currentPrice) * 100
      : null
  );

  return {
    symbol,
    currentPrice,
    targetHigh: th,
    targetLow: tl,
    upside: up,
    recommendation: opts.recommendation ?? null,
    recommendationNorm: normalizeRecommendation(opts.recommendation ?? undefined),
    analysts: Number(opts.numberOfAnalysts ?? 0),
  };
}

function numOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------------------- RSI(14) ----------------------
/**
 * Compute RSI. `closes` should be newest last. Returns `null` if insufficient data.
 */
export function computeRSI(closes: number[], period = 14): number | null {
  if (!Array.isArray(closes) || closes.length < period + 1) return null;
  let gains = 0,
    losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const chg = closes[i] - closes[i - 1];
    if (chg > 0) gains += chg;
    else losses -= chg; // losses accumulate positive
  }
  if (gains === 0 && losses === 0) return 50;
  const rs = gains / period / Math.max(1e-9, losses / period);
  const rsi = 100 - 100 / (1 + rs);
  return Number.isFinite(rsi) ? +rsi.toFixed(2) : null;
}

// ---------------------- ATR(14) ----------------------
export type Candle = { high: number; low: number; close: number };
/**
 * Wilder's ATR. `candles` newest last. Needs >= period+1 candles.
 */
export function computeATR(candles: Candle[], period = 14): number | null {
  if (!Array.isArray(candles) || candles.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high,
      l = candles[i].low,
      pc = candles[i - 1].close;
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  // Wilder smoothing (first ATR is simple avg of first `period` TRs)
  let atr = average(trs.slice(0, period));
  if (!Number.isFinite(atr)) return null;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return +atr.toFixed(4);
}

function average(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ----------------- Relative Strength vs Benchmark -----------------
/**
 * Simple RS slope proxy: % change stock / % change benchmark over lookback.
 * Returns {rsRatio, rsSlopePct}. Newest last arrays.
 */
export function computeRelativeStrength(
  stockCloses: number[],
  benchmarkCloses: number[],
  lookback = 60
): { rsRatio: number | null; rsSlopePct: number | null } {
  if (stockCloses.length < lookback + 1 || benchmarkCloses.length < lookback + 1)
    return { rsRatio: null, rsSlopePct: null };

  const s0 = stockCloses[stockCloses.length - lookback - 1];
  const s1 = stockCloses[stockCloses.length - 1];
  const b0 = benchmarkCloses[benchmarkCloses.length - lookback - 1];
  const b1 = benchmarkCloses[benchmarkCloses.length - 1];

  if (s0 <= 0 || b0 <= 0) return { rsRatio: null, rsSlopePct: null };

  const stockPct = (s1 - s0) / s0;
  const benchPct = (b1 - b0) / b0;
  const rsRatio = benchPct !== 0 ? stockPct / benchPct : null;
  const rsSlopePct = rsRatio != null ? (rsRatio - 1) * 100 : null;

  return {
    rsRatio: rsRatio != null && isFinite(rsRatio) ? +rsRatio.toFixed(3) : null,
    rsSlopePct: rsSlopePct != null && isFinite(rsSlopePct) ? +rsSlopePct.toFixed(2) : null,
  };
}

// ----------------------- Liquidity -----------------------
export function computeLiquidityMetrics(opts: {
  avgDailyVolume: number | null; // shares
  price: number | null; // last price
}) {
  const vol = numOrNull(opts.avgDailyVolume) ?? 0;
  const price = numOrNull(opts.price) ?? 0;
  const dollar = vol * price; // $ volume
  let bucket: "poor" | "ok" | "good" | "excellent" = "poor";
  if (dollar >= 5_000_000) bucket = "ok";
  if (dollar >= 20_000_000) bucket = "good";
  if (dollar >= 100_000_000) bucket = "excellent";
  return { dollarVolume: Math.round(dollar), bucket };
}

// -------------------- Gap / News flags --------------------
/**
 * Gap up/down vs prior close and volume spike vs 3M avg.
 */
export function detectGapAndSpike(opts: {
  todayOpen?: number | null;
  prevClose?: number | null;
  todayVolume?: number | null;
  avg3mVolume?: number | null;
  spikeThreshold?: number; // default 1.5x
}) {
  const open = numOrNull(opts.todayOpen);
  const pc = numOrNull(opts.prevClose);
  const vol = numOrNull(opts.todayVolume);
  const avg = numOrNull(opts.avg3mVolume);
  const thr = opts.spikeThreshold ?? 1.5;
  const out = {
    gapUpPct: null as number | null,
    gapDownPct: null as number | null,
    volumeSpike: false,
  };

  if (open != null && pc != null && pc > 0) {
    const gapPct = ((open - pc) / pc) * 100;
    if (gapPct >= 0) out.gapUpPct = +gapPct.toFixed(2);
    else out.gapDownPct = +gapPct.toFixed(2);
  }
  if (avg != null && avg > 0 && vol != null) {
    out.volumeSpike = vol / avg >= thr;
  }
  return out;
}
