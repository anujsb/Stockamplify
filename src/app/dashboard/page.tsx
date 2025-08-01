"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Eye, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Bell,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Target,
  Wallet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  // Mock data
  const portfolioData = [
    { name: 'AAPL', shares: 50, price: 175.43, change: 2.45, changePercent: 1.42, value: 8771.50 },
    { name: 'GOOGL', shares: 25, price: 140.85, change: -1.23, changePercent: -0.87, value: 3521.25 },
    { name: 'MSFT', shares: 40, price: 378.92, change: 4.67, changePercent: 1.25, value: 15156.80 },
    { name: 'TSLA', shares: 30, price: 248.50, change: -8.32, changePercent: -3.24, value: 7455.00 },
    { name: 'NVDA', shares: 15, price: 875.28, change: 12.45, changePercent: 1.44, value: 13129.20 }
  ];

  const watchlistData = [
    { name: 'AMD', price: 142.67, change: 3.24, changePercent: 2.32 },
    { name: 'META', price: 496.73, change: -2.45, changePercent: -0.49 },
    { name: 'NFLX', price: 598.32, change: 7.89, changePercent: 1.34 },
    { name: 'AMZN', price: 153.45, change: 1.23, changePercent: 0.81 }
  ];

  const chartData = [
    { time: '9:30', value: 48000 },
    { time: '10:00', value: 48500 },
    { time: '11:00', value: 47800 },
    { time: '12:00', value: 49200 },
    { time: '1:00', value: 48900 },
    { time: '2:00', value: 50100 },
    { time: '3:00', value: 49800 },
    { time: '4:00', value: 50450 }
  ];

  const pieData = [
    { name: 'MSFT', value: 30.1, color: '#3b82f6' },
    { name: 'NVDA', value: 26.0, color: '#10b981' },
    { name: 'AAPL', value: 17.4, color: '#f59e0b' },
    { name: 'TSLA', value: 14.8, color: '#ef4444' },
    { name: 'GOOGL', value: 11.7, color: '#8b5cf6' }
  ];

  const newsData = [
    { title: "Apple Reports Strong Q4 Earnings", time: "2 hours ago", sentiment: "positive" },
    { title: "Microsoft Azure Growth Accelerates", time: "4 hours ago", sentiment: "positive" },
    { title: "Tesla Faces Production Challenges", time: "6 hours ago", sentiment: "negative" },
    { title: "NVIDIA AI Chip Demand Surges", time: "8 hours ago", sentiment: "positive" }
  ];

  const totalValue = portfolioData.reduce((sum, stock) => sum + stock.value, 0);
  const totalChange = portfolioData.reduce((sum, stock) => sum + (stock.change * stock.shares), 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Portfolio Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="p-2 hover:bg-white rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
          </Button>
          <Button className="p-2 hover:bg-white rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today's Change</p>
              <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
              </p>
            </div>
            <div className={`${totalChange >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg`}>
              {totalChange >= 0 ? 
                <TrendingUp className="w-6 h-6 text-green-600" /> : 
                <TrendingDown className="w-6 h-6 text-red-600" />
              }
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Change %</p>
              <p className={`text-2xl font-bold ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Holdings</p>
              <p className="text-2xl font-bold text-slate-800">{portfolioData.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

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
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      selectedTimeframe === timeframe 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
              <Button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4 text-slate-600" />
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Portfolio Allocation</h2>
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
        </div>
      </div>

      {/* Holdings and Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Holdings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Top Holdings</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {portfolioData.map((stock) => (
              <div key={stock.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-slate-700">{stock.name}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{stock.name}</p>
                    <p className="text-sm text-slate-600">{stock.shares} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">${stock.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Watchlist</h2>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4 inline mr-1" />
              Add Symbol
            </button>
          </div>
          <div className="space-y-4">
            {watchlistData.map((stock) => (
              <div key={stock.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="font-medium text-slate-800">{stock.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">${stock.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Market News</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All News</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newsData.map((news, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-800 line-clamp-2">{news.title}</h3>
                <div className={`w-2 h-2 rounded-full ml-2 mt-2 ${
                  news.sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              <p className="text-sm text-slate-600">{news.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;