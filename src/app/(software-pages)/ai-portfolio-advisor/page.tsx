"use client";

import SideBar from "@/components/SideBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealTimePortfolio } from "@/lib/hooks/useRealTimePortfolio";
import { cn } from "@/lib/utils";
import { formatLargeNumber, formatPercentage, formatPrice } from "@/lib/utils/stockUtils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Gauge,
  Info,
  MapPin,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Alert Mapping Config
const ALERT_CONFIG: Record<string, { color: string; icon: any }> = {
  opportunity: { color: "green", icon: Target },
  risk: { color: "red", icon: AlertTriangle },
  valuation: { color: "purple", icon: Shield },
};

interface Alert {
  title: string;
  message: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AIPortfolioAdvisorMetrics {
  financialHealthData: any[];
  peDistributionData: any[];
  weightedPE: number;
  alerts: any[];
  sectorAllocations: Record<string, { value: number }>;
  totalCurrentValue: number;
  concentrationRisk: string;
  herfindahlIndex: number;
  portfolioBeta: number;
  dividendData: any[];
  riskReturnData: any[];
  analystTargetData: any[];
  marketCapData: any[];
  totalDividendYield: number;
}

const AIPortfolioAdvisorPage = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AIPortfolioAdvisorMetrics | null>(null);

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

