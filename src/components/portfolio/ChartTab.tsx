'use client';

import { useState } from 'react';
import { BarChart, LineChart, Activity, TrendingUp, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatSymbol } from '@/lib/utils/stockUtils';

const ChartTab = ({ item }: { item: any }) => {
  const [chartType, setChartType] = useState('candlestick');
  const [timeframe, setTimeframe] = useState('D');
  const [showIndicators, setShowIndicators] = useState(false);
  const [comparison, setComparison] = useState("");

  const chartTypes = [
    { id: 'candlestick', name: 'Candlestick', icon: BarChart },
    { id: 'line', name: 'Line', icon: LineChart },
    { id: 'area', name: 'Area', icon: Activity }
  ];

  const timeframes = [
    { id: '1', name: '1 min' },
    { id: '5', name: '5 min' },
    { id: '15', name: '15 min' },
    { id: '60', name: '1 hour' },
    { id: 'D', name: 'Daily' },
    { id: 'W', name: 'Weekly' },
    { id: 'M', name: 'Monthly' }
  ];

  const indicators = [
    'RSI', 'MACD', 'Bollinger Bands', 'Moving Average', 'Volume'
  ];

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Chart Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <div className="flex gap-2">
                {chartTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${chartType === type.id
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label
                htmlFor="timeframe-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Timeframe
              </label>
              <Select
                value={timeframe}
                onValueChange={setTimeframe}
                name="timeframe"
              >
                <SelectTrigger id="timeframe-select" aria-label="Timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.id} value={tf.id}>
                      {tf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicators Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical Indicators</label>
              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showIndicators
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Zap className="h-4 w-4" />
                <span className="text-sm">{showIndicators ? 'Hide' : 'Show'} Indicators</span>
              </button>
            </div>
          </div>

          {/* Indicator Selection */}
          {showIndicators && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Indicators</label>
              <div className="flex flex-wrap gap-2">
                {indicators.map((indicator) => (
                  <button
                    key={indicator}
                    className="px-3 py-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-indigo-600" />
              TradingView Chart - {formatSymbol(item.stock.symbol)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Interval: {timeframes.find(tf => tf.id === timeframe)?.name}</span>
              <span>•</span>
              <span>Type: {chartTypes.find(ct => ct.id === chartType)?.name}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden relative">
            {/* TradingView Widget Embed */}
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${formatSymbol(item.stock.symbol)}&interval=${timeframe}&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=${showIndicators ? 'RSI@tv-basicstudies,MACD@tv-basicstudies' : ''}&theme=light&style=${chartType === 'line' ? '2' : chartType === 'area' ? '3' : '1'}&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&hidevolume=${chartType === 'line' ? '1' : '0'}&hidelegend=1`}
              className="w-full h-full border-0"
              allowFullScreen
              title={`TradingView Chart for ${formatSymbol(item.stock.symbol)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart Comparison */}
      {/* <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Compare with Index/Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="comparison-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Compare with
              </label>
              <Select
                value={comparison}
                onValueChange={setComparison}
                name="comparison"
              >
                <SelectTrigger id="comparison-select" aria-label="Compare with">
                  <SelectValue placeholder="Select comparison..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPY">S&amp;P 500 (SPY)</SelectItem>
                  <SelectItem value="QQQ">NASDAQ 100 (QQQ)</SelectItem>
                  <SelectItem value="AAPL">Apple Inc. (AAPL)</SelectItem>
                  <SelectItem value="MSFT">Microsoft (MSFT)</SelectItem>
                  <SelectItem value="GOOGL">Alphabet (GOOGL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Add Comparison
              </button>
            </div>
          </div>

          <div className="mt-4 h-48 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-gray-200">
            <p className="text-gray-600">Select a stock/index to compare performance</p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}

export default ChartTab