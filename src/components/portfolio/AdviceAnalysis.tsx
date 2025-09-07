"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  recommendForHolding,
  type Action,
  type HoldingInput,
} from "@/lib/services/shared/personalizedRecommender";
import { formatPrice } from "@/lib/utils/stockUtils";
import {
  AlertTriangle,
  ArrowDownRight,
  CheckCircle2,
  PauseCircle,
  Scissors,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import React, { useMemo } from "react";

const toNum = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const fmtPct = (v?: number) =>
  typeof v === "number" && Number.isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%` : "—";

// ACTION style map (bg/text/ring + icon)
const ACTION_STYLES: Record<
  Action,
  { bg: string; text: string; ring: string; icon: React.ReactNode }
> = {
  need_attention: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-1 ring-red-200",
    icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
  },
  sell: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-1 ring-red-200",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
  },
  partial_sell: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-1 ring-teal-200",
    icon: <Scissors className="h-4 w-4 text-orange-600" />,
  },
  hold: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-1 ring-slate-200",
    icon: <PauseCircle className="h-4 w-4 text-slate-600" />,
  },
  buy: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-1 ring-green-200",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  },
  strong_buy: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-1 ring-emerald-200",
    icon: <Sparkles className="h-4 w-4 text-emerald-600" />,
  },
  average_on_dips: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-1 ring-blue-200",
    icon: <ArrowDownRight className="h-4 w-4 text-blue-600" />,
  },
};

// Confidence color map
const CONF_STYLES: Record<"low" | "medium" | "high", { ring: string; text: string; bg: string }> = {
  low: { ring: "ring-slate-200", text: "text-slate-700", bg: "bg-slate-50" },
  medium: { ring: "ring-amber-200", text: "text-amber-800", bg: "bg-amber-50" },
  high: { ring: "ring-emerald-200", text: "text-emerald-800", bg: "bg-emerald-50" },
};

const chip = (label: string) => (
  <span
    key={label}
    className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] text-gray-700 bg-gray-50"
  >
    {label}
  </span>
);

const ActionAnalysis = ({ item }: { item: any }) => {
  if (!item) return null;

  const avgBuy = toNum(item?.buyPrice ?? item?.avgBuyPrice, 0);
  const ltp = toNum(item?.realTimePrice?.price ?? item?.currentPrice, 0);
  const qty = toNum(item?.quantity, 0);
  const symbol = item?.stock?.symbol ?? "";

  const decision = useMemo(() => {
    const analystUpsidePct =
      item?.analystRating?.targetPriceHigh && ltp > 0
        ? ((toNum(item.analystRating.targetPriceHigh) - ltp) / ltp) * 100
        : null;

    const input: HoldingInput = {
      symbol,
      buyPrice: avgBuy,
      quantity: qty,
      currentPrice: ltp,
      prevClose:
        item?.intradayPrice?.previousClose != null ? toNum(item.intradayPrice.previousClose) : null,
      volume: item?.realTimePrice?.volume != null ? toNum(item.realTimePrice.volume) : null,
      avgVolume3m:
        item?.intradayPrice?.averageDailyVolume3Month != null
          ? toNum(item.intradayPrice.averageDailyVolume3Month)
          : null,
      ma50:
        item?.intradayPrice?.fiftyDayMovingAverage != null
          ? toNum(item.intradayPrice.fiftyDayMovingAverage)
          : null,
      ma200:
        item?.intradayPrice?.twoHundredDayMovingAverage != null
          ? toNum(item.intradayPrice.twoHundredDayMovingAverage)
          : null,
      high52w:
        item?.intradayPrice?.fiftyTwoWeekHigh != null
          ? toNum(item.intradayPrice.fiftyTwoWeekHigh)
          : null,
      low52w:
        item?.intradayPrice?.fiftyTwoWeekLow != null
          ? toNum(item.intradayPrice.fiftyTwoWeekLow)
          : null,
      analystUpsidePct,
    };

    return recommendForHolding(input);
  }, [item, avgBuy, ltp, qty, symbol]);

  const actionLabel = decision.action.replace(/_/g, " ").toUpperCase();
  const a = ACTION_STYLES[decision.action];
  const c = CONF_STYLES[decision.confidence];

  const ctx = [
    decision.pnlPct !== undefined ? `PnL ${fmtPct(decision.pnlPct)}` : null,
    decision.vsMa50Pct !== undefined ? `vs MA50 ${fmtPct(decision.vsMa50Pct)}` : null,
    decision.vsMa200Pct !== undefined ? `vs MA200 ${fmtPct(decision.vsMa200Pct)}` : null,
    decision.position52wPct !== undefined
      ? `52W Pos ${(decision.position52wPct ?? 0).toFixed(0)}%`
      : null,
    decision.volumeRatio !== undefined ? `Vol ${(decision.volumeRatio ?? 0).toFixed(2)}x` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="hover:shadow-sm transition-shadow border-l-4 border-l-emerald-500">
        <CardContent className="pt-0">
          {/* Row 1 — Suggested action banner + position + context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Suggested Action (color semantic) */}
            <div className={`rounded-lg p-3 ${a.bg} ${a.ring}`}>
              <div className="text-[11px] text-gray-600 mb-1">Suggested Action</div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-semibold ${a.text}`}>
                  {a.icon}
                  <span className="text-sm">{actionLabel}</span>
                </div>
                {decision.action === "partial_sell" && (
                  <span className="text-[10px] font-normal opacity-80">Book profit</span>
                )}
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ring ${c.ring} ${c.bg} ${c.text} capitalize`}
                >
                  {decision.confidence} confidence.
                </span>
              </div>
            </div>

            {/* Your Position */}
            <div className="rounded-lg p-3 bg-blue-50 ring-1 ring-blue-200">
              <div className="text-[11px] text-gray-600 mb-1">Your Position</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-[11px] text-gray-500">Avg Buy</div>
                  <div className="font-semibold">{formatPrice(avgBuy)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">LTP</div>
                  <div className="font-semibold">{formatPrice(ltp)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Qty</div>
                  <div className="font-semibold">{qty}</div>
                </div>
              </div>
            </div>

            {/* Context */}
            <div className="rounded-lg p-3 bg-violet-50 ring-1 ring-violet-200">
              <div className="text-[11px] text-gray-600 mb-1">Context</div>
              <div className="flex flex-wrap gap-1">
                {ctx.length ? (
                  ctx.map((x) => chip(x))
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 — Execution plan with emphatic numbers */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                Stop Loss
              </div>
              <div className="mt-1 text-xs text-gray-600">Set around</div>
              <div className="text-xl font-bold tracking-tight">
                {decision.stopLossHintPct != null ? fmtPct(decision.stopLossHintPct) : "—"}
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Trailing Stop
              </div>
              <div className="mt-1 text-xs text-gray-600">Trail by</div>
              <div className="text-xl font-bold tracking-tight">
                {decision.trailStopHintPct != null ? fmtPct(decision.trailStopHintPct) : "—"}
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingDown className="h-4 w-4 text-yellow-600" />
                Take Profit
              </div>
              <div className="mt-1 text-xs text-gray-600">Target about</div>
              <div className="text-xl font-bold tracking-tight">
                {decision.takeProfitHintPct != null ? fmtPct(decision.takeProfitHintPct) : "—"}
              </div>
            </div>
          </div>

          {/* Row 3 — Reasons */}
          <div className="mt-4">
            <div className="text-sm font-semibold mb-1.5">Why this action?</div>
            {decision.reasons?.length ? (
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                {decision.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No specific reasons available.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionAnalysis;