  useEffect(() => {
    const fetchAdvisorInsights = async () => {
      if (!Array.isArray(portfolio)) return;
      setLoading(true);
      try {
        const res = await fetch("/api/ai-portfolio-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolio }),
        });
        const json = await res.json();
        if (json?.success) {
          setMetrics(json.data as AIPortfolioAdvisorMetrics);
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

    if (portfolio.length > 0) fetchAdvisorInsights();
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
        <SideBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading AI Portfolio Advisor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
        <SideBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-gray-500">No advisor data available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
        "min-h-screen"
      )}
    >
      <SideBar />
      <div className="flex-1 p-6 space-y-8">
        {/* Financial Health Radar & P/E Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Financial Health Radar */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-600" />
                Portfolio Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={[
                      {
                        metric: "Current Ratio",
                        portfolioAvg:
                          metrics.financialHealthData.reduce(
                            (sum, item) => sum + item.currentRatio,
                            0
                          ) / metrics.financialHealthData.length || 50,
                        benchmark: 75,
                        fullMark: 100,
                      },
                      {
                        metric: "Quick Ratio",
                        portfolioAvg:
                          metrics.financialHealthData.reduce(
                            (sum, item) => sum + item.quickRatio,
                            0
                          ) / metrics.financialHealthData.length || 50,
                        benchmark: 70,
                        fullMark: 100,
                      },
                      {
                        metric: "Low Debt/Equity",
                        portfolioAvg:
                          metrics.financialHealthData.reduce(
                            (sum, item) => sum + item.debtToEquity,
                            0
                          ) / metrics.financialHealthData.length || 50,
                        benchmark: 80,
                        fullMark: 100,
                      },
                      {
                        metric: "ROE",
                        portfolioAvg:
                          metrics.financialHealthData.reduce((sum, item) => sum + item.roe, 0) /
                            metrics.financialHealthData.length || 50,
                        benchmark: 60,
                        fullMark: 100,
                      },
                      {
                        metric: "Profit Margin",
                        portfolioAvg:
                          metrics.financialHealthData.reduce(
                            (sum, item) => sum + item.profitMargin,
                            0
                          ) / metrics.financialHealthData.length || 50,
                        benchmark: 65,
                        fullMark: 100,
                      },
                      {
                        metric: "Revenue Growth",
                        portfolioAvg:
                          metrics.financialHealthData.reduce(
                            (sum, item) => sum + item.revenueGrowth,
                            0
                          ) / metrics.financialHealthData.length || 50,
                        benchmark: 55,
                        fullMark: 100,
                      },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Your Portfolio"
                      dataKey="portfolioAvg"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Market Benchmark"
                      dataKey="benchmark"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* P/E Distribution */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                P/E Ratio Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { range: "0-10", count: 0, label: "Deep Value" },
                      {
                        range: "10-15",
                        count: metrics.peDistributionData
                          .filter((p) => p.range === "10-15")
                          .reduce((sum, p) => sum + p.count, 0),
                        label: "Value",
                      },
                      {
                        range: "15-20",
                        count: metrics.peDistributionData
                          .filter((p) => p.range === "15-20")
                          .reduce((sum, p) => sum + p.count, 0),
                        label: "Fair Value",
                      },
                      {
                        range: "20-25",
                        count: metrics.peDistributionData
                          .filter((p) => p.range === "20-25")
                          .reduce((sum, p) => sum + p.count, 0),
                        label: "Growth",
                      },
                      {
                        range: "25-30",
                        count: metrics.peDistributionData
                          .filter((p) => p.range === "25-30")
                          .reduce((sum, p) => sum + p.count, 0),
                        label: "High Growth",
                      },
                      {
                        range: "30+",
                        count: metrics.peDistributionData
                          .filter((p) => p.range === "30+")
                          .reduce((sum, p) => sum + p.count, 0),
                        label: "Expensive",
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        value,
                        `${props.payload.label} (${value} stocks)`,
                      ]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">Portfolio Avg P/E: {metrics.weightedPE}</div>
                <div className="text-sm text-gray-600">
                  vs Market Average: 22.5 | Classification:{" "}
                  {metrics.weightedPE < 15 ? "Value" : metrics.weightedPE < 25 ? "Fair" : "Growth"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Concentration Risk */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Concentration Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    metrics.concentrationRisk === "Low"
                      ? "text-green-600"
                      : metrics.concentrationRisk === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {metrics.concentrationRisk}
                </div>
                <div className="text-sm text-gray-600">Concentration Risk Level</div>
                <div className="text-xs text-gray-500 mt-1">
                  HHI Index: {(metrics.herfindahlIndex * 100).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Largest holding:</span>
                  <span className="font-medium">
                    {Math.max(
                      ...Object.values(metrics.sectorAllocations).map(
                        (s) => (s.value / metrics.totalCurrentValue) * 100
                      )
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Top 3 holdings:</span>
                  <span className="font-medium">
                    {Object.values(metrics.sectorAllocations)
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 3)
                      .reduce(
                        (sum, sector) => sum + (sector.value / metrics.totalCurrentValue) * 100,
                        0
                      )
                      .toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Number of sectors:</span>
                  <span className="font-medium">
                    {Object.keys(metrics.sectorAllocations).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total holdings:</span>
                  <span className="font-medium">{portfolio.length}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Risk Assessment:</div>
                <div className="text-xs text-gray-600 space-y-1">
                  {metrics.concentrationRisk === "Low" && (
                    <>
                      <div>✅ Well diversified across sectors</div>
                      <div>✅ No single holding dominates</div>
                      <div>✅ Good risk distribution</div>
                    </>
                  )}
                  {metrics.concentrationRisk === "Medium" && (
                    <>
                      <div>⚠️ Moderate concentration present</div>
                      <div>⚠️ Consider broader diversification</div>
                      <div>⚠️ Monitor large positions</div>
                    </>
                  )}
                  {metrics.concentrationRisk === "High" && (
                    <>
                      <div>🚨 High concentration risk</div>
                      <div>🚨 Urgent diversification needed</div>
                      <div>🚨 Single holdings too large</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Beta Analysis */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Market Sensitivity (Beta) Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.riskReturnData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value.toFixed(2), "Beta"]} />
                    <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="3 3" />
                    <Bar dataKey="beta" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-700">
                  {metrics.portfolioBeta.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Portfolio Beta</div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.portfolioBeta > 1.2
                    ? "Highly Aggressive"
                    : metrics.portfolioBeta > 1.0
                    ? "Moderately Aggressive"
                    : metrics.portfolioBeta > 0.8
                    ? "Moderately Conservative"
                    : "Conservative"}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Market correlation:</span>
                  <span
                    className={
                      metrics.portfolioBeta > 1.1
                        ? "text-red-600"
                        : metrics.portfolioBeta > 0.9
                        ? "text-yellow-600"
                        : "text-green-600"
                    }
                  >
                    {metrics.portfolioBeta > 1.1
                      ? "High"
                      : metrics.portfolioBeta > 0.9
                      ? "Moderate"
                      : "Low"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility vs market:</span>
                  <span>
                    {metrics.portfolioBeta > 1
                      ? `${((metrics.portfolioBeta - 1) * 100).toFixed(0)}% higher`
                      : `${((1 - metrics.portfolioBeta) * 100).toFixed(0)}% lower`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Alerts */}
        <Card className="bg-white shadow-sm border border-slate-200 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              Smart Alerts & AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.alerts && metrics.alerts.length > 0 ? (
                metrics.alerts.map((alert, index) => {
                  const IconComponent =
                    ALERT_CONFIG[alert.type]?.icon || ALERT_CONFIG["Opportunity"].icon;

                  return (
                    <div
                      key={index}
                      className={`p-4 border-l-4 rounded-lg ${
                        alert.color === "green"
                          ? "border-green-500 bg-green-50"
                          : alert.color === "red"
                          ? "border-red-500 bg-red-50"
                          : alert.color === "purple"
                          ? "border-purple-500 bg-purple-50"
                          : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent
                          className={`h-4 w-4 ${
                            alert.color === "green"
                              ? "text-green-600"
                              : alert.color === "red"
                              ? "text-red-600"
                              : alert.color === "purple"
                              ? "text-purple-600"
                              : "text-blue-600"
                          }`}
                        />
                        <span className="font-medium text-sm">{alert.title}</span>
                      </div>
                      <p className="text-xs text-gray-700">{alert.message}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No active alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Optimizer Suggestions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Portfolio Optimizer Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-purple-800">Rebalancing Recommendations:</h4>
                <div className="space-y-2">
                  {metrics &&
                    Object.entries(metrics.sectorAllocations)
                      .sort(([, a], [, b]) => b.value - a.value)
                      .slice(0, 3)
                      .map(([sector, data]) => {
                        const allocation = (data.value / metrics.totalCurrentValue) * 100;
                        const suggestion =
                          allocation > 40 ? "Reduce" : allocation < 10 ? "Increase" : "Maintain";
                        return (
                          <div
                            key={sector}
                            className="flex justify-between items-center p-2 bg-white rounded"
                          >
                            <span className="text-sm">{sector}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{allocation.toFixed(1)}%</div>
                              <div
                                className={`text-xs ${
                                  suggestion === "Reduce"
                                    ? "text-red-600"
                                    : suggestion === "Increase"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {suggestion}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-purple-800">Risk Management Tips:</h4>
                <div className="space-y-2 text-sm">
                  {metrics && (
                    <>
                      {metrics.concentrationRisk === "High" && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                          🚨 Diversify across more sectors to reduce concentration risk
                        </div>
                      )}
                      {metrics.portfolioBeta > 1.3 && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded text-orange-700">
                          ⚠️ Portfolio is highly volatile - consider adding defensive stocks
                        </div>
                      )}
                      {metrics.totalDividendYield < 2 && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                          💡 Consider adding dividend-paying stocks for income generation
                        </div>
                      )}
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700">
                        ✅ Maintain regular portfolio reviews and rebalancing
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk-Return Scatter Plot */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Risk vs Return Analysis
                <Info className="h-4 w-4 text-gray-400 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={metrics.riskReturnData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="risk" name="Risk %" domain={["dataMin-5", "dataMax+5"]} />
                    <YAxis dataKey="return" name="Return %" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "return" ? formatPercentage(value) : `${value.toFixed(1)}%`,
                        name === "return" ? "Return" : "Risk",
                      ]}
                      labelFormatter={(value) => `${value}`}
                    />
                    <Scatter dataKey="return" fill="#3b82f6">
                      {metrics.riskReturnData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Bubble size represents investment amount. Higher return with lower risk is ideal
                (top-left quadrant).
              </div>
            </CardContent>
          </Card>

          {/* Market Cap Distribution Treemap */}
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Market Cap Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.marketCapData.slice(0, 6).map((stock, index) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.size}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatLargeNumber(stock.marketCap * 10000000)}
                      </div>
                      <div className="text-sm text-gray-500">{stock.weight.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Beta vs Alpha Analysis */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Beta vs Alpha Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={metrics.riskReturnData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="beta" name="Beta" domain={["dataMin-0.1", "dataMax+0.1"]} />
                  <YAxis dataKey="alpha" name="Alpha" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value.toFixed(2),
                      name === "alpha" ? "Alpha (%)" : "Beta",
                    ]}
                  />
                  <ReferenceLine x={1} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                  <Scatter dataKey="alpha" fill="#3b82f6">
                    {metrics.riskReturnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Analyst Ratings & Targets */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Analyst Price Targets & Upside
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.analystTargetData.slice(0, 6).map((stock) => (
                <div key={stock.symbol} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stock.symbol}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          stock.recommendation === "BUY"
                            ? "bg-green-100 text-green-800"
                            : stock.recommendation === "HOLD"
                            ? "bg-yellow-100 text-yellow-800"
                            : stock.recommendation === "SELL"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {stock.recommendation}
                      </span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          stock.upside > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatPercentage(stock.upside)} upside
                      </div>
                      <div className="text-xs text-gray-500">{stock.analysts} analysts</div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-400 to-green-400 h-3 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              10,
                              ((stock.currentPrice - stock.targetLow) /
                                (stock.targetHigh - stock.targetLow)) *
                                100
                            )
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Target Low: {formatPrice(stock.targetLow)}</span>
                      <span className="font-medium">
                        Current: {formatPrice(stock.currentPrice)}
                      </span>
                      <span>Target High: {formatPrice(stock.targetHigh)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIPortfolioAdvisorPage;
