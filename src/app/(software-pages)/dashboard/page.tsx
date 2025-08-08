"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SideBar } from '@/components/SideBar';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import { useRealTimePortfolio } from '@/lib/hooks/useRealTimePortfolio';
import { Plus, RefreshCw, TrendingUp, Activity, PieChart as PieChartIcon, ArrowRight, Crown, Newspaper, BarChart3, Search, Zap } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';

const Dashboard = () => {
  const { user } = useUser();
  const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
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

  const pieData = preparePieData();
  const topPerformers = getTopPerformers();
  const metrics = calculatePortfolioMetrics();

  const formatPrice = (value: number) => `₹${Number(value).toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

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
      <div className={cn(
        "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
        "min-h-screen"
      )}>
        <SideBar />
        <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

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

        {/* Current Plan Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Crown className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Current Plan: Free Beta</h3>
                    <p className="text-sm text-slate-600">Enjoy all features during our beta phase</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Active
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
            <Link href="/portfolio">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg w-fit mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Portfolio</h3>
                  <p className="text-sm text-slate-600 mt-1">View & manage your investments</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ai-stock-analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-purple-50 rounded-lg w-fit mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">AI Stock Analytics</h3>
                  <p className="text-sm text-slate-600 mt-1">Research & analyze stocks</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/news">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-green-50 rounded-lg w-fit mx-auto mb-3">
                    <Newspaper className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Market News</h3>
                  <p className="text-sm text-slate-600 mt-1">Latest financial updates</p>
                </CardContent>
              </Card>
            </Link>



            <Link href="/search">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-orange-50 rounded-lg w-fit mx-auto mb-3">
                    <Search className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Stock Search</h3>
                  <p className="text-sm text-slate-600 mt-1">Find & explore stocks</p>
                </CardContent>
              </Card>
            </Link>
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

        {/* Empty State */}
        {portfolio.length === 0 && !initialLoading && (
          <div className="text-center py-12 mt-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Building Your Portfolio</h3>
              <p className="text-gray-600 mb-6">Add your first stock to begin tracking your investments and see detailed analytics.</p>
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

export default Dashboard;