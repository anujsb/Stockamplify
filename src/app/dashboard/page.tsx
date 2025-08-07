"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SideBar } from '@/components/SideBar';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import { useRealTimePortfolio } from '@/lib/hooks/useRealTimePortfolio';
import { Plus, RefreshCw, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, BarChart3, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Link from 'next/link';

const Dashboard = () => {
  const { user } = useUser();
  const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [refreshKey, setRefreshKey] = useState(0);

  // Initial portfolio fetch
  useEffect(() => {
    const fetchInitialPortfolio = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        if (data.success) {
          setInitialPortfolio(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial portfolio:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialPortfolio();
  }, [refreshKey]);

  // Use real-time portfolio hook
  const {
    portfolio,
    status,
    isLoading,
    error,
    refreshPortfolio
  } = useRealTimePortfolio(initialPortfolio);

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    if (!portfolio.length) return null;

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let stockAllocations: { [key: string]: number } = {};
    let sectorAllocations: { [key: string]: number } = {};

    portfolio.forEach(item => {
      const invested = Number(item.buyPrice) * item.quantity;
      const currentValue = Number(item.realTimePrice?.price || 0) * item.quantity;

      totalInvested += invested;
      totalCurrentValue += currentValue;

      // Stock allocation
      stockAllocations[item.stock?.symbol] = currentValue;

      // Sector allocation (mock data for demo - you might want to add sector info to your stock data)
      const sector = item.stock?.sector || 'Technology'; // Default to Technology if not available
      sectorAllocations[sector] = (sectorAllocations[sector] || 0) + currentValue;
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvested,
      totalGainLossPercentage: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
      stockAllocations,
      sectorAllocations
    };
  };

  // Generate mock chart data based on timeframe
  const generateChartData = (timeframe: string) => {
    const metrics = calculatePortfolioMetrics();
    if (!metrics) return [];

    const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365;
    const data = [];

    for (let i = dataPoints; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate mock portfolio value with some volatility
      const baseValue = metrics.totalCurrentValue;
      const volatility = baseValue * 0.02; // 2% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const value = baseValue + randomChange;

      data.push({
        time: timeframe === '1D' ? date.getHours() + ':00' :
          timeframe === '1W' ? date.toLocaleDateString('en-US', { weekday: 'short' }) :
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(value, 0)
      });
    }

    return data;
  };

  // Prepare pie chart data
  const preparePieData = () => {
    const metrics = calculatePortfolioMetrics();
    if (!metrics) return [];

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];

    return Object.entries(metrics.stockAllocations)
      .map(([symbol, value], index) => ({
        name: symbol,
        value: Number(((value / metrics.totalCurrentValue) * 100).toFixed(1)),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 holdings
  };

  // Top performers calculation
  const getTopPerformers = () => {
    if (!portfolio.length) return [];

    return portfolio
      .map(item => {
        const currentPrice = Number(item.realTimePrice?.price || 0);
        const buyPrice = Number(item.buyPrice);
        const gainLossPercentage = buyPrice > 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0;

        return {
          symbol: item.stock?.symbol,
          name: item.stock?.name,
          gainLossPercentage,
          currentPrice,
          previousPrice: buyPrice
        };
      })
      .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
      .slice(0, 5);
  };

  const chartData = generateChartData(selectedTimeframe);
  const pieData = preparePieData();
  const topPerformers = getTopPerformers();
  const metrics = calculatePortfolioMetrics();

  const formatPrice = (value: number) => `₹${Number(value).toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
      "min-h-screen"
    )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Hello, {user?.firstName || 'Investor'}!</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's your portfolio overview.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshPortfolio}
              variant="outline"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Performance Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Portfolio Performance</h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeframe === timeframe
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                        }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {portfolio.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => [formatPrice(value), 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No portfolio data available</p>
                  <p className="text-sm">Add stocks to see your performance chart</p>
                </div>
              </div>
            )}
          </div>

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
                      <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
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

        {/* Top Performers Section */}
        {/* {portfolio.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500 truncate">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatPrice(stock.currentPrice)}</div>
                        <div className={`text-sm font-medium ${stock.gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatPercentage(stock.gainLossPercentage)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolio.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.stock?.symbol}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} shares • {formatPrice(item.buyPrice)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.realTimePrice?.updatedAt ?
                          new Date(item.realTimePrice.updatedAt).toLocaleDateString() :
                          'Recently added'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

        {/* Empty State */}
        {portfolio.length === 0 && !initialLoading && (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Building Your Portfolio</h3>
              <p className="text-gray-600 mb-6">Add your first stock to begin tracking your investments and see detailed analytics.</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                <Plus className="w-4 h-4" />
                Add Your First Stock
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;