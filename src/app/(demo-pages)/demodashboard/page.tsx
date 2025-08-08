// "use client";

// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { SideBar } from '@/components/SideBar';
// import { cn } from '@/lib/utils';
// import { useUser } from '@clerk/nextjs';
// import { useRealTimePortfolio } from '@/lib/hooks/useRealTimePortfolio';
// import { 
//   Plus, RefreshCw, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, 
//   BarChart3, ArrowRight, AlertTriangle, Target, Calendar, Building2, 
//   Gauge, Zap, Shield, Brain, Settings, Filter, Download, Info
// } from 'lucide-react';
// import { 
//   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
//   PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter,
//   RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
//   LineChart, Line, ComposedChart, ReferenceLine, Legend
// } from 'recharts';
// import Link from 'next/link';

// const DemoDashboard = () => {
//   const { user } = useUser();
//   const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
//   const [selectedView, setSelectedView] = useState('overview');
//   const [refreshKey, setRefreshKey] = useState(0);

//   // Initial portfolio fetch - same as dashboard
//   useEffect(() => {
//     const fetchInitialPortfolio = async () => {
//       setInitialLoading(true);
//       try {
//         const res = await fetch('/api/portfolio');
//         const data = await res.json();
//         if (data.success) {
//           setInitialPortfolio(data.data);
//         }
//       } catch (err) {
//         console.error('Failed to fetch initial portfolio:', err);
//       } finally {
//         setInitialLoading(false);
//       }
//     };
//     fetchInitialPortfolio();
//   }, [refreshKey]);

//   // Use real-time portfolio hook
//   const {
//     portfolio,
//     status,
//     isLoading,
//     error,
//     refreshPortfolio
//   } = useRealTimePortfolio(initialPortfolio);

//   // Calculate advanced portfolio metrics
//   const calculateAdvancedMetrics = () => {
//     if (!portfolio.length) return null;

//     let totalInvested = 0;
//     let totalCurrentValue = 0;
//     let weightedPE = 0;
//     let weightedPB = 0;
//     let weightedROE = 0;
//     let sectorAllocations: { [key: string]: { value: number, count: number } } = {};
//     let peDistribution: number[] = [];
//     let riskReturnData: any[] = [];
//     let analystData: any[] = [];
//     let institutionalHoldings: any[] = [];
//     let financialHealthData: any[] = [];
//     let earningsCalendar: any[] = [];

//     portfolio.forEach(item => {
//       const invested = Number(item.buyPrice) * item.quantity;
//       const currentPrice = Number(item.realTimePrice?.price || 0);
//       const currentValue = currentPrice * item.quantity;
//       const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;

//       totalInvested += invested;
//       totalCurrentValue += currentValue;

//       // Sector allocation
//       const sector = item.stock?.sector || 'Other';
//       if (!sectorAllocations[sector]) {
//         sectorAllocations[sector] = { value: 0, count: 0 };
//       }
//       sectorAllocations[sector].value += currentValue;
//       sectorAllocations[sector].count += 1;

//       // PE distribution
//       if (item.fundamentalData?.trailingPE) {
//         peDistribution.push(Number(item.fundamentalData.trailingPE));
//       }

//       // Weighted metrics
//       const weight = currentValue / totalCurrentValue;
//       if (item.fundamentalData?.trailingPE) {
//         weightedPE += Number(item.fundamentalData.trailingPE) * weight;
//       }
//       if (item.fundamentalData?.priceToBook) {
//         weightedPB += Number(item.fundamentalData.priceToBook) * weight;
//       }
//       if (item.financialData?.returnOnEquity) {
//         weightedROE += Number(item.financialData.returnOnEquity) * weight * 100;
//       }

//       // Risk-Return data
//       const volatility = Math.random() * 30 + 10; // Mock volatility since we don't have historical data
//       riskReturnData.push({
//         symbol: item.stock?.symbol,
//         risk: volatility,
//         return: returnPct,
//         size: currentValue,
//         sector: sector
//       });

//       // Analyst data
//       if (item.analystRating?.targetPriceHigh) {
//         const upside = ((Number(item.analystRating.targetPriceHigh) - currentPrice) / currentPrice) * 100;
//         analystData.push({
//           symbol: item.stock?.symbol,
//           currentPrice: currentPrice,
//           targetHigh: Number(item.analystRating.targetPriceHigh),
//           targetLow: Number(item.analystRating.targetLowPrice || 0),
//           upside: upside,
//           recommendation: item.analystRating.recommendation
//         });
//       }

//       // Institutional holdings
//       if (item.statistics?.sharesHeldByInstitutions) {
//         institutionalHoldings.push({
//           symbol: item.stock?.symbol,
//           institutional: Number(item.statistics.sharesHeldByInstitutions),
//           insider: Number(item.statistics.sharesHeldByAllInsider || 0),
//           retail: 100 - Number(item.statistics.sharesHeldByInstitutions) - Number(item.statistics.sharesHeldByAllInsider || 0)
//         });
//       }

//       // Financial health radar
//       if (item.financialData) {
//         financialHealthData.push({
//           symbol: item.stock?.symbol,
//           currentRatio: Number(item.financialData.currentRatio || 0),
//           quickRatio: Number(item.financialData.quickRatio || 0),
//           debtToEquity: Math.min(Number(item.financialData.debtToEquity || 0), 2), // Cap at 2 for chart
//           roe: Number(item.financialData.returnOnEquity || 0) * 100,
//           profitMargin: Number(item.financialData.profitMargin || 0) * 100,
//           revenueGrowth: Number(item.financialData.revenueGrowth || 0) * 100
//         });
//       }

//       // Earnings calendar
//       if (item.statistics?.earningsDate) {
//         const daysUntil = Math.floor((new Date(item.statistics.earningsDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
//         earningsCalendar.push({
//           symbol: item.stock?.symbol,
//           date: item.statistics.earningsDate,
//           daysUntil: daysUntil
//         });
//       }
//     });

//     return {
//       totalInvested,
//       totalCurrentValue,
//       totalGainLoss: totalCurrentValue - totalInvested,
//       totalGainLossPercentage: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
//       weightedPE,
//       weightedPB,
//       weightedROE,
//       sectorAllocations,
//       peDistribution,
//       riskReturnData,
//       analystData,
//       institutionalHoldings,
//       financialHealthData,
//       earningsCalendar
//     };
//   };

//   const metrics = calculateAdvancedMetrics();
//   const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

//   // 52-week range data
//   const get52WeekRangeData = () => {
//     return portfolio.map(item => {
//       const currentPrice = Number(item.realTimePrice?.price || 0);
//       const high = Number(item.intradayPrice?.fiftyTwoWeekHigh || currentPrice);
//       const low = Number(item.intradayPrice?.fiftyTwoWeekLow || currentPrice);
//       const position = high > low ? ((currentPrice - low) / (high - low)) * 100 : 50;
      
//       return {
//         symbol: item.stock?.symbol,
//         current: currentPrice,
//         high: high,
//         low: low,
//         position: position,
//         range: high - low
//       };
//     });
//   };

//   // Sector performance data
//   const getSectorPerformanceData = () => {
//     if (!metrics) return [];
    
//     return Object.entries(metrics.sectorAllocations).map(([sector, data]) => ({
//       sector,
//       allocation: (data.value / metrics.totalCurrentValue) * 100,
//       performance: Math.random() * 20 - 10, // Mock performance data
//       '1D': Math.random() * 4 - 2,
//       '1W': Math.random() * 8 - 4,
//       '1M': Math.random() * 15 - 7.5,
//       '3M': Math.random() * 25 - 12.5,
//       '1Y': Math.random() * 40 - 20
//     }));
//   };

//   const formatPrice = (value: number) => `₹${Number(value).toFixed(2)}`;
//   const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

//   const sectorData = getSectorPerformanceData();
//   const rangeData = get52WeekRangeData();

//   if (initialLoading) {
//     return (
//       <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
//         <SideBar />
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
//             <p className="text-lg font-medium">Loading advanced analytics...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={cn(
//       "flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row",
//       "min-h-screen"
//     )}>
//       <SideBar />
//       <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-slate-800">Advanced Portfolio Analytics</h1>
//             <p className="text-slate-600 mt-1">Comprehensive analysis of your investment portfolio</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex bg-slate-100 rounded-lg p-1">
//               {['overview', 'risk', 'fundamentals', 'technical'].map((view) => (
//                 <button
//                   key={view}
//                   onClick={() => setSelectedView(view)}
//                   className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
//                     selectedView === view
//                       ? 'bg-white text-slate-800 shadow-sm'
//                       : 'text-slate-600 hover:text-slate-800'
//                   }`}
//                 >
//                   {view}
//                 </button>
//               ))}
//             </div>
//             <Button
//               onClick={refreshPortfolio}
//               variant="outline"
//               className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
//             </Button>
//           </div>
//         </div>

//         {portfolio.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
//               <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
//               <p className="text-gray-600 mb-6">Add stocks to your portfolio to see advanced analytics.</p>
//               <Link href="/portfolio">
//                 <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
//                   <Plus className="w-4 h-4" />
//                   Go to Portfolio
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Key Metrics Cards */}
//             {metrics && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
//                         <p className="text-2xl font-bold text-gray-900">{formatPrice(metrics.totalCurrentValue)}</p>
//                         <p className={`text-sm ${metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                           {formatPrice(metrics.totalGainLoss)} ({formatPercentage(metrics.totalGainLossPercentage)})
//                         </p>
//                       </div>
//                       <TrendingUp className="h-8 w-8 text-blue-600" />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-gray-600">Avg P/E Ratio</p>
//                         <p className="text-2xl font-bold text-gray-900">{metrics.weightedPE.toFixed(1)}</p>
//                         <p className="text-sm text-gray-500">Market: 22.5</p>
//                       </div>
//                       <BarChart3 className="h-8 w-8 text-green-600" />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-gray-600">Avg ROE</p>
//                         <p className="text-2xl font-bold text-gray-900">{metrics.weightedROE.toFixed(1)}%</p>
//                         <p className="text-sm text-gray-500">Benchmark: 15%</p>
//                       </div>
//                       <Target className="h-8 w-8 text-purple-600" />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm font-medium text-gray-600">Diversification</p>
//                         <p className="text-2xl font-bold text-gray-900">{Object.keys(metrics.sectorAllocations).length}</p>
//                         <p className="text-sm text-gray-500">Sectors</p>
//                       </div>
//                       <PieChartIcon className="h-8 w-8 text-orange-600" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {/* Main Analytics Grid */}
//             {selectedView === 'overview' && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Risk-Return Scatter Plot */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Shield className="h-5 w-5 text-blue-600" />
//                       Risk vs Return Analysis
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-80">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <ScatterChart data={metrics?.riskReturnData || []}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="risk" name="Risk %" />
//                           <YAxis dataKey="return" name="Return %" />
//                           <Tooltip 
//                             formatter={(value: number, name: string) => [
//                               name === 'return' ? formatPercentage(value) : `${value.toFixed(1)}%`,
//                               name === 'return' ? 'Return' : 'Risk'
//                             ]}
//                             labelFormatter={(label) => `${label}`}
//                           />
//                           <Scatter dataKey="return" fill="#3b82f6">
//                             {metrics?.riskReturnData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//                             ))}
//                           </Scatter>
//                         </ScatterChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Analyst Targets */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Target className="h-5 w-5 text-green-600" />
//                       Analyst Price Targets
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {metrics?.analystData.slice(0, 5).map((stock) => (
//                         <div key={stock.symbol} className="space-y-2">
//                           <div className="flex justify-between items-center">
//                             <span className="font-medium">{stock.symbol}</span>
//                             <span className={`text-sm px-2 py-1 rounded ${
//                               stock.upside > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                             }`}>
//                               {formatPercentage(stock.upside)} upside
//                             </span>
//                           </div>
//                           <div className="relative">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className="bg-blue-600 h-2 rounded-full"
//                                 style={{ 
//                                   width: `${Math.min(100, Math.max(0, ((stock.currentPrice - stock.targetLow) / (stock.targetHigh - stock.targetLow)) * 100))}%` 
//                                 }}
//                               ></div>
//                             </div>
//                             <div className="flex justify-between text-xs text-gray-500 mt-1">
//                               <span>{formatPrice(stock.targetLow)}</span>
//                               <span className="font-medium">{formatPrice(stock.currentPrice)}</span>
//                               <span>{formatPrice(stock.targetHigh)}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Sector Performance Heatmap */}
//                 <Card className="bg-white shadow-sm border border-slate-200 lg:col-span-2">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Building2 className="h-5 w-5 text-purple-600" />
//                       Sector Performance Heatmap
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-3">
//                       {sectorData.map((sector) => (
//                         <div key={sector.sector} className="grid grid-cols-7 gap-2 items-center">
//                           <div className="font-medium text-sm">{sector.sector}</div>
//                           {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
//                             <div
//                               key={period}
//                               className={`text-center p-2 rounded text-xs font-medium ${
//                                 sector[period as keyof typeof sector] > 0
//                                   ? 'bg-green-100 text-green-800'
//                                   : 'bg-red-100 text-red-800'
//                               }`}
//                             >
//                               {formatPercentage(sector[period as keyof typeof sector] as number)}
//                             </div>
//                           ))}
//                           <div className="text-sm text-gray-600">
//                             {sector.allocation.toFixed(1)}%
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {selectedView === 'fundamentals' && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Financial Health Radar */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Gauge className="h-5 w-5 text-blue-600" />
//                       Financial Health Radar
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-80">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <RadarChart data={[
//                           { metric: 'Current Ratio', value: 85, fullMark: 100 },
//                           { metric: 'ROE', value: 75, fullMark: 100 },
//                           { metric: 'Profit Margin', value: 68, fullMark: 100 },
//                           { metric: 'Revenue Growth', value: 72, fullMark: 100 },
//                           { metric: 'Debt/Equity', value: 60, fullMark: 100 },
//                           { metric: 'Quick Ratio', value: 78, fullMark: 100 }
//                         ]}>
//                           <PolarGrid />
//                           <PolarAngleAxis dataKey="metric" />
//                           <PolarRadiusAxis angle={90} domain={[0, 100]} />
//                           <Radar 
//                             name="Portfolio Average" 
//                             dataKey="value" 
//                             stroke="#3b82f6" 
//                             fill="#3b82f6" 
//                             fillOpacity={0.2} 
//                           />
//                         </RadarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* P/E Distribution */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <BarChart3 className="h-5 w-5 text-green-600" />
//                       P/E Ratio Distribution
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-80">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={[
//                           { range: '0-10', count: 0, color: '#10b981' },
//                           { range: '10-20', count: 2, color: '#3b82f6' },
//                           { range: '20-30', count: portfolio.length - 2, color: '#f59e0b' },
//                           { range: '30-40', count: 0, color: '#ef4444' },
//                           { range: '40+', count: 0, color: '#8b5cf6' }
//                         ]}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="range" />
//                           <YAxis />
//                           <Tooltip />
//                           <Bar dataKey="count" fill="#3b82f6" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Institutional Holdings */}
//                 <Card className="bg-white shadow-sm border border-slate-200 lg:col-span-2">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Building2 className="h-5 w-5 text-orange-600" />
//                       Institutional vs Retail Holdings
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {metrics?.institutionalHoldings.slice(0, 5).map((stock) => (
//                         <div key={stock.symbol} className="space-y-2">
//                           <div className="flex justify-between">
//                             <span className="font-medium">{stock.symbol}</span>
//                             <span className="text-sm text-gray-600">
//                               {stock.institutional.toFixed(1)}% institutional
//                             </span>
//                           </div>
//                           <div className="flex h-4 bg-gray-200 rounded">
//                             <div 
//                               className="bg-blue-500 rounded-l"
//                               style={{ width: `${stock.institutional}%` }}
//                             />
//                             <div 
//                               className="bg-green-500"
//                               style={{ width: `${stock.insider}%` }}
//                             />
//                             <div 
//                               className="bg-gray-400 rounded-r"
//                               style={{ width: `${stock.retail}%` }}
//                             />
//                           </div>
//                           <div className="flex justify-between text-xs text-gray-500">
//                             <span>Institutions ({stock.institutional.toFixed(1)}%)</span>
//                             <span>Insiders ({stock.insider.toFixed(1)}%)</span>
//                             <span>Retail ({stock.retail.toFixed(1)}%)</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {selectedView === 'technical' && (
//               <div className="grid grid-cols-1 gap-8">
//                 {/* 52-Week Range Position */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Activity className="h-5 w-5 text-purple-600" />
//                       52-Week Range Position
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-4">
//                       {rangeData.map((stock) => (
//                         <div key={stock.symbol} className="space-y-2">
//                           <div className="flex justify-between items-center">
//                             <span className="font-medium">{stock.symbol}</span>
//                             <span className="text-sm text-gray-600">
//                               {formatPrice(stock.current)} ({stock.position.toFixed(1)}% of range)
//                             </span>
//                           </div>
//                           <div className="relative">
//                             <div className="w-full bg-gray-200 rounded-full h-3">
//                               <div 
//                                 className={`h-3 rounded-full ${
//                                   stock.position > 75 ? 'bg-green-500' :
//                                   stock.position > 50 ? 'bg-blue-500' :
//                                   stock.position > 25 ? 'bg-yellow-500' : 'bg-red-500'
//                                 }`}
//                                 style={{ width: `${stock.position}%` }}
//                               ></div>
//                             </div>
//                             <div className="flex justify-between text-xs text-gray-500 mt-1">
//                               <span>52W Low: {formatPrice(stock.low)}</span>
//                               <span>52W High: {formatPrice(stock.high)}</span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {selectedView === 'risk' && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Portfolio Concentration */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <PieChartIcon className="h-5 w-5 text-red-600" />
//                       Concentration Risk
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-center mb-4">
//                       <div className="text-3xl font-bold text-green-600">Low</div>
//                       <div className="text-sm text-gray-600">Well diversified portfolio</div>
//                     </div>
//                     <div className="space-y-3">
//                       <div className="flex justify-between">
//                         <span>Top holding weight:</span>
//                         <span className="font-medium">
//                           {metrics ? Math.max(...Object.values(metrics.sectorAllocations).map(s => (s.value / metrics.totalCurrentValue) * 100)).toFixed(1) : '0'}%
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Top 3 holdings:</span>
//                         <span className="font-medium">
//                           {metrics ? 
//                             Object.values(metrics.sectorAllocations)
//                               .sort((a, b) => b.value - a.value)
//                               .slice(0, 3)
//                               .reduce((sum, sector) => sum + (sector.value / metrics.totalCurrentValue) * 100, 0)
//                               .toFixed(1) 
//                             : '0'
//                           }%
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Number of sectors:</span>
//                         <span className="font-medium">{metrics ? Object.keys(metrics.sectorAllocations).length : 0}</span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Beta Analysis */}
//                 <Card className="bg-white shadow-sm border border-slate-200">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <TrendingUp className="h-5 w-5 text-blue-600" />
//                       Market Sensitivity (Beta)
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="h-80">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={portfolio.slice(0, 5).map(item => ({
//                           symbol: item.stock?.symbol,
//                           beta: 0.8 + Math.random() * 0.6, // Mock beta data
//                           allocation: ((Number(item.realTimePrice?.price || 0) * item.quantity) / (metrics?.totalCurrentValue || 1)) * 100
//                         }))}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="symbol" />
//                           <YAxis />
//                           <Tooltip formatter={(value: number) => [value.toFixed(2), 'Beta']} />
//                           <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="3 3" />
//                           <Bar dataKey="beta" fill="#3b82f6" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                     <div className="text-center mt-4">
//                       <div className="text-lg font-semibold">Portfolio Beta: 1.05</div>
//                       <div className="text-sm text-gray-600">Slightly more volatile than market</div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Correlation Matrix */}
//                 <Card className="bg-white shadow-sm border border-slate-200 lg:col-span-2">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                       <Brain className="h-5 w-5 text-purple-600" />
//                       Correlation Matrix (Diversification Analysis)
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-6 gap-1 text-xs">
//                       {/* Header row */}
//                       <div></div>
//                       {portfolio.slice(0, 5).map(item => (
//                         <div key={item.stock?.symbol} className="text-center font-medium p-1">
//                           {item.stock?.symbol}
//                         </div>
//                       ))}
                      
//                       {/* Correlation data rows */}
//                       {portfolio.slice(0, 5).map((item1, i) => (
//                         <React.Fragment key={item1.stock?.symbol}>
//                           <div className="font-medium p-1">{item1.stock?.symbol}</div>
//                           {portfolio.slice(0, 5).map((item2, j) => {
//                             const correlation = i === j ? 1 : 0.2 + Math.random() * 0.6; // Mock correlation
//                             return (
//                               <div 
//                                 key={item2.stock?.symbol}
//                                 className={`text-center p-1 rounded ${
//                                   correlation > 0.7 ? 'bg-red-200 text-red-800' :
//                                   correlation > 0.4 ? 'bg-yellow-200 text-yellow-800' :
//                                   'bg-green-200 text-green-800'
//                                 }`}
//                               >
//                                 {correlation.toFixed(2)}
//                               </div>
//                             );
//                           })}
//                         </React.Fragment>
//                       ))}
//                     </div>
//                     <div className="mt-4 flex justify-center space-x-6 text-sm">
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
//                         <span>Low correlation (&lt;0.4)</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
//                         <span>Medium correlation (0.4-0.7)</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
//                         <span>High correlation (&gt;0.7)</span>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {/* Smart Alerts Panel - Always visible */}
//             <Card className="bg-white shadow-sm border border-slate-200 mt-8">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Zap className="h-5 w-5 text-yellow-600" />
//                   Smart Alerts & Recommendations
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {/* Breakout Alert */}
//                   <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <TrendingUp className="h-4 w-4 text-green-600" />
//                       <span className="font-medium text-green-800">Breakout Alert</span>
//                     </div>
//                     <p className="text-sm text-green-700">
//                       {portfolio[0]?.stock?.symbol || 'STOCK'} is trading near 52-week high with high volume
//                     </p>
//                   </div>

//                   {/* Earnings Alert */}
//                   <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Calendar className="h-4 w-4 text-blue-600" />
//                       <span className="font-medium text-blue-800">Earnings Coming</span>
//                     </div>
//                     <p className="text-sm text-blue-700">
//                       {portfolio.length > 1 ? portfolio[1]?.stock?.symbol || 'STOCK' : 'STOCK'} earnings in 5 days - expect volatility
//                     </p>
//                   </div>

//                   {/* Rebalancing Suggestion */}
//                   <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Settings className="h-4 w-4 text-orange-600" />
//                       <span className="font-medium text-orange-800">Rebalancing</span>
//                     </div>
//                     <p className="text-sm text-orange-700">
//                       Consider reducing {portfolio[0]?.stock?.sector || 'Technology'} exposure - currently overweight
//                     </p>
//                   </div>

//                   {/* Valuation Alert */}
//                   <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Target className="h-4 w-4 text-purple-600" />
//                       <span className="font-medium text-purple-800">Valuation Check</span>
//                     </div>
//                     <p className="text-sm text-purple-700">
//                       Portfolio P/E ratio above market average - review fundamentals
//                     </p>
//                   </div>

//                   {/* Dividend Alert */}
//                   <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Activity className="h-4 w-4 text-emerald-600" />
//                       <span className="font-medium text-emerald-800">Dividend Income</span>
//                     </div>
//                     <p className="text-sm text-emerald-700">
//                       Expected dividend income this quarter: ₹{((metrics?.totalCurrentValue || 0) * 0.02).toFixed(0)}
//                     </p>
//                   </div>

//                   {/* Risk Alert */}
//                   <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <AlertTriangle className="h-4 w-4 text-red-600" />
//                       <span className="font-medium text-red-800">Risk Monitor</span>
//                     </div>
//                     <p className="text-sm text-red-700">
//                       High correlation detected between top holdings - consider diversification
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex justify-center mt-8 space-x-4">
//               <Button variant="outline" className="flex items-center gap-2">
//                 <Download className="h-4 w-4" />
//                 Export Report
//               </Button>
//               <Button variant="outline" className="flex items-center gap-2">
//                 <Settings className="h-4 w-4" />
//                 Customize Dashboard
//               </Button>
//               <Link href="/portfolio">
//                 <Button className="flex items-center gap-2">
//                   <ArrowRight className="h-4 w-4" />
//                   Manage Portfolio
//                 </Button>
//               </Link>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DemoDashboard;



"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SideBar } from '@/components/SideBar';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useRealTimePortfolio } from '@/lib/hooks/useRealTimePortfolio';
import { 
  Plus, RefreshCw, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon, 
  BarChart3, ArrowRight, AlertTriangle, Target, Calendar, Building2, 
  Gauge, Zap, Shield, Brain, Settings, Filter, Download, Info, 
  Eye, DollarSign, Percent, Users, Bell, Award, Clock, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ComposedChart, ReferenceLine, Legend, Treemap
} from 'recharts';
import Link from 'next/link';

const DemoDashboard = () => {
  const { user } = useUser();
  const [initialPortfolio, setInitialPortfolio] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [selectedView, setSelectedView] = useState('overview');
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

  // Advanced analytics calculations
  const calculateAllMetrics = () => {
    if (!portfolio.length) return null;

    let totalInvested = 0;
    let totalCurrentValue = 0;
    let weightedPE = 0;
    let weightedPB = 0;
    let weightedROE = 0;
    let weightedBeta = 0;
    let totalDividendYield = 0;

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#f97316', '#06b6d4'];

    // Data containers
    const sectorAllocations: { [key: string]: { value: number, count: number, performance: number } } = {};
    const riskReturnData: any[] = [];
    const analystTargetData: any[] = [];
    const institutionalHoldingsData: any[] = [];
    const financialHealthData: any[] = [];
    const earningsCalendarData: any[] = [];
    const movingAverageData: any[] = [];
    const valuationMetrics: any[] = [];
    const dividendData: any[] = [];
    const marketCapData: any[] = [];
    const volumeAnalysisData: any[] = [];
    const peDistributionData: any[] = [];
    const correlationData: any[] = [];
    const betaData: any[] = [];

    portfolio.forEach((item, index) => {
      const invested = Number(item.buyPrice) * item.quantity;
      const currentPrice = Number(item.realTimePrice?.price || item.buyPrice);
      const currentValue = currentPrice * item.quantity;
      const returnPct = invested > 0 ? ((currentValue - invested) / invested) * 100 : 0;
      const weight = currentValue / (totalCurrentValue || 1);

      totalInvested += invested;
      totalCurrentValue += currentValue;

      const sector = item.stock?.sector || 'Other';
      const symbol = item.stock?.symbol || 'N/A';

      // Sector allocations
      if (!sectorAllocations[sector]) {
        sectorAllocations[sector] = { value: 0, count: 0, performance: 0 };
      }
      sectorAllocations[sector].value += currentValue;
      sectorAllocations[sector].count += 1;
      sectorAllocations[sector].performance += returnPct;

      // Risk-Return Analysis
      const volatility = 15 + Math.random() * 25; // Mock volatility
      const beta = 0.7 + Math.random() * 0.8;
      const alpha = returnPct - (beta * 12); // Assuming 12% market return
      
      riskReturnData.push({
        symbol,
        risk: volatility,
        return: returnPct,
        size: currentValue,
        sector,
        beta,
        alpha,
        color: colors[index % colors.length]
      });

      weightedBeta += beta * weight;

      // Analyst Targets
      if (item.analystRating?.targetPriceHigh) {
        const upside = ((Number(item.analystRating.targetPriceHigh) - currentPrice) / currentPrice) * 100;
        analystTargetData.push({
          symbol,
          currentPrice,
          targetHigh: Number(item.analystRating.targetPriceHigh),
          targetLow: Number(item.analystRating.targetLowPrice || currentPrice * 0.8),
          upside,
          recommendation: item.analystRating.recommendation,
          analysts: Number(item.analystRating.numberOfAnalysts || 0)
        });
      }

      // Financial Health Radar
      if (item.financialData) {
        const healthScore = {
          symbol,
          currentRatio: Math.min(Number(item.financialData.currentRatio || 0), 3) * 33.33,
          quickRatio: Math.min(Number(item.financialData.quickRatio || 0), 2) * 50,
          debtToEquity: Math.max(0, 100 - (Number(item.financialData.debtToEquity || 0) * 50)),
          roe: Math.min(Number(item.financialData.returnOnEquity || 0) * 500, 100),
          profitMargin: Math.min(Number(item.financialData.profitMargin || 0) * 500, 100),
          revenueGrowth: Math.min(Math.max(Number(item.financialData.revenueGrowth || 0) * 200 + 50, 0), 100)
        };
        financialHealthData.push(healthScore);
        
        weightedROE += Number(item.financialData.returnOnEquity || 0) * weight * 100;
      }

      // Institutional Holdings
      if (item.statistics?.sharesHeldByInstitutions) {
        const institutional = Number(item.statistics.sharesHeldByInstitutions);
        const insider = Number(item.statistics.sharesHeldByAllInsider || 0);
        const retail = Math.max(0, 100 - institutional - insider);
        
        institutionalHoldingsData.push({
          symbol,
          institutional,
          insider,
          retail,
          institutionalCategory: institutional > 70 ? 'High' : institutional > 40 ? 'Medium' : 'Low'
        });
      }

      // Earnings Calendar
      if (item.statistics?.earningsDate) {
        const daysUntil = Math.floor((new Date(item.statistics.earningsDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        earningsCalendarData.push({
          symbol,
          date: item.statistics.earningsDate,
          daysUntil,
          urgency: daysUntil <= 7 ? 'High' : daysUntil <= 30 ? 'Medium' : 'Low'
        });
      }

      // Moving Average Analysis
      if (item.intradayPrice) {
        const ma50 = Number(item.intradayPrice.fiftyDayMovingAverage || currentPrice);
        const ma200 = Number(item.intradayPrice.twoHundredDayMovingAverage || currentPrice);
        
        movingAverageData.push({
          symbol,
          currentPrice,
          ma50,
          ma200,
          ma50Signal: currentPrice > ma50 ? 'Bullish' : 'Bearish',
          ma200Signal: currentPrice > ma200 ? 'Bullish' : 'Bearish',
          goldenCross: ma50 > ma200,
          priceVsMa50: ((currentPrice - ma50) / ma50) * 100,
          priceVsMa200: ((currentPrice - ma200) / ma200) * 100
        });
      }

      // Valuation Metrics
      if (item.fundamentalData) {
        const pe = Number(item.fundamentalData.trailingPE || 0);
        const pb = Number(item.fundamentalData.priceToBook || 0);
        const forwardPE = Number(item.fundamentalData.forwardPE || 0);
        
        weightedPE += pe * weight;
        weightedPB += pb * weight;
        
        valuationMetrics.push({
          symbol,
          trailingPE: pe,
          forwardPE,
          priceToBook: pb,
          peCategory: pe < 15 ? 'Undervalued' : pe < 25 ? 'Fair' : 'Overvalued',
          pbCategory: pb < 1.5 ? 'Undervalued' : pb < 3 ? 'Fair' : 'Overvalued'
        });

        // PE Distribution
        if (pe > 0 && pe < 100) {
          const peRange = pe < 10 ? '0-10' : pe < 15 ? '10-15' : pe < 20 ? '15-20' : pe < 25 ? '20-25' : pe < 30 ? '25-30' : '30+';
          const existing = peDistributionData.find(p => p.range === peRange);
          if (existing) {
            existing.count++;
          } else {
            peDistributionData.push({ range: peRange, count: 1, avgPE: pe });
          }
        }
      }

      // Dividend Analysis
      if (item.statistics?.lastDividendValue) {
        const dividendYield = (Number(item.statistics.lastDividendValue) / currentPrice) * 100;
        totalDividendYield += dividendYield * weight;
        
        dividendData.push({
          symbol,
          dividendYield,
          lastDividend: Number(item.statistics.lastDividendValue),
          lastDividendDate: item.statistics.lastDividendDate,
          annualDividend: Number(item.statistics.lastDividendValue) * 4, // Assuming quarterly
          category: dividendYield > 4 ? 'High Yield' : dividendYield > 2 ? 'Medium Yield' : 'Low Yield'
        });
      }

      // Market Cap Analysis
      if (item.intradayPrice?.marketCap) {
        const marketCap = Number(item.intradayPrice.marketCap);
        const marketCapCrores = marketCap / 10000000;
        
        marketCapData.push({
          symbol,
          marketCap: marketCapCrores,
          size: marketCapCrores > 100000 ? 'Large Cap' : 
                marketCapCrores > 20000 ? 'Mid Cap' : 'Small Cap',
          value: currentValue,
          weight: (currentValue / totalCurrentValue) * 100
        });
      }

      // Volume Analysis
      if (item.realTimePrice?.volume && item.intradayPrice?.averageDailyVolume3Month) {
        const currentVolume = Number(item.realTimePrice.volume);
        const avgVolume = Number(item.intradayPrice.averageDailyVolume3Month);
        const volumeRatio = currentVolume / avgVolume;
        
        volumeAnalysisData.push({
          symbol,
          currentVolume,
          avgVolume,
          volumeRatio,
          activity: volumeRatio > 2 ? 'High' : volumeRatio > 1.5 ? 'Above Average' : 
                   volumeRatio > 0.5 ? 'Normal' : 'Low',
          signal: volumeRatio > 2 && returnPct > 0 ? 'Strong Buy Signal' :
                  volumeRatio > 2 && returnPct < 0 ? 'Strong Sell Signal' : 'Normal'
        });
      }
    });

    // Calculate sector performance heatmap
    const sectorPerformanceData = Object.entries(sectorAllocations).map(([sector, data]) => ({
      sector,
      allocation: (data.value / totalCurrentValue) * 100,
      avgPerformance: data.performance / data.count,
      '1D': -2 + Math.random() * 4,
      '1W': -5 + Math.random() * 10,
      '1M': -10 + Math.random() * 20,
      '3M': -15 + Math.random() * 30,
      '1Y': -25 + Math.random() * 50,
      count: data.count
    }));

    // Generate correlation matrix
    const symbols = portfolio.slice(0, 8).map(p => p.stock?.symbol || 'N/A');
    const correlationMatrix = symbols.map((symbol1, i) => {
      const row: any = { symbol: symbol1 };
      symbols.forEach((symbol2, j) => {
        row[symbol2] = i === j ? 1 : 0.1 + Math.random() * 0.8;
      });
      return row;
    });

    // 52-Week Range Analysis
    const weekRangeData = portfolio.map(item => {
      const currentPrice = Number(item.realTimePrice?.price || item.buyPrice);
      const high = Number(item.intradayPrice?.fiftyTwoWeekHigh || currentPrice * 1.2);
      const low = Number(item.intradayPrice?.fiftyTwoWeekLow || currentPrice * 0.8);
      const position = high > low ? ((currentPrice - low) / (high - low)) * 100 : 50;
      
      return {
        symbol: item.stock?.symbol,
        current: currentPrice,
        high,
        low,
        position,
        range: high - low,
        signal: position > 80 ? 'Near High' : position < 20 ? 'Near Low' : 'Mid Range',
        momentum: position > 70 ? 'Strong' : position > 30 ? 'Moderate' : 'Weak'
      };
    });

    // Portfolio diversification metrics
    const herfindahlIndex = Object.values(sectorAllocations)
      .reduce((sum, sector) => sum + Math.pow((sector.value / totalCurrentValue), 2), 0);
    
    const concentrationRisk = herfindahlIndex > 0.25 ? 'High' : herfindahlIndex > 0.15 ? 'Medium' : 'Low';
    
    // Smart alerts generation
    const alerts = generateSmartAlerts(portfolio, {
      weekRangeData,
      volumeAnalysisData,
      earningsCalendarData,
      analystTargetData,
      valuationMetrics,
      concentrationRisk
    });

    return {
      // Basic metrics
      totalInvested,
      totalCurrentValue,
      totalGainLoss: totalCurrentValue - totalInvested,
      totalGainLossPercentage: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
      
      // Weighted averages
      weightedPE: weightedPE || 0,
      weightedPB: weightedPB || 0,
      weightedROE: weightedROE || 0,
      weightedBeta: weightedBeta || 1,
      totalDividendYield: totalDividendYield || 0,
      
      // Chart data
      sectorAllocations,
      sectorPerformanceData,
      riskReturnData,
      analystTargetData,
      institutionalHoldingsData,
      financialHealthData,
      earningsCalendarData,
      movingAverageData,
      valuationMetrics,
      dividendData,
      marketCapData,
      volumeAnalysisData,
      peDistributionData,
      correlationMatrix,
      weekRangeData,
      
      // Risk metrics
      concentrationRisk,
      herfindahlIndex,
      portfolioBeta: weightedBeta,
      
      // Alerts
      alerts
    };
  };

  // Generate smart alerts
  const generateSmartAlerts = (portfolio: any[], data: any) => {
    const alerts = [];
    
    // Breakout alerts
    data.weekRangeData.forEach((stock: any) => {
      if (stock.position > 95) {
        alerts.push({
          type: 'breakout',
          severity: 'high',
          title: '52-Week High Breakout',
          message: `${stock.symbol} is trading at new 52-week highs`,
          icon: TrendingUp,
          color: 'green'
        });
      }
    });

    // Volume spike alerts
    data.volumeAnalysisData.forEach((stock: any) => {
      if (stock.volumeRatio > 3) {
        alerts.push({
          type: 'volume',
          severity: 'medium',
          title: 'Unusual Volume Activity',
          message: `${stock.symbol} has ${stock.volumeRatio.toFixed(1)}x normal volume`,
          icon: Activity,
          color: 'blue'
        });
      }
    });

    // Earnings alerts
    data.earningsCalendarData.forEach((stock: any) => {
      if (stock.daysUntil <= 7 && stock.daysUntil > 0) {
        alerts.push({
          type: 'earnings',
          severity: 'medium',
          title: 'Earnings This Week',
          message: `${stock.symbol} reports earnings in ${stock.daysUntil} days`,
          icon: Calendar,
          color: 'purple'
        });
      }
    });

    // Concentration risk
    if (data.concentrationRisk === 'High') {
      alerts.push({
        type: 'risk',
        severity: 'high',
        title: 'High Concentration Risk',
        message: 'Consider diversifying across more sectors',
        icon: AlertTriangle,
        color: 'red'
      });
    }

    // Analyst upgrade opportunities
    data.analystTargetData.forEach((stock: any) => {
      if (stock.upside > 20) {
        alerts.push({
          type: 'opportunity',
          severity: 'low',
          title: 'High Upside Potential',
          message: `${stock.symbol} has ${stock.upside.toFixed(0)}% analyst upside`,
          icon: Target,
          color: 'green'
        });
      }
    });

    return alerts.slice(0, 8); // Limit to 8 alerts
  };

  const metrics = calculateAllMetrics();
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  const formatPrice = (value: number) => `₹${Number(value).toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const formatLargeNumber = (value: number) => {
    if (value > 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value > 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toFixed(0)}`;
  };

  if (initialLoading) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row min-h-screen">
        <SideBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading advanced analytics...</p>
          </div>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Advanced Portfolio Analytics</h1>
            <p className="text-slate-600 mt-1">Professional-grade investment analysis and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-lg p-1">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'performance', label: 'Performance', icon: TrendingUp },
                { key: 'fundamentals', label: 'Fundamentals', icon: BarChart3 },
                { key: 'technical', label: 'Technical', icon: Activity },
                { key: 'risk', label: 'Risk', icon: Shield }
              ].map((view) => (
                <button
                  key={view.key}
                  onClick={() => setSelectedView(view.key)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    selectedView === view.key
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <view.icon className="w-3 h-3" />
                  {view.label}
                </button>
              ))}
            </div>
            <Button
              onClick={refreshPortfolio}
              variant="outline"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
              <p className="text-gray-600 mb-6">Add stocks to your portfolio to see advanced analytics.</p>
              <Link href="/portfolio">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors">
                  <Plus className="w-4 h-4" />
                  Go to Portfolio
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Key Performance Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Portfolio Value</p>
                        <p className="text-xl font-bold text-blue-900">{formatLargeNumber(metrics.totalCurrentValue)}</p>
                        <p className={`text-xs ${metrics.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(metrics.totalGainLossPercentage)}
                        </p>
                      </div>
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Avg P/E</p>
                        <p className="text-xl font-bold text-green-900">{metrics.weightedPE.toFixed(1)}</p>
                        <p className="text-xs text-green-600">vs Market: 22.5</p>
                      </div>
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Avg ROE</p>
                        <p className="text-xl font-bold text-purple-900">{metrics.weightedROE.toFixed(1)}%</p>
                        <p className="text-xs text-purple-600">Excellent</p>
                      </div>
                      <Percent className="h-6 w-6 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Portfolio Beta</p>
                        <p className="text-xl font-bold text-orange-900">{metrics.portfolioBeta.toFixed(2)}</p>
                        <p className="text-xs text-orange-600">
                          {metrics.portfolioBeta > 1 ? 'Aggressive' : 'Conservative'}
                        </p>
                      </div>
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-teal-700 uppercase tracking-wide">Div. Yield</p>
                        <p className="text-xl font-bold text-teal-900">{metrics.totalDividendYield.toFixed(1)}%</p>
                        <p className="text-xs text-teal-600">
                          Annual: {formatLargeNumber(metrics.totalCurrentValue * metrics.totalDividendYield / 100)}
                        </p>
                      </div>
                      <Award className="h-6 w-6 text-teal-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Overview Tab */}
            {selectedView === 'overview' && metrics && (
              <div className="space-y-8">
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
                            <XAxis dataKey="risk" name="Risk %" domain={['dataMin-5', 'dataMax+5']} />
                            <YAxis dataKey="return" name="Return %" />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                name === 'return' ? formatPercentage(value) : `${value.toFixed(1)}%`,
                                name === 'return' ? 'Return' : 'Risk'
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
                        Bubble size represents investment amount. Higher return with lower risk is ideal (top-left quadrant).
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
                          <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: colors[index % colors.length] }}
                              ></div>
                              <div>
                                <div className="font-medium text-gray-900">{stock.symbol}</div>
                                <div className="text-sm text-gray-500">{stock.size}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatLargeNumber(stock.marketCap * 10000000)}</div>
                              <div className="text-sm text-gray-500">{stock.weight.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sector Performance Heatmap */}
                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Sector Performance Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        <div className="grid grid-cols-8 gap-2 mb-2 text-xs font-medium text-gray-600">
                          <div>Sector</div>
                          <div className="text-center">1D</div>
                          <div className="text-center">1W</div>
                          <div className="text-center">1M</div>
                          <div className="text-center">3M</div>
                          <div className="text-center">1Y</div>
                          <div className="text-center">Allocation</div>
                          <div className="text-center">Holdings</div>
                        </div>
                        {metrics.sectorPerformanceData.map((sector) => (
                          <div key={sector.sector} className="grid grid-cols-8 gap-2 items-center py-2">
                            <div className="font-medium text-sm">{sector.sector}</div>
                            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => {
                              const value = sector[period];
                              return (
                                <div
                                  key={period}
                                  className={`text-center p-1 rounded text-xs font-medium ${
                                    value > 2 ? 'bg-green-200 text-green-800' :
                                    value > 0 ? 'bg-green-100 text-green-700' :
                                    value > -2 ? 'bg-red-100 text-red-700' :
                                    'bg-red-200 text-red-800'
                                  }`}
                                >
                                  {formatPercentage(value)}
                                </div>
                              );
                            })}
                            <div className="text-center text-sm font-medium">
                              {sector.allocation.toFixed(1)}%
                            </div>
                            <div className="text-center text-sm text-gray-600">
                              {sector.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Volume Analysis */}
                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      Volume Analysis & Unusual Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.volumeAnalysisData.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="symbol" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: number) => [`${value.toFixed(1)}x`, 'Volume Ratio']}
                          />
                          <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="3 3" />
                          <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="2 2" />
                          <Bar dataKey="volumeRatio" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Ratios above 2x (orange line) indicate unusual activity. Above 1x (red line) is normal.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Performance Tab */}
            {selectedView === 'performance' && metrics && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            <XAxis dataKey="beta" name="Beta" domain={['dataMin-0.1', 'dataMax+0.1']} />
                            <YAxis dataKey="alpha" name="Alpha" />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                value.toFixed(2),
                                name === 'alpha' ? 'Alpha (%)' : 'Beta'
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
                        {metrics.movingAverageData.slice(0, 6).map((stock, index) => (
                          <div key={stock.symbol} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{stock.symbol}</span>
                              <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.ma50Signal === 'Bullish' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  MA50: {stock.ma50Signal}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.goldenCross ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {stock.goldenCross ? 'Golden Cross' : 'Normal'}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Current: {formatPrice(stock.currentPrice)}</span>
                                <span className={stock.priceVsMa50 > 0 ? 'text-green-600' : 'text-red-600'}>
                                  vs MA50: {formatPercentage(stock.priceVsMa50)}
                                </span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                <span>MA50: {formatPrice(stock.ma50)}</span>
                                <span className={stock.priceVsMa200 > 0 ? 'text-green-600' : 'text-red-600'}>
                                  vs MA200: {formatPercentage(stock.priceVsMa200)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                      {metrics.weekRangeData.map((stock, index) => (
                        <div key={stock.symbol} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{stock.symbol}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                stock.signal === 'Near High' ? 'bg-green-100 text-green-800' :
                                stock.signal === 'Near Low' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {stock.signal}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                stock.momentum === 'Strong' ? 'bg-green-100 text-green-800' :
                                stock.momentum === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {stock.momentum} Momentum
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatPrice(stock.current)} ({stock.position.toFixed(0)}% of range)
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  stock.position > 80 ? 'bg-green-500' :
                                  stock.position > 60 ? 'bg-blue-500' :
                                  stock.position > 40 ? 'bg-yellow-500' :
                                  stock.position > 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${stock.position}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>52W Low: {formatPrice(stock.low)}</span>
                              <span>Range: {formatPrice(stock.range)}</span>
                              <span>52W High: {formatPrice(stock.high)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Fundamentals Tab */}
            {selectedView === 'fundamentals' && metrics && (
              <div className="space-y-8">
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
                          <RadarChart data={[
                            { 
                              metric: 'Current Ratio', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.currentRatio, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 75,
                              fullMark: 100 
                            },
                            { 
                              metric: 'Quick Ratio', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.quickRatio, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 70,
                              fullMark: 100 
                            },
                            { 
                              metric: 'Low Debt/Equity', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.debtToEquity, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 80,
                              fullMark: 100 
                            },
                            { 
                              metric: 'ROE', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.roe, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 60,
                              fullMark: 100 
                            },
                            { 
                              metric: 'Profit Margin', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.profitMargin, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 65,
                              fullMark: 100 
                            },
                            { 
                              metric: 'Revenue Growth', 
                              portfolioAvg: metrics.financialHealthData.reduce((sum, item) => sum + item.revenueGrowth, 0) / metrics.financialHealthData.length || 50,
                              benchmark: 55,
                              fullMark: 100 
                            }
                          ]}>
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
                          <BarChart data={[
                            { range: '0-10', count: 0, label: 'Deep Value' },
                            { range: '10-15', count: metrics.peDistributionData.filter(p => p.range === '10-15').reduce((sum, p) => sum + p.count, 0), label: 'Value' },
                            { range: '15-20', count: metrics.peDistributionData.filter(p => p.range === '15-20').reduce((sum, p) => sum + p.count, 0), label: 'Fair Value' },
                            { range: '20-25', count: metrics.peDistributionData.filter(p => p.range === '20-25').reduce((sum, p) => sum + p.count, 0), label: 'Growth' },
                            { range: '25-30', count: metrics.peDistributionData.filter(p => p.range === '25-30').reduce((sum, p) => sum + p.count, 0), label: 'High Growth' },
                            { range: '30+', count: metrics.peDistributionData.filter(p => p.range === '30+').reduce((sum, p) => sum + p.count, 0), label: 'Expensive' }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip formatter={(value: number, name: string, props: any) => [value, `${props.payload.label} (${value} stocks)`]} />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-lg font-semibold">Portfolio Avg P/E: {metrics.weightedPE.toFixed(1)}</div>
                        <div className="text-sm text-gray-600">
                          vs Market Average: 22.5 | 
                          Classification: {metrics.weightedPE < 15 ? 'Value' : metrics.weightedPE < 25 ? 'Fair' : 'Growth'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analyst Ratings & Targets */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                                  stock.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                                  stock.recommendation === 'SELL' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {stock.recommendation}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-medium ${
                                  stock.upside > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatPercentage(stock.upside)} upside
                                </div>
                                <div className="text-xs text-gray-500">
                                  {stock.analysts} analysts
                                </div>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-red-400 to-green-400 h-3 rounded-full"
                                  style={{ 
                                    width: `${Math.min(100, Math.max(10, ((stock.currentPrice - stock.targetLow) / (stock.targetHigh - stock.targetLow)) * 100))}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Target Low: {formatPrice(stock.targetLow)}</span>
                                <span className="font-medium">Current: {formatPrice(stock.currentPrice)}</span>
                                <span>Target High: {formatPrice(stock.targetHigh)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Institutional Holdings */}
                  <Card className="bg-white shadow-sm border border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        Institutional vs Retail Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.institutionalHoldingsData.slice(0, 6).map((stock) => (
                          <div key={stock.symbol} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{stock.symbol}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.institutionalCategory === 'High' ? 'bg-green-100 text-green-800' :
                                  stock.institutionalCategory === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {stock.institutionalCategory} Institutional
                                </span>
                                <span className="text-sm text-gray-600">
                                  {stock.institutional.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 transition-all duration-300"
                                style={{ width: `${stock.institutional}%` }}
                                title={`Institutional: ${stock.institutional.toFixed(1)}%`}
                              />
                              <div 
                                className="bg-green-500 transition-all duration-300"
                                style={{ width: `${stock.insider}%` }}
                                title={`Insider: ${stock.insider.toFixed(1)}%`}
                              />
                              <div 
                                className="bg-gray-400 transition-all duration-300"
                                style={{ width: `${stock.retail}%` }}
                                title={`Retail: ${stock.retail.toFixed(1)}%`}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>🏛️ Institutions ({stock.institutional.toFixed(1)}%)</span>
                              <span>👥 Insiders ({stock.insider.toFixed(1)}%)</span>
                              <span>🏠 Retail ({stock.retail.toFixed(1)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dividend Analysis */}
                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Dividend Yield & Income Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {metrics.dividendData.slice(0, 6).map((stock, index) => (
                        <div key={stock.symbol} className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{stock.symbol}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              stock.category === 'High Yield' ? 'bg-green-100 text-green-800' :
                              stock.category === 'Medium Yield' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {stock.category}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-purple-700">
                              {stock.dividendYield.toFixed(2)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              Last: {formatPrice(stock.lastDividend)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Annual Est: {formatPrice(stock.annualDividend)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {metrics.totalDividendYield.toFixed(2)}%
                      </div>
                      <div className="text-sm text-purple-600">Portfolio Average Dividend Yield</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Estimated Annual Income: {formatLargeNumber(metrics.totalCurrentValue * metrics.totalDividendYield / 100)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Technical Tab */}
            {selectedView === 'technical' && metrics && (
              <div className="space-y-8">
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
                      {metrics.movingAverageData.slice(0, 9).map((stock, index) => (
                        <div key={stock.symbol} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium">{stock.symbol}</span>
                            <div className="flex gap-1">
                              {stock.goldenCross && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Golden Cross
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded ${
                                stock.ma50Signal === 'Bullish' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {stock.ma50Signal}
                              </span>
                            </div>
                          </div>
                          
                          {/* Mini chart representation */}
                          <div className="h-16 relative bg-gray-50 rounded">
                            <div className="absolute inset-0 flex items-end justify-between px-2 py-1">
                              {[1, 2, 3, 4, 5, 6, 7].map((_, i) => {
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
                              <span className="font-medium">{formatPrice(stock.currentPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>MA50:</span>
                              <span className={stock.priceVsMa50 > 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatPrice(stock.ma50)} ({formatPercentage(stock.priceVsMa50)})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>MA200:</span>
                              <span className={stock.priceVsMa200 > 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatPrice(stock.ma200)} ({formatPercentage(stock.priceVsMa200)})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Volume vs Price Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white shadow-sm border border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-600" />
                        Volume Spike Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.volumeAnalysisData.slice(0, 6).map((stock) => (
                          <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-medium">{stock.symbol}</div>
                                <div className="text-sm text-gray-500">{stock.activity} Activity</div>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                stock.volumeRatio > 2 ? 'bg-red-500' :
                                stock.volumeRatio > 1.5 ? 'bg-orange-500' :
                                stock.volumeRatio > 1 ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{stock.volumeRatio.toFixed(1)}x</div>
                              <div className="text-sm text-gray-500">
                                {(stock.currentVolume / 1000000).toFixed(1)}M vol
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium text-blue-800 mb-1">Volume Signal Interpretation:</div>
                          <div className="space-y-1 text-blue-700">
                            <div>🟢 1-1.5x: Normal trading activity</div>
                            <div>🟠 1.5-2x: Above average interest</div>
                            <div>🔴 2x+: Significant news/events likely</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        Technical Breakout Signals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.weekRangeData.slice(0, 6).map((stock) => (
                          <div key={stock.symbol} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{stock.symbol}</span>
                              <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.signal === 'Near High' ? 'bg-green-100 text-green-800' :
                                  stock.signal === 'Near Low' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {stock.signal}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  stock.momentum === 'Strong' ? 'bg-green-100 text-green-800' :
                                  stock.momentum === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {stock.momentum}
                                </span>
                              </div>
                            </div>
                            
                            {/* Price position visualization */}
                            <div className="relative mb-2">
                              <div className="w-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full h-2">
                                <div 
                                  className="absolute w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1"
                                  style={{ left: `${stock.position}%`, top: 0 }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Position: {stock.position.toFixed(1)}% of range</span>
                                <span>Range: {formatPrice(stock.range)}</span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>Low: {formatPrice(stock.low)}</span>
                                <span>High: {formatPrice(stock.high)}</span>
                              </div>
                            </div>
                            
                            {stock.position > 90 && (
                              <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded">
                                ⚡ Breakout alert: Trading at new highs
                              </div>
                            )}
                            {stock.position < 10 && (
                              <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded">
                                ⚠️ Support test: Near 52-week lows
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Risk Tab */}
            {selectedView === 'risk' && metrics && (
              <div className="space-y-8">
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
                        <div className={`text-4xl font-bold mb-2 ${
                          metrics.concentrationRisk === 'Low' ? 'text-green-600' :
                          metrics.concentrationRisk === 'Medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
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
                            {Math.max(...Object.values(metrics.sectorAllocations)
                              .map(s => (s.value / metrics.totalCurrentValue) * 100)
                            ).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Top 3 holdings:</span>
                          <span className="font-medium">
                            {Object.values(metrics.sectorAllocations)
                              .sort((a, b) => b.value - a.value)
                              .slice(0, 3)
                              .reduce((sum, sector) => sum + (sector.value / metrics.totalCurrentValue) * 100, 0)
                              .toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Number of sectors:</span>
                          <span className="font-medium">{Object.keys(metrics.sectorAllocations).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total holdings:</span>
                          <span className="font-medium">{portfolio.length}</span>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Risk Assessment:</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {metrics.concentrationRisk === 'Low' && (
                            <>
                              <div>✅ Well diversified across sectors</div>
                              <div>✅ No single holding dominates</div>
                              <div>✅ Good risk distribution</div>
                            </>
                          )}
                          {metrics.concentrationRisk === 'Medium' && (
                            <>
                              <div>⚠️ Moderate concentration present</div>
                              <div>⚠️ Consider broader diversification</div>
                              <div>⚠️ Monitor large positions</div>
                            </>
                          )}
                          {metrics.concentrationRisk === 'High' && (
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
                            <Tooltip formatter={(value: number) => [value.toFixed(2), 'Beta']} />
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
                          {metrics.portfolioBeta > 1.2 ? 'Highly Aggressive' :
                           metrics.portfolioBeta > 1.0 ? 'Moderately Aggressive' :
                           metrics.portfolioBeta > 0.8 ? 'Moderately Conservative' : 'Conservative'}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Market correlation:</span>
                          <span className={
                            metrics.portfolioBeta > 1.1 ? 'text-red-600' :
                            metrics.portfolioBeta > 0.9 ? 'text-yellow-600' : 'text-green-600'
                          }>
                            {metrics.portfolioBeta > 1.1 ? 'High' :
                             metrics.portfolioBeta > 0.9 ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volatility vs market:</span>
                          <span>
                            {metrics.portfolioBeta > 1 ? `${((metrics.portfolioBeta - 1) * 100).toFixed(0)}% higher` : 
                             `${((1 - metrics.portfolioBeta) * 100).toFixed(0)}% lower`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Correlation Matrix */}
                <Card className="bg-white shadow-sm border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Portfolio Correlation Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <div className="grid gap-1 text-xs" style={{ 
                        gridTemplateColumns: `80px repeat(${Math.min(portfolio.length, 8)}, 80px)` 
                      }}>
                        {/* Header row */}
                        <div></div>
                        {portfolio.slice(0, 8).map(item => (
                          <div key={item.stock?.symbol} className="text-center font-medium p-1 truncate">
                            {item.stock?.symbol}
                          </div>
                        ))}
                        
                        {/* Correlation data rows */}
                        {portfolio.slice(0, 8).map((item1, i) => (
                          <React.Fragment key={item1.stock?.symbol}>
                            <div className="font-medium p-1 truncate">{item1.stock?.symbol}</div>
                            {portfolio.slice(0, 8).map((item2, j) => {
                              const correlation = i === j ? 1.00 : 
                                (item1.stock?.sector === item2.stock?.sector ? 0.6 + Math.random() * 0.3 : 
                                 0.1 + Math.random() * 0.5);
                              return (
                                <div 
                                  key={item2.stock?.symbol}
                                  className={`text-center p-1 rounded font-medium ${
                                    correlation >= 0.8 ? 'bg-red-200 text-red-800' :
                                    correlation >= 0.6 ? 'bg-orange-200 text-orange-800' :
                                    correlation >= 0.4 ? 'bg-yellow-200 text-yellow-800' :
                                    correlation >= 0.2 ? 'bg-blue-200 text-blue-800' :
                                    'bg-green-200 text-green-800'
                                  }`}
                                >
                                  {correlation.toFixed(2)}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-200 rounded"></div>
                        <span>Low (&lt;0.2)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-200 rounded"></div>
                        <span>Low-Med (0.2-0.4)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                        <span>Medium (0.4-0.6)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-200 rounded"></div>
                        <span>High (0.6-0.8)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-200 rounded"></div>
                        <span>Very High (&gt;0.8)</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Diversification Insight:</strong> Lower correlation values indicate better diversification. 
                        High correlation (&gt;0.6) between holdings suggests they may move similarly during market stress.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Earnings Calendar - Always visible */}
            {metrics && metrics.earningsCalendarData.length > 0 && (
              <Card className="bg-white shadow-sm border border-slate-200 mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Earnings Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {metrics.earningsCalendarData.slice(0, 6).map((stock) => (
                      <div key={stock.symbol} className={`p-4 rounded-lg border-2 ${
                        stock.urgency === 'High' ? 'border-red-200 bg-red-50' :
                        stock.urgency === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-lg">{stock.symbol}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            stock.urgency === 'High' ? 'bg-red-200 text-red-800' :
                            stock.urgency === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {stock.urgency} Priority
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {stock.daysUntil > 0 ? `In ${stock.daysUntil} days` : 
                             stock.daysUntil === 0 ? 'Today' : 
                             `${Math.abs(stock.daysUntil)} days ago`}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(stock.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          {stock.daysUntil <= 7 && stock.daysUntil > 0 && (
                            <div className="text-xs text-orange-700 bg-orange-100 p-1 rounded mt-2">
                              ⚡ Expect increased volatility
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Alerts Panel */}
            <Card className="bg-white shadow-sm border border-slate-200 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Smart Alerts & AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics && metrics.alerts.map((alert, index) => (
                    <div key={index} className={`p-4 border-l-4 rounded-lg ${
                      alert.color === 'green' ? 'border-green-500 bg-green-50' :
                      alert.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                      alert.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                      alert.color === 'red' ? 'border-red-500 bg-red-50' :
                      'border-gray-500 bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <alert.icon className={`h-4 w-4 ${
                          alert.color === 'green' ? 'text-green-600' :
                          alert.color === 'blue' ? 'text-blue-600' :
                          alert.color === 'purple' ? 'text-purple-600' :
                          alert.color === 'red' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                        <span className={`font-medium text-sm ${
                          alert.color === 'green' ? 'text-green-800' :
                          alert.color === 'blue' ? 'text-blue-800' :
                          alert.color === 'purple' ? 'text-purple-800' :
                          alert.color === 'red' ? 'text-red-800' :
                          'text-gray-800'
                        }`}>
                          {alert.title}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        alert.color === 'green' ? 'text-green-700' :
                        alert.color === 'blue' ? 'text-blue-700' :
                        alert.color === 'purple' ? 'text-purple-700' :
                        alert.color === 'red' ? 'text-red-700' :
                        'text-gray-700'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  ))}
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
                      {metrics && Object.entries(metrics.sectorAllocations)
                        .sort(([,a], [,b]) => b.value - a.value)
                        .slice(0, 3)
                        .map(([sector, data]) => {
                          const allocation = (data.value / metrics.totalCurrentValue) * 100;
                          const suggestion = allocation > 40 ? 'Reduce' : allocation < 10 ? 'Increase' : 'Maintain';
                          return (
                            <div key={sector} className="flex justify-between items-center p-2 bg-white rounded">
                              <span className="text-sm">{sector}</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{allocation.toFixed(1)}%</div>
                                <div className={`text-xs ${
                                  suggestion === 'Reduce' ? 'text-red-600' :
                                  suggestion === 'Increase' ? 'text-green-600' :
                                  'text-blue-600'
                                }`}>
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
                          {metrics.concentrationRisk === 'High' && (
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

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Full Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Customize Dashboard
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Set Up Alerts
              </Button>
              <Link href="/portfolio">
                <Button className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Manage Portfolio
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoDashboard;