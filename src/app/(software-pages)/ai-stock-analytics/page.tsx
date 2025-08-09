"use client";
import React, {useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, BarChart3, Calendar, DollarSign, GanttChartIcon as ChartNoAxesGantt, InfoIcon } from 'lucide-react';
import { SideBar } from '@/components/SideBar';
import StockSearch, { StockSearchResult } from '@/components/StockSearch';
import { cn } from '@/lib/utils';
import { getHorizonOptions } from '@/lib/utils/investmentHorizons';
import { transformAIResponseToFrontend, validateIndianStockSymbol, formatStockSymbol, getRecommendationColor, getTrendIcon,  type AnalysisData } from '@/lib/utils/dataTransformers';
import { languageOptions, getTranslation, translateAnalysisData, type Language } from '@/lib/utils/languageUtils';
import { formatDate, formatPrice, formatLargeNumber, formatSymbol, formatPercentage } from "@/lib/utils/stockUtils";
import { useUser } from '@clerk/nextjs';

interface RateLimit {
  count: number;
  remaining: number;
  limit: number;
}

const StockAnalytics = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [investmentHorizon, setInvestmentHorizon] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit>({ count: 0, remaining: 15, limit: 15 });
  const { isSignedIn } = useUser();

  // For demo purposes - in real app, get this from your auth
  const [userId, setUserId] = useState('demo-user-123');

  // Fetch current rate limit status
  const fetchTokenStatus = async () => {
    try {
      const response = await fetch('/api/rate-limit-status');
      if (response.ok) {
        const data = await response.json();
        setRateLimit(data);
      } else {
        // Could be unauthorized if user is not signed in
        const err = await response.json();
        setError(err.error || 'Failed to get rate limit');
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const investmentOptions = getHorizonOptions();

  const waitMessages = [
      "Scanning market signals...",
      "Analyzing trends and patterns...",
      "Weighing the odds...",
      "Extracting key insights...",
      "Cross-checking with historical data...",
      "Optimizing your strategy...",
      "Almost ready with your analysis..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % waitMessages.length);
    }, 4500); // change every 4.5 seconds

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setStockSymbol(stock.symbol);
  };
  

  const handleAnalyze = async () => {
    if (!stockSymbol || !investmentHorizon) {
      setError(getTranslation(language, 'selectStockAndHorizon'));
      return;
    }

    if (!validateIndianStockSymbol(stockSymbol)) {
      setError(getTranslation(language, 'selectValidStock'));
      return;
    }

    if (rateLimit.remaining <= 0) {
      setError('You have reached your daily limit of 15 analyses');
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
          language: language,
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
        // Translate the analysis data to the selected language
        const translatedData = translateAnalysisData(transformedData, language);
        setAnalysisData(translatedData);
        fetchTokenStatus();
        setRateLimit(data.rateLimit);
        setSuccess(`${getTranslation(language, 'analysisCompleted')} ${stockSymbol}`);
      } else {
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : getTranslation(language, 'unknownError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isLimitReached = rateLimit.remaining <= 0;

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
      "min-h-screen",
    )}>
      <SideBar />
      <div className="flex-1 overflow-y-auto min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getTranslation(language, 'pageTitle')}
            </h1>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stock Symbol */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    {getTranslation(language, 'stockSymbol')}
                  </label>
                  <StockSearch
                    onStockSelect={handleStockSelect}
                    placeholder="Search for stocks..."
                    className="w-full"
                  />
                </div>

                {/* Investment Horizon */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    {getTranslation(language, 'investmentHorizon')}
                  </label>
                  <Select value={investmentHorizon} onValueChange={setInvestmentHorizon}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 w-full">
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

                {/* Language */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700">
                    {getTranslation(language, 'language')}
                  </label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analyze Button */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 opacity-0">
                    Action
                  </label>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!stockSymbol || !investmentHorizon || isAnalyzing || isLimitReached}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 h-10"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {getTranslation(language, 'analyzing')}
                      </div>
                    ) : (
                      getTranslation(language, 'analyzeStock')
                    )}
                  </Button>
                </div>
                
              {/* Analysis Token Used */}
              {analysisData && (<div className="text-sm font-small text-gray-700">
                <p>
                  Tokens Used: {rateLimit.count} / {rateLimit.limit} ({rateLimit.remaining} remaining)
                </p>
              </div>)}
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">{getTranslation(language, 'analysisError')}</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
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
                    <CardTitle className="text-xl">
                      {getTranslation(language, 'aiAnalysisFor')} {formatSymbol(stockSymbol)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`text-center p-2 rounded-lg ${getRecommendationColor(analysisData.recommendation)}`}>
                      <div className={`text-2xl font-bold text-blue-600 ${getRecommendationColor(analysisData.recommendation)}`}>
                        {analysisData.recommendation}
                      </div>
                      <div className="text-sm text-gray-600">{getTranslation(language, 'recommendation')}</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analysisData.confidence}%</div>
                      <div className="text-sm text-gray-600">{getTranslation(language, 'confidence')}</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">{analysisData.holdingPeriod}</div>
                      <div className="text-sm text-gray-600">{getTranslation(language, 'holdingPeriod')}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{analysisData.weekRange.currentPrice}</div>
                      <div className="text-sm text-gray-600">{getTranslation(language, 'currentPrice')}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{getTranslation(language, 'reasoning')}:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{analysisData.reasoning}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Price Targets - */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    {getTranslation(language, 'priceTargets')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {Object.entries(analysisData.priceTargets).map(([key, value]) => {
                      let bgColor = 'bg-gray-50';
                      let textColor = 'text-gray-600';

                      // Color coding based on price target type
                      if (key.toLowerCase().includes('entry')) {
                        bgColor = 'bg-blue-50';
                        textColor = 'text-blue-600';
                      } else if (key.toLowerCase().includes('exit') || key.toLowerCase().includes('target')) {
                        bgColor = 'bg-green-50';
                        textColor = 'text-green-600';
                      } else if (key.toLowerCase().includes('stop')) {
                        bgColor = 'bg-red-50';
                        textColor = 'text-red-600';
                      } else if (key.toLowerCase().includes('upside')) {
                        bgColor = 'bg-emerald-50';
                        textColor = 'text-emerald-600';
                      } else if (key.toLowerCase().includes('downside')) {
                        bgColor = 'bg-orange-50';
                        textColor = 'text-orange-600';
                      }

                      return (
                        <div key={key} className={`text-center p-3 rounded-lg ${bgColor}`}>
                          <div className={`text-lg font-bold ${textColor}`}>
                            {value}
                          </div>
                          <div className="text-xs text-gray-600 capitalize mt-1 leading-tight">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      );
                    })}
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
                      {getTranslation(language, 'trendAnalysis')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysisData.trendAnalysis).map(([key, value]) => {
                      if (key === 'confidence') return null;
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-sm text-gray-600 capitalize flex-shrink-0">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <div className="flex items-center gap-2 justify-end">
                            {getTrendIconComponent(String(value))}
                            <span className="text-sm font-medium break-words">{value}</span>
                          </div>
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'trendConfidence')}</span>
                      <span className="text-sm font-bold text-blue-600">{analysisData.trendAnalysis.confidence}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Support & Resistance */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      {getTranslation(language, 'supportResistance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {getTranslation(language, 'supportLevels')}
                      </div>
                      <div className="space-y-1">
                        {analysisData.supportResistance.support.map((level, index) => (
                          <div key={index} className="bg-green-50 px-3 py-1 rounded text-sm text-green-700 font-medium">
                            {level}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {getTranslation(language, 'resistanceLevels')}
                      </div>
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

                {/* Technical Indicators */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                      {getTranslation(language, 'technicalIndicators')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysisData.indicators).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-sm text-gray-600 uppercase font-medium flex-shrink-0">{key}</span>
                        <span className="text-sm font-medium text-right break-words">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk & Volatility */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      {getTranslation(language, 'riskVolatility')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'riskLevel')}</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {analysisData.riskVolatility.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'volatility')}</span>
                      <span className="text-sm font-medium">{analysisData.riskVolatility.volatility}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'volatilityScore')}</span>
                      <span className="text-sm font-medium">{analysisData.riskVolatility.volatilityScore}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm text-gray-600 flex-shrink-0">{getTranslation(language, 'suitableFor')}</div>
                      <div className="text-sm font-medium text-right break-words">{analysisData.riskVolatility.suitableFor}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 52-Week Range */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      {getTranslation(language, 'weekRange')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'currentPrice')}</span>
                      <span className="text-sm font-bold text-blue-600">{analysisData.weekRange.currentPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'weekHigh')}</span>
                      <span className="text-sm font-medium text-green-600">{analysisData.weekRange.weekHigh}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'weekLow')}</span>
                      <span className="text-sm font-medium text-red-600">{analysisData.weekRange.weekLow}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'position')}</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {analysisData.weekRange.position}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Sentiment Summary */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ChartNoAxesGantt className="h-5 w-5 text-green-600" />
                      {getTranslation(language, 'sentimentSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-600">{getTranslation(language, 'marketSentiment')}:</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {analysisData.sentiment.marketSentiment}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        {getTranslation(language, 'sentimentSource')}: {analysisData.sentiment.sentimentSource}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-700 animate-pulse">{waitMessages[messageIndex]}</span>
            </div>
          )}

          <Card className="shadow-none border border-gray-200 bg-gray-50 mt-4">
            <CardContent>
              <div className="flex flex-col items-start gap-2 text-xs text-gray-500 italic">
                <div className='flex items-center gap-1'>
                  <InfoIcon className="w-4 h-4" />
                  <span className="font-medium">Disclaimer:</span>
                </div>
                {/* {disclaimer} */}
                <div className='flex flex-col space-y-1'>
                  <ul className="list-disc pl-5">
                    <li>This AI-generated analysis is based solely on the provided data and does not include fundamental analysis, broader market conditions, news, or other technical indicators.</li>
                    <li>Stock trading involves significant risk, and past performance is not indicative of future results.</li>
                    <li>All information is for educational purposes only. We strongly recommend conducting your own research and consulting a qualified financial advisor before making any investment decisions.</li>
                    <li>The platform does not guarantee the accuracy, completeness, or reliability of any data or analysis.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockAnalytics;
