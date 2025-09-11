"use client";

import PortfolioSummary from "@/components/portfolio/PortfolioSummary";
import SideBar from "@/components/SideBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRealTimePortfolio } from "@/lib/hooks/useRealTimePortfolio";
import { useUserStatus } from "@/lib/hooks/useUserStatus";
import { cn } from "@/lib/utils";
import { FEATURE_CODES, FeatureCode } from "@/lib/utils/constants";
import { IconChartBar } from "@tabler/icons-react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bolt,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Crown,
  Newspaper,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Search,
  Signal,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";

const formatDMY = (iso?: string) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  // dd-mm-yyyy
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
};

type RateLimitSummaryItem = {
  featureCode: FeatureCode;
  featureName?: string;
  short?: string;
  description?: string;
  quota: number;
  used: number;
  remaining: number;
  resetInterval?: string | null;
  resetTime?: string | null;
};

function LocalRateLimitBadge({
  feature,
  map,
}: {
  feature: FeatureCode;
  map: Record<string, RateLimitSummaryItem | undefined>;
}) {
  const val = map[feature];
  if (!val) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span className="px-2 py-1 rounded-full ring-1 ring-slate-100 bg-white/80">
        {val.remaining}/{val.quota}
      </span>
    </span>
  );
}

function QuickActionCard({
  href,
  title,
  desc,
  icon,
  feature,
  rateLimitMap,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  feature?: FeatureCode;
  rateLimitMap: Record<string, RateLimitSummaryItem | undefined>;
}) {
  const info = feature ? rateLimitMap[feature] : undefined;
  const blocked = info ? info.remaining <= 0 : false;

  const formatResetTime = (dateStr?: string, interval?: string) => {
    if (!dateStr) return "Reset time unknown";
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return `Resets (${interval ?? "N/A"}): ${datePart} ${timePart}`;
  };

  const cardInner = (
    <Card
      className={cn(
        "relative h-full flex flex-col justify-between border border-slate-200 transition-shadow",
        blocked ? "opacity-95" : "hover:shadow-md cursor-pointer"
      )}
    >
      <CardContent className="flex flex-col flex-1 p-6">
        {/* Icon */}
        <div className="p-3 bg-slate-50 rounded-lg w-fit mx-auto mb-3">
          <div className="inline-flex items-center justify-center w-8 h-8">{icon}</div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mt-1 text-center flex-1">{desc}</p>

        {/* Bottom tokens info */}
        {feature && info && (
          <div className="mt-4 text-xs text-center">
            <div className="flex justify-center items-center gap-2 font-medium">
              <span className="text-slate-700">
                Tokens: {info.used}/{info.quota}
              </span>
              {blocked && <span className="text-red-600">Limit reached</span>}
            </div>
            <div className="text-slate-500 mt-1">
              {formatResetTime(info.resetTime, info.resetInterval)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return blocked ? <div className="h-full">{cardInner}</div> : <Link href={href}>{cardInner}</Link>;
}



// Separate component that uses useSearchParams
const DashboardContent = () => {
  const { data: session } = useSession();
  const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showInactiveBanner, user } = useUserStatus();
  const planName = session?.user?.planName ?? "Free";
  const subscriptionType = (session?.user?.subscriptionType ?? "Monthly").toLowerCase();
  const startDate = formatDMY(session?.user?.subscriptionStartDate);
  const endDate = formatDMY(session?.user?.subscriptionEndDate);
  const inactive = session?.user?.isActive === false;

  const [rateLimitMap, setRateLimitMap] = useState<
    Record<string, RateLimitSummaryItem | undefined>
  >({});

  useEffect(() => {
    let cancelled = false;
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/rate-limit-summary", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          console.warn("Failed to load rate-limit-summary", json);
          return;
        }
        if (json?.success && Array.isArray(json.data)) {
          const map: Record<string, RateLimitSummaryItem> = {};
          for (const row of json.data) {
            if (!row?.featureCode) continue;
            map[row.featureCode] = {
              featureCode: row.featureCode,
              featureName: row.featureName,
              short: (row as any).short,
              description: (row as any).description,
              quota: Number(row.quota ?? 0),
              used: Number(row.used ?? 0),
              remaining: Number(row.remaining ?? 0),
              resetInterval: row.resetInterval ?? null,
              resetTime: row.resetTime ?? null,
            };
          }
          if (!cancelled) setRateLimitMap(map);
        }
      } catch (err) {
        console.error("Error fetching rate-limit-summary:", err);
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initial portfolio fetch
  useEffect(() => {
    const fetchInitialPortfolio = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch("/api/portfolio");
        const data = await res.json();
        if (data.success) {
          setInitialPortfolio(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial portfolio:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialPortfolio();
  }, [refreshKey]);

  // Use real-time portfolio hook
  const { portfolio, status, isLoading, error, refreshPortfolio } =
    useRealTimePortfolio(initialPortfolio);

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    if (!portfolio.length) return null;

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let stockAllocations: { [key: string]: number } = {};
    let sectorAllocations: { [key: string]: number } = {};

    portfolio.forEach((item) => {
      const invested = Number(item.buyPrice) * item.quantity;
      const currentValue = Number(item.realTimePrice?.price || 0) * item.quantity;

      totalInvested += invested;
      totalCurrentValue += currentValue;

      // Stock allocation
      stockAllocations[item.stock?.symbol] = currentValue;

      // Sector allocation (mock data for demo - you might want to add sector info to your stock data)
      const sector = item.stock?.sector || "Technology"; // Default to Technology if not available
      sectorAllocations[sector] = (sectorAllocations[sector] || 0) + currentValue;
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvested,
      totalGainLossPercentage:
        totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
      stockAllocations,
      sectorAllocations,
    };
  };

  // Prepare pie chart data
  const preparePieData = () => {
    const metrics = calculatePortfolioMetrics();
    if (!metrics) return [];

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316"];

    return Object.entries(metrics.stockAllocations)
      .map(([symbol, value], index) => ({
        name: symbol,
        value: Number(((value / metrics.totalCurrentValue) * 100).toFixed(1)),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 holdings
  };

  // Top performers calculation
  const getTopPerformers = () => {
    if (!portfolio.length) return [];

    return portfolio
      .map((item) => {
        const currentPrice = Number(item.realTimePrice?.price || 0);
        const buyPrice = Number(item.buyPrice);
        const gainLossPercentage = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;

        return {
          symbol: item.stock?.symbol,
          name: item.stock?.name,
          gainLossPercentage,
          currentPrice,
          previousPrice: buyPrice,
        };
      })
      .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
      .slice(0, 5);
  };

  const pieData = preparePieData();
  const topPerformers = getTopPerformers();
  const metrics = calculatePortfolioMetrics();

  const formatPrice = (value: number) => `₹${Number(value).toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-600">Loading your Dashboard...</p>
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div
        className={cn(
          "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
          "min-h-screen"
        )}
      >
        <SideBar />
        <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
          <LoadingSpinner />
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
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Greeting Section */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Hello, {session?.user?.username || "Investor"}!
            </h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's your portfolio overview.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              onClick={refreshPortfolio}
              variant="outline"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/portfolio">
              <Button className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                Go to Portfolio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {portfolio.length > 0 && <PortfolioSummary portfolio={portfolio} />}

        {/* Inactive Banner */}
        {showInactiveBanner && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Your account is inactive</p>
                <p className="text-sm opacity-90">Please verify your email or contact support.</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col items-center md:flex-row md:items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Crown className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-center md:text-left">
                    {/* Plan Details */}
                    <h3 className="text-lg font-semibold text-slate-800">
                      Current Plan: {planName.toUpperCase()}{" "}
                      <Badge variant="secondary" className="rounded-full bg-blue-100 text-blue-700">
                        {subscriptionType}
                      </Badge>
                      {inactive && (
                        <Badge variant="destructive" className="rounded-full">
                          Inactive
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {planName === "free"
                        ? "Enjoy all premium features with limit access"
                        : "You are subscribed to our premium plan"}
                    </p>

                    {/* Subscription Start & End Dates */}
                    {planName.toLowerCase() !== "free" && (
                      <div className="mt-2 text-sm text-slate-700">
                        <p>
                          <b>Start Date:</b> {startDate}
                        </p>
                        <p>
                          <b>End Date:</b> {endDate}
                        </p>
                      </div>
                    )}

                    {/* Benefits List */}
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      <li className="flex items-center gap-2 text-sm text-slate-700 leading-snug">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="whitespace-normal text-left">
                          {planName === "free"
                            ? "Limited access to all premium features included"
                            : "All premium features unlocked"}
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-sm text-slate-700 leading-snug">
                        <Target className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="whitespace-normal text-left">
                          {planName === "free"
                            ? "Limited AI Analysis tokens per day"
                            : "Unlimited AI Analysis tokens"}
                          {planName === "free" && (
                            <div className="text-slate-500 text-sm">(1 token = 1 analysis)</div>
                          )}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Existing features */}
            <QuickActionCard
              href="/portfolio"
              title="Portfolio"
              desc="View & manage your investments"
              icon={<IconChartBar className="h-6 w-6 text-blue-600" />}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/ai-stock-analytics"
              title="AI Stock Analytics"
              desc="Research & analyze stocks"
              icon={<BrainCircuit className="h-6 w-6 text-purple-600" />}
              feature={FEATURE_CODES.AI_ANALYSIS}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/news"
              title="Market News"
              desc="Latest financial updates"
              icon={<Newspaper className="h-6 w-6 text-green-600" />}
              feature={FEATURE_CODES.MARKET_NEWS}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/search"
              title="Stock Search"
              desc="Find & explore stocks"
              icon={<Search className="h-6 w-6 text-orange-600" />}
              feature={FEATURE_CODES.STOCK_SEARCH}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/ai-portfolio-advisor"
              title="AI Portfolio Advisor"
              desc="AI-based portfolio analysis & rebalance suggestions"
              icon={<Cpu className="h-6 w-6 text-indigo-600" />}
              feature={FEATURE_CODES.AI_PORTFOLIO_ADVISOR}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/trade-signals"
              title="Trade Signals"
              desc="Momentum & volume signals for your holdings"
              icon={<Signal className="h-6 w-6 text-amber-600" />}
              feature={FEATURE_CODES.TRADE_SIGNALS}
              rateLimitMap={rateLimitMap}
            />

            <QuickActionCard
              href="/smart-money"
              title="Smart Money"
              desc="See overlap with ace investors & institutions"
              icon={<Users className="h-6 w-6 text-emerald-600" />}
              feature={FEATURE_CODES.SMART_MONEY}
              rateLimitMap={rateLimitMap}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div>
          {/* Portfolio Allocation */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Portfolio Allocation</h2>

            {portfolio.length > 0 ? (
              <>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Allocation"]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm text-slate-600">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No allocation data</p>
                  <p className="text-sm">Add stocks to see allocation</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {portfolio.length === 0 && !initialLoading && (
          <div className="text-center py-12 mt-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Building Your Portfolio
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first stock to begin tracking your investments and see detailed analytics.
              </p>
              <Link href="/portfolio">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Your First Stock
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading fallback component
const DashboardLoading = () => (
  <div
    className={cn(
      "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
      "min-h-screen"
    )}
  >
    <SideBar />
    <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading your Dashboard...</p>
        </div>
      </div>
    </div>
  </div>
);

// Main dashboard component with suspense boundary
const Dashboard = () => {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;
