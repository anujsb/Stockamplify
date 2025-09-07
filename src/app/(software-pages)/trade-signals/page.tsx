// src/app/trade-signals/page.tsx
"use client";

import SideBar from "@/components/SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealTimePortfolio } from "@/lib/hooks/useRealTimePortfolio";
import { cn } from "@/lib/utils";
import { formatPrice, formatSymbol } from "@/lib/utils/stockUtils";
import { Activity, BarChart3, RefreshCw, Target } from "lucide-react";
import { useEffect, useState } from "react";

// ---- Minimal types for metrics items (keeps UI the same) ----
type VolumeAnalysisItem = {
  symbol: string;
  currentVolume: number;
  avgVolume: number;
  volumeRatio: number;
  activity: string;
};

type WeekRangeItem = {
  symbol: string;
  current: number;
  high: number;
  low: number;
  position: number;
  range: number;
  signal: string;
  momentum: string;
};

type MovingAverageItem = {
  symbol: string;
  currentPrice: number;
  ma50: number;
  ma200: number;
  ma50Signal: "Bullish" | "Bearish" | string;
  ma200Signal?: string;
  goldenCross: boolean;
  priceVsMa50: number;
  priceVsMa200: number;
};

type TradeSignalsMetrics = {
  volumeAnalysisData: VolumeAnalysisItem[];
  volumeAnalysisTop: VolumeAnalysisItem[]; // optional top N subset
  weekRangeData: WeekRangeItem[];
  movingAverageData: MovingAverageItem[];
};

const TradeSignalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TradeSignalsMetrics | null>(null);

  const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1) Initial portfolio fetch from your existing /api/portfolio
  useEffect(() => {
    const fetchInitialPortfolio = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch("/api/portfolio");
        const data = await res.json();
        if (data?.success) {
          setInitialPortfolio(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch initial portfolio:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialPortfolio();
  }, [refreshKey]);

  // 2) Live portfolio hook
  const { portfolio, isLoading, refreshPortfolio } = useRealTimePortfolio(initialPortfolio);

  // 3) Fetch trade signals for the current portfolio
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!Array.isArray(portfolio)) return;
      setLoading(true);
      try {
        const res = await fetch("/api/trade-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolio }),
        });
        const json = await res.json();
        if (json?.success) {
          setMetrics(json.data as TradeSignalsMetrics);
        } else {
          console.error("Trade signals error:", json?.error || "Unknown error");
          setMetrics(null);
        }
      } catch (err) {
        console.error("Error fetching trade signals:", err);
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [portfolio]);

  if (initialLoading || isLoading || loading || !metrics) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
        <SideBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading Trade Signals...</p>
          </div>
        </div>
      </div>
    );
  }

  // Strongly typed fallbacks so .map/.slice don’t infer 'any'
  const volumeAnalysisData: VolumeAnalysisItem[] = Array.isArray(metrics.volumeAnalysisData)
    ? metrics.volumeAnalysisData
    : [];
  const weekRangeData: WeekRangeItem[] = Array.isArray(metrics.weekRangeData)
    ? metrics.weekRangeData
    : [];
  const movingAverageData: MovingAverageItem[] = Array.isArray(metrics.movingAverageData)
    ? metrics.movingAverageData
    : [];

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
        "min-h-screen"
      )}
    >
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Trade Signals</h1>
            <p className="text-slate-600 mt-1">Real-time insights for technical traders</p>
          </div>
          <button
            onClick={() => {
              // refresh both portfolio source and signals
              refreshPortfolio();
              setRefreshKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Volume vs Price Analysis & Technical breakout */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Volume Spike Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(metrics.volumeAnalysisTop ?? metrics.volumeAnalysisData)
                    ?.slice(0, 6)
                    .map((stock: VolumeAnalysisItem) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{formatSymbol(stock.symbol)}</div>
                            <div className="text-sm text-gray-500">{stock.activity} Activity</div>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              stock.volumeRatio > 2
                                ? "bg-red-500"
                                : stock.volumeRatio > 1.5
                                  ? "bg-orange-500"
                                  : stock.volumeRatio > 1
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                            }`}
                          ></div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{Number(stock.volumeRatio).toFixed(1)}x</div>
                          <div className="text-sm text-gray-500">
                            {(Number(stock.currentVolume) / 1000000).toFixed(1)}M vol
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-blue-800 mb-1">
                      Volume Signal Interpretation:
                    </div>
                    <div className="space-y-1 text-blue-700">
                      <div>🟢 1-1.5x: Normal trading activity</div>
                      <div>🟠 1.5-2x: Above average interest</div>
                      <div>🔴 2x+: Significant news/events likely</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Breakout Signals */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Technical Breakout Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...(weekRangeData || [])]
                    .sort((a: WeekRangeItem, b: WeekRangeItem) => {
                      const apos = Number(a.position);
                      const bpos = Number(b.position);

                      const aBreak = apos > 90; // breakout first
                      const bBreak = bpos > 90;
                      if (aBreak !== bBreak) return aBreak ? -1 : 1;

                      const aStrong = String(a.momentum).toLowerCase() === "strong"; // then strong momentum
                      const bStrong = String(b.momentum).toLowerCase() === "strong";
                      if (aStrong !== bStrong) return aStrong ? -1 : 1;

                      const aNearHigh = a.signal === "Near High"; // then "Near High" before others
                      const bNearHigh = b.signal === "Near High";
                      if (aNearHigh !== bNearHigh) return aNearHigh ? -1 : 1;

                      // finally, closer to highs first
                      return bpos - apos;
                    })
                    .slice(0, 6)
                    .map((stock: WeekRangeItem) => {
                      const pos = Number(stock.position);
                      const low = Number(stock.low);
                      const high = Number(stock.high);

                      return (
                        <div key={stock.symbol} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{formatSymbol(stock.symbol)}</span>
                            <div className="flex gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  stock.signal === "Near High"
                                    ? "bg-green-100 text-green-800"
                                    : stock.signal === "Near Low"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {stock.signal}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  stock.momentum === "Strong"
                                    ? "bg-green-100 text-green-800"
                                    : stock.momentum === "Moderate"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {stock.momentum}
                              </span>
                            </div>
                          </div>

                          {/* Price position visualization */}
                          <div className="relative mb-2">
                            <div className="w-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full h-2" />
                            <div
                              className="absolute w-2 h-2 bg-blue-600 rounded-full -translate-x-1 -translate-y-1/2"
                              style={{ left: `${pos}%`, top: "50%" }}
                              title={`Position: ${pos.toFixed(1)}%`}
                            />
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Position: {pos.toFixed(1)}% of range</span>
                              <span>Range: {formatPrice(high - low)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Low: {formatPrice(low)}</span>
                              <span>High: {formatPrice(high)}</span>
                            </div>
                          </div>

                          {pos > 90 && (
                            <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded">
                              ⚡ Breakout alert: Trading at new highs
                            </div>
                          )}
                          {pos < 10 && (
                            <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded">
                              ⚠️ Support test: Near 52-week lows
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Moving Average Convergence/Divergence */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Moving Average Convergence/Divergence Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movingAverageData.slice(0, 9).map((stock: MovingAverageItem, index: number) => (
                  <div key={`${stock.symbol}-${index}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">{formatSymbol(stock.symbol)}</span>
                      <div className="flex gap-1">
                        {stock.goldenCross && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Golden Cross
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            stock.ma50Signal === "Bullish"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stock.ma50Signal}
                        </span>
                      </div>
                    </div>

                    {/* Mini chart representation */}
                    <div className="h-16 relative bg-gray-50 rounded">
                      <div className="absolute inset-0 flex items-end justify-between px-2 py-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((_, i: number) => {
                          const height = 20 + Math.random() * 30;
                          return (
                            <div
                              key={i}
                              className="w-1 bg-blue-400 rounded-t"
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-medium">
                          {formatPrice(Number(stock.currentPrice))}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>MA50:</span>
                        {(() => {
                          const v = Number(stock.priceVsMa50);
                          const cls =
                            Number.isFinite(v) && v >= 0 ? "text-green-600" : "text-red-600";
                          return (
                            <span className={cls}>
                              {formatPrice(Number(stock.ma50))} (
                              {Number.isFinite(v) ? `${v.toFixed(2)}%` : "—"})
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex justify-between">
                        <span>MA200:</span>
                        {(() => {
                          const v = Number(stock.priceVsMa200);
                          const cls =
                            Number.isFinite(v) && v >= 0 ? "text-green-600" : "text-red-600";
                          return (
                            <span className={cls}>
                              {formatPrice(Number(stock.ma200))} (
                              {Number.isFinite(v) ? `${v.toFixed(2)}%` : "—"})
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 52-Week Range Position */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  52-Week Range Position Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekRangeData.map((stock: WeekRangeItem, index: number) => (
                    <div key={`${stock.symbol}-${index}`} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{formatSymbol(stock.symbol)}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              stock.signal === "Near High"
                                ? "bg-green-100 text-green-800"
                                : stock.signal === "Near Low"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {stock.signal}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              stock.momentum === "Strong"
                                ? "bg-green-100 text-green-800"
                                : stock.momentum === "Moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {stock.momentum} Momentum
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatPrice(Number(stock.current))} ({Number(stock.position).toFixed(0)}%
                          of range)
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${
                              Number(stock.position) > 80
                                ? "bg-green-500"
                                : Number(stock.position) > 60
                                  ? "bg-blue-500"
                                  : Number(stock.position) > 40
                                    ? "bg-yellow-500"
                                    : Number(stock.position) > 20
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                            }`}
                            style={{ width: `${Number(stock.position)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>52W Low: {formatPrice(Number(stock.low))}</span>
                          <span>Range: {formatPrice(Number(stock.range))}</span>
                          <span>52W High: {formatPrice(Number(stock.high))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Moving Average Analysis */}
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Moving Average Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {movingAverageData.slice(0, 6).map((stock: MovingAverageItem, index: number) => {
                    const cur = Number(stock.currentPrice);
                    const ma50 = Number(stock.ma50);
                    const ma200 = Number(stock.ma200);
                    const vs50 = Number(stock.priceVsMa50); // already a percent from service
                    const vs200 = Number(stock.priceVsMa200); // already a percent from service

                    const pct = (v: any) =>
                      Number.isFinite(Number(v)) ? `${Number(v).toFixed(2)}%` : "—";
                    const signClass = (v: any) =>
                      Number.isFinite(Number(v)) && Number(v) >= 0
                        ? "text-green-600"
                        : "text-red-600";

                    return (
                      <div key={`${stock.symbol}-${index}`} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{formatSymbol(stock.symbol)}</span>
                          <div className="flex gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                stock.ma50Signal === "Bullish"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              MA50: {stock.ma50Signal}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                stock.goldenCross
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stock.goldenCross ? "Golden Cross" : "Normal"}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Current: {formatPrice(cur)}</span>
                            <span className={signClass(vs50)}>vs MA50: {pct(vs50)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>MA50: {formatPrice(ma50)}</span>
                            <span className={signClass(vs200)}>vs MA200: {pct(vs200)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSignalsPage;
