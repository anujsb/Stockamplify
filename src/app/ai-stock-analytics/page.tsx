"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { SideBar } from '@/components/SideBar';
import StockSearch, { StockSearchResult } from '@/components/StockSearch';
import { cn } from '@/lib/utils';
import { getHorizonOptions } from '@/lib/utils/investmentHorizons';
import { 
  transformAIResponseToFrontend, 
  validateIndianStockSymbol, 
  formatStockSymbol,
  getRecommendationColor,
  getTrendIcon,
  type AnalysisData 
} from '@/lib/utils/dataTransformers';

const StockAnalytics = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [investmentHorizon, setInvestmentHorizon] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const investmentOptions = getHorizonOptions();

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setStockSymbol(stock.symbol);
  };

  const handleAnalyze = async () => {
    if (!stockSymbol || !investmentHorizon) {
      setError('Please select a stock and investment horizon');
      return;
    }

    // Validate Indian stock symbol format
    if (!validateIndianStockSymbol(stockSymbol)) {
      setError('Please select a valid Indian stock from the search results');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);
    setAnalysisData(null);
    
    try {
      const response = await fetch('/api/ai-stock-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockSymbol,
          investmentHorizon: investmentHorizon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze stock');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        // Transform the API response using the utility function
        const transformedData = transformAIResponseToFrontend(data.analysis);
        setAnalysisData(transformedData);
        setSuccess(`Analysis completed for ${stockSymbol}`);
      } else {
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIconComponent = (trend: string) => {
    const trendType = getTrendIcon(trend);
    switch (trendType) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={cn(
      " flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row ",
      "min-h-screen", // for your use case, use `h-screen` instead of `h-[60vh]`
    )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Stock Analytics
          </h1>
          <p className="text-gray-600 text-lg">Advanced AI-powered analysis for Indian stock market</p>
        </div>

        {/* Input Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Stock Analysis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stock Symbol</label>
                <StockSearch
                  onStockSelect={handleStockSelect}
                  placeholder="Search for stocks..."
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Investment Horizon</label>
                <Select value={investmentHorizon} onValueChange={setInvestmentHorizon}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500">
                    <SelectValue placeholder="Select investment horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!stockSymbol || !investmentHorizon || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze Stock'
              )}
            </Button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Analysis Error</span>
                </div>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Success</span>
                </div>
                <p className="mt-2 text-sm text-green-700">{success}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisData && (
          <div className="space-y-6">
            {/* Main Recommendation */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">AI Analysis for {stockSymbol}</CardTitle>
                  {/* <Badge className={`px-3 py-1 text-sm font-medium ${getRecommendationColor(analysisData.recommendation)}`}>
                    {analysisData.recommendation}
                  </Badge> */}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-4 rounded-lg ${getRecommendationColor(analysisData.recommendation)}`}>
                    {/* <div className="text-2xl font-bold text-blue-600">{analysisData.confidence}%</div> */}
                    {/* <div className="text-sm text-gray-600">Confidence</div> */}
                    {/* <Badge className={`px-3 py-1 text-sm font-medium ${getRecommendationColor(analysisData.recommendation)}`}> */}
                    <div className={`text-2xl font-bold text-blue-600 ${getRecommendationColor(analysisData.recommendation)}`}>{analysisData.recommendation}</div>
                    {/* </Badge> */}
                    <div className="text-sm text-gray-600">Recommendation</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analysisData.confidence}%</div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">{analysisData.holdingPeriod}</div>
                    <div className="text-sm text-gray-600">Holding Period</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">{analysisData.weekRange.currentPrice}</div>
                    <div className="text-sm text-gray-600">Current Price</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Reasoning:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysisData.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Trend Analysis */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysisData.trendAnalysis).map(([key, value]) => {
                    if (key === 'confidence') return null;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIconComponent(String(value))}
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trend Confidence</span>
                    <span className="text-sm font-bold text-blue-600">{analysisData.trendAnalysis.confidence}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support & Resistance */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Support & Resistance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Support Levels</div>
                    <div className="space-y-1">
                      {analysisData.supportResistance.support.map((level, index) => (
                        <div key={index} className="bg-green-50 px-3 py-1 rounded text-sm text-green-700 font-medium">
                          {level}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Resistance Levels</div>
                    <div className="space-y-1">
                      {analysisData.supportResistance.resistance.map((level, index) => (
                        <div key={index} className="bg-red-50 px-3 py-1 rounded text-sm text-red-700 font-medium">
                          {level}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Targets */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    Price Targets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysisData.priceTargets).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Technical Indicators */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-orange-600" />
                    Technical Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysisData.indicators).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 uppercase">{key}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk & Volatility */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Risk & Volatility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {analysisData.riskVolatility.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volatility</span>
                    <span className="text-sm font-medium">{analysisData.riskVolatility.volatility}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volatility Score</span>
                    <span className="text-sm font-bold text-red-600">{analysisData.riskVolatility.volatilityScore}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600 mb-1">Suitable For:</div>
                    <div className="text-sm font-medium text-blue-600">{analysisData.riskVolatility.suitableFor}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 52-Week Range */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    52-Week Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Price</span>
                    <span className="text-sm font-bold text-blue-600">{analysisData.weekRange.currentPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">52-Week High</span>
                    <span className="text-sm font-medium text-green-600">{analysisData.weekRange.weekHigh}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">52-Week Low</span>
                    <span className="text-sm font-medium text-red-600">{analysisData.weekRange.weekLow}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Position</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {analysisData.weekRange.position}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Summary */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Sentiment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm text-gray-600">Market Sentiment:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {analysisData.sentiment.marketSentiment}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Sentiment Source: {analysisData.sentiment.sentimentSource}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StockAnalytics;
