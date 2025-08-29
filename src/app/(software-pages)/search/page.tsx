"use client";

import SideBar from "@/components/SideBar";
import StockSearch, { StockSearchResult } from "@/components/StockSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUserStatus } from "@/lib/hooks/useUserStatus";
import { cn } from "@/lib/utils";
import { formatLargeNumber, formatPercentage, formatPrice, formatSymbol } from "@/lib/utils/stockUtils";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building,
  Calculator,
  Calendar,
  DollarSign,
  PieChart,
  Plus, RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Users
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";

const formatDateTime = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
};

const MetricCard = ({
  label,
  value,
  icon: Icon,
  className = "",
  trend = null
}: {
  label: string;
  value: string | number;
  icon?: any;
  className?: string;
  trend?: "up" | "down" | null;
}) => (
  <div className={cn("bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow", className)}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
    </div>
    <div className="flex items-center gap-2">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {trend && (
        <div className={cn("flex items-center", trend === "up" ? "text-green-600" : "text-red-600")}>
          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
      )}
    </div>
  </div>
);

const SectionCard = ({
  title,
  icon: Icon,
  children,
  className = ""
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn("shadow-sm border-0 bg-white", className)}>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        {Icon && <Icon className="h-5 w-5 text-blue-600" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);

const SearchPage = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [stockData, setStockData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [buyPrice, setBuyPrice] = useState<string>("");
  const [addingToPortfolio, setAddingToPortfolio] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <div className="p-6">
        <p className="text-gray-700">
          Please sign in to use AI Stock Analytics.
        </p>
        <link rel="stylesheet" href="/sign-in" />
      </div>
    );
  }

  // Pass redirectIfInactive = true so inactive users are bounced to dashboard
  const { isActive, user } = useUserStatus({
    redirectIfInactive: true,
  });

  const handleStockSelect = (stock: StockSearchResult) => {
    setSymbol(stock.symbol);
    fetchStockData(stock.symbol);
  };

  const fetchStockData = async (selectedSymbol: string) => {
    setError("");
    setStockData(null);
    setLoading(true);
    if (!selectedSymbol) return;

    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(selectedSymbol)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Failed to fetch stock data.");
        setStockData(null);
        return;
      }
      setStockData(data.data);
    } catch (err) {
      setError("Failed to fetch stock data.");
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  const addToPortfolio = async () => {
    setError("");
    if (!symbol || !quantity || !buyPrice) {
      setError("Please select a stock and enter quantity and buy price.");
      return;
    }
    setAddingToPortfolio(true);
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(symbol)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, buyPrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Failed to add to portfolio.");
      } else {
        setError("");
        setQuantity("");
        setBuyPrice("");
      }
    } catch (err) {
      setError("Failed to add to portfolio.");
    } finally {
      setAddingToPortfolio(false);
    }
  };

  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gradient-to-br from-gray-50 to-gray-100 md:flex-row",
      "min-h-screen"
    )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen p-3 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Stock Research</h1>
          <p className="text-gray-600">Search and analyze stocks with comprehensive market data</p>
        </div>

        {/* Search Section */}
        <SectionCard title="Search Stocks" icon={BarChart3} className="mb-6">
          <div className="space-y-4">
            <StockSearch onStockSelect={handleStockSelect} className="w-full" />
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading stock data...</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {stockData && (
          <div className="space-y-6">
            {/* Stock Header */}
            <SectionCard title="Company Overview" icon={Building}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      {stockData.stock.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="font-mono">
                        {formatSymbol(stockData.stock.symbol)}
                      </Badge>
                      <Badge variant="secondary">
                        {stockData.stock.exchange}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    label="Sector"
                    value={stockData.stock.sector || 'N/A'}
                    icon={PieChart}
                  />
                  <MetricCard
                    label="Industry"
                    value={stockData.stock.industry || 'N/A'}
                    icon={Building}
                  />
                  <MetricCard
                    label="Last Updated"
                    value={formatDateTime(stockData.stock.lastRefreshedAt)}
                    icon={Calendar}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Real-Time Price */}
            {stockData.realTimePrice?.[0] && (
              <SectionCard title="Live Price" icon={Activity}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    label="Current Price"
                    value={formatPrice(stockData.realTimePrice[0].price)}
                    icon={DollarSign}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
                  />
                  <MetricCard
                    label="Volume"
                    value={formatLargeNumber(stockData.realTimePrice[0].volume)}
                    icon={BarChart3}
                  />
                  <MetricCard
                    label="Last Updated"
                    value={formatDateTime(stockData.realTimePrice[0].updatedAt)}
                    icon={Calendar}
                  />
                </div>
              </SectionCard>
            )}

            {/* Intraday Price */}
            {stockData.intraDayPrice?.[0] && (
              <SectionCard title="Market Data" icon={TrendingUp}>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <MetricCard
                    label="Previous Close"
                    value={formatPrice(stockData.intraDayPrice[0].previousClose)}
                  />
                  <MetricCard
                    label="Open"
                    value={formatPrice(stockData.intraDayPrice[0].open)}
                  />
                  <MetricCard
                    label="Day High"
                    value={formatPrice(stockData.intraDayPrice[0].dayHigh)}
                    className="bg-green-50 border-green-200"
                  />
                  <MetricCard
                    label="Day Low"
                    value={formatPrice(stockData.intraDayPrice[0].dayLow)}
                    className="bg-red-50 border-red-200"
                  />
                  <MetricCard
                    label="52W High"
                    value={formatPrice(stockData.intraDayPrice[0].fiftyTwoWeekHigh)}
                  />
                  <MetricCard
                    label="52W Low"
                    value={formatPrice(stockData.intraDayPrice[0].fiftyTwoWeekLow)}
                  />
                  <MetricCard
                    label="50D MA"
                    value={formatPrice(stockData.intraDayPrice[0].fiftyDayMovingAverage)}
                  />
                  <MetricCard
                    label="200D MA"
                    value={formatPrice(stockData.intraDayPrice[0].twoHundredDayMovingAverage)}
                  />
                  <MetricCard
                    label="3M Avg Vol"
                    value={formatLargeNumber(stockData.intraDayPrice[0].averageDailyVolume3Month)}
                  />
                  <MetricCard
                    label="10D Avg Vol"
                    value={formatLargeNumber(stockData.intraDayPrice[0].averageDailyVolume10Day)}
                  />
                  <MetricCard
                    label="Market Cap"
                    value={formatLargeNumber(stockData.intraDayPrice[0].marketCap)}
                    className="bg-purple-50 border-purple-200"
                  />
                </div>
              </SectionCard>
            )}

            {/* Fundamental Data */}
            {stockData.fundamentalData?.[0] && (
              <SectionCard title="Valuation Metrics" icon={Calculator}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <MetricCard
                    label="EPS (TTM)"
                    value={formatPrice(stockData.fundamentalData[0].epsTTM)}
                  />
                  <MetricCard
                    label="EPS (Forward)"
                    value={formatPrice(stockData.fundamentalData[0].epsForward)}
                  />
                  <MetricCard
                    label="Book Value"
                    value={formatPrice(stockData.fundamentalData[0].bookValue)}
                  />
                  <MetricCard
                    label="Trailing P/E"
                    value={formatPrice(stockData.fundamentalData[0].trailingPE)}
                    className="bg-blue-50 border-blue-200"
                  />
                  <MetricCard
                    label="Forward P/E"
                    value={formatPrice(stockData.fundamentalData[0].forwardPE)}
                    className="bg-blue-50 border-blue-200"
                  />
                  <MetricCard
                    label="Price to Book"
                    value={formatPrice(stockData.fundamentalData[0].priceToBook)}
                  />
                </div>
              </SectionCard>
            )}

            {/* Financial Data */}
            {stockData.financialData?.[0] && (
              <SectionCard title="Financial Performance" icon={DollarSign}>
                <div className="space-y-6">
                  {/* Revenue & Cash */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Position</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        label="Total Revenue"
                        value={formatLargeNumber(stockData.financialData[0].totalRevenue)}
                        className="bg-green-50 border-green-200"
                      />
                      <MetricCard
                        label="Total Cash"
                        value={formatLargeNumber(stockData.financialData[0].totalCash)}
                      />
                      <MetricCard
                        label="Total Debt"
                        value={formatLargeNumber(stockData.financialData[0].totalDebt)}
                        className="bg-orange-50 border-orange-200"
                      />
                      <MetricCard
                        label="Debt to Equity"
                        value={stockData.financialData[0].debtToEquity}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Ratios */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Ratios</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      <MetricCard
                        label="Current Ratio"
                        value={stockData.financialData[0].currentRatio}
                      />
                      <MetricCard
                        label="Quick Ratio"
                        value={stockData.financialData[0].quickRatio}
                      />
                      <MetricCard
                        label="ROA"
                        value={formatPercentage(stockData.financialData[0].returnOnAssets)}
                      />
                      <MetricCard
                        label="ROE"
                        value={formatPercentage(stockData.financialData[0].returnOnEquity)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Margins & Growth */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Profitability & Growth</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      <MetricCard
                        label="Profit Margin"
                        value={formatPercentage(stockData.financialData[0].profitMargin)}
                        className="bg-green-50 border-green-200"
                      />
                      <MetricCard
                        label="Gross Margin"
                        value={formatPercentage(stockData.financialData[0].grossMargin)}
                      />
                      <MetricCard
                        label="Operating Margin"
                        value={formatPercentage(stockData.financialData[0].operatingMargin)}
                      />
                      <MetricCard
                        label="EBITDA Margin"
                        value={formatPercentage(stockData.financialData[0].ebitdaMargin)}
                      />
                      <MetricCard
                        label="Revenue Growth"
                        value={formatPercentage(stockData.financialData[0].revenueGrowth)}
                        className="bg-blue-50 border-blue-200"
                      />
                      <MetricCard
                        label="Earnings Growth"
                        value={formatPercentage(stockData.financialData[0].earningsGrowth)}
                        className="bg-blue-50 border-blue-200"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Statistics */}
            {stockData.statistics?.[0] && (
              <SectionCard title="Ownership & Dividends" icon={Users}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    label="Institutional Ownership"
                    value={stockData.statistics[0].sharesHeldByInstitutions}
                    icon={Building}
                  />
                  <MetricCard
                    label="Insider Ownership"
                    value={stockData.statistics[0].sharesHeldByAllInsider}
                    icon={Users}
                  />
                  <MetricCard
                    label="Last Dividend"
                    value={stockData.statistics[0].lastDividendValue}
                  />
                  <MetricCard
                    label="Dividend Date"
                    value={stockData.statistics[0].lastDividendDate}
                  />
                  <MetricCard
                    label="Split Factor"
                    value={stockData.statistics[0].lastSplitFactor}
                  />
                  <MetricCard
                    label="Split Date"
                    value={stockData.statistics[0].lastSplitDate}
                  />
                  <MetricCard
                    label="Earnings Date"
                    value={stockData.statistics[0].earningsDate}
                    className="bg-yellow-50 border-yellow-200"
                  />
                  <MetricCard
                    label="Earnings Call"
                    value={stockData.statistics[0].earningsCallDate}
                  />
                  <MetricCard
                    label="Beta"
                    value={stockData.statistics[0].beta ? `${stockData.statistics[0].beta}` : 'N/A'}
                    className="bg-blue-50 border-blue-200"
                  />
                </div>
              </SectionCard>
            )}

            {/* Analyst Ratings */}
            {stockData.analystRating?.[0] && (
              <SectionCard title="Analyst Recommendations" icon={Target}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    label="Recommendation"
                    value={stockData.analystRating[0].recommendation}
                    className="bg-blue-50 border-blue-200"
                  />
                  <MetricCard
                    label="Number of Analysts"
                    value={stockData.analystRating[0].numberOfAnalysts}
                    icon={Users}
                  />
                  <MetricCard
                    label="Price Target High"
                    value={stockData.analystRating[0].targetPriceHigh}
                    className="bg-green-50 border-green-200"
                  />
                  <MetricCard
                    label="Price Target Low"
                    value={stockData.analystRating[0].targetLowPrice}
                    className="bg-red-50 border-red-200"
                  />
                </div>
              </SectionCard>
            )}

            {/* Add to Portfolio */}
            <SectionCard title="Add to Portfolio" icon={Plus} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="Number of shares"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Buy Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price per share"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
                <Button
                  onClick={addToPortfolio}
                  disabled={addingToPortfolio}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {addingToPortfolio ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Adding to Portfolio...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add to Portfolio
                    </div>
                  )}
                </Button>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;