'use client';

import { useEffect, useState } from 'react';
import { BarChart2, ArrowUp, Activity, Shield, RefreshCw, Info, CheckCircle, AlertTriangle, TrendingUp, Target, DollarSign, Flag, Clock, Info as InfoIcon, Sparkles, ChartBar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface AIAnalysisProps {
  item: any;
}

function parseAIResponse(data: any): any {
  // Handles code block, stringified JSON, or object
  if (!data) return null;
  if (typeof data === 'object' && !('raw' in data)) return data;
  if (typeof data === 'string') {
    let str = data.trim();
    if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
    if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(str);
    } catch {
      try {
        // eslint-disable-next-line no-eval
        return eval('(' + str + ')');
      } catch {
        return { raw: data };
      }
    }
  }
  // If we have a { raw: ... } object, try to parse its value
  if (typeof data === 'object' && 'raw' in data && typeof data.raw === 'string') {
    let str = data.raw.trim();
    if (str.startsWith('```json')) str = str.replace(/^```json/, '').replace(/```$/, '').trim();
    if (str.startsWith('```')) str = str.replace(/^```/, '').replace(/```$/, '').trim();
    try {
      return JSON.parse(str);
    } catch {
      try {
        // eslint-disable-next-line no-eval
        return eval('(' + str + ')');
      } catch {
        return data;
      }
    }
  }
  return data;
}

function getBadgeVariant(val: string): "default" | "secondary" | "destructive" | "outline" {
  if (!val) return 'secondary';
  if (/buy|positive/i.test(val)) return 'default';
  if (/sell|negative/i.test(val)) return 'destructive';
  if (/hold|neutral/i.test(val)) return 'outline';
  return 'secondary';
}

function getBadgeColor(val: string) {
  if (!val) return 'bg-gray-100 text-gray-600 border-gray-200';
  if (/buy/i.test(val)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/sell/i.test(val)) return 'bg-red-50 text-red-700 border-red-200';
  if (/hold/i.test(val)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (/positive/i.test(val)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/negative/i.test(val)) return 'bg-red-50 text-red-700 border-red-200';
  if (/neutral/i.test(val)) return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

function RiskBar({ score }: { score: number }) {
  const percent = Math.max(0, Math.min(1, score || 0));
  const percentValue = percent * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Risk Level</span>
        <span className="text-sm font-semibold text-gray-900">{percentValue.toFixed(0)}%</span>
      </div>
      <Progress value={percentValue} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

const metricTooltips = {
  sentiment: 'AI-determined overall market sentiment for this stock based on multiple data points.',
  recommendation: 'AI-generated investment recommendation: Buy, Hold, or Sell.',
  riskScore: 'AI-calculated risk assessment score (0 = low risk, 1 = high risk).',
  volatility: 'AI-assessed price volatility and market stability indicators.',
};

export default function AIAnalysis({ item }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [regenKey, setRegenKey] = useState(0);

  const fetchAnalysis = () => {
    if (!item.stock.symbol) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setTimestamp(null);

    // IMPROVED: Pass the complete item data structure
    const payload = {
      // Pass the entire item structure that matches the API expectations
      stock: item.stock,
      realTimePrice: item.realTimePrice || {},
      intradayPrice: item.intradayPrice || {},
      fundamentalData: item.fundamentalData || {},
      financialData: item.financialData || {},
      statistics: item.statistics || {},
      analystRating: item.analystRating || {},
      quantity: item.quantity || 0,
      buyPrice: item.buyPrice || 0,
      addedAt: item.addedAt
    };

    fetch(`/api/stocks/${item.stock.symbol}/ai-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(errorText);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Received analysis:', data); // Debug log
        setAnalysis(parseAIResponse(data.analysis));
        setTimestamp(data.generatedAt || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setError('Failed to fetch AI analysis: ' + error.message);
        setLoading(false);
      });
  };



  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, regenKey]);

  const sentiment = analysis?.sentiment || 'N/A';
  const recommendation = analysis?.recommendation || 'N/A';
  const riskScore = typeof analysis?.riskScore === 'number' ? analysis.riskScore : (parseFloat(analysis?.riskScore) || 0);
  const volatility = analysis?.volatility || 'N/A';
  const prediction = analysis?.prediction || '';
  const explanation = analysis?.explanation || '';

  const strengths = analysis?.strengths || '';
  const weaknesses = analysis?.weaknesses || '';
  const confidence = analysis?.confidence || '';
  const confidenceScore = typeof analysis?.confidenceScore === 'number' ? analysis.confidenceScore : (parseFloat(analysis?.confidenceScore) || 0);
  const priceRange = analysis?.priceRange || '';
  const targetPrice = analysis?.targetPrice || '';
  const stoploss = analysis?.stoploss || '';
  const timeFrame = analysis?.timeFrame || '';
  // const disclaimer = analysis?.disclaimer || '';
  const nextSteps = analysis?.nextSteps || '';

  // Only show extra fields if there are any besides the standard ones
  const extraFields = analysis && typeof analysis === 'object'
    ? Object.entries(analysis).filter(([k]) => !['sentiment', 'recommendation', 'riskScore', 'volatility', 'prediction', 'explanation'].includes(k))
    : [];

  // Loading skeletons
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg 
    {className}`} />
  );

  // Update the LoadingSkeleton component with this enhanced version
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <div>
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Recommendation & Confidence Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 shadow-md border border-gray-100">
          <CardContent className="p-6 flex flex-col items-center">
            <Skeleton className="h-8 w-32 mb-2 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        <Card className="flex-1 shadow-md border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Metrics Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex-1 shadow-md border border-gray-100">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prediction Skeleton */}
      <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="flex-1 shadow-md border border-gray-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // New: Collapsible explanation
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="space-y-6">
      {loading ? (
        <>
          <div className="flex items-center justify-center gap-2 p-4 text-blue-600 font-medium">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-lg">AI Analysis in Progress...</span>
          </div>
          <LoadingSkeleton />
        </>
      ) : (
        <>
          {/* Header: Stock Info & Last Updated */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
            <div>
              <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {item.stock?.name || item.stock?.symbol}
                <span className="text-xs font-medium text-gray-400">{item.stock?.symbol}</span>
              </div>
              <div className="text-xs text-gray-500">{item.stock?.sector} {item.stock?.industry && `| ${item.stock.industry}`}</div>
            </div>
            {timestamp && (
              <span className="text-xs text-gray-400">Last updated: {new Date(timestamp).toLocaleString()}</span>
            )}
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 transition"
              onClick={() => setRegenKey((k) => k + 1)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {/* Row 1: Recommendation & Confidence */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1 shadow-md border border-gray-100 flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-lg px-4 py-2 font-bold ${getBadgeColor(recommendation)} text-xl`}>{recommendation}</Badge>
                <span className="text-xs text-gray-500">Recommendation</span>
              </div>
            </Card>
            {confidenceScore > 0 && (
              <Card className="flex-1 shadow-md border border-blue-200 flex flex-col items-center justify-center p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-blue-800">AI Confidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-3 rounded-full transition-all duration-300 bg-blue-500" style={{ width: `${Math.max(0, Math.min(1, confidenceScore)) * 100}%` }} />
                  </div>
                  <span className="text-blue-800 font-semibold">{(Math.max(0, Math.min(1, confidenceScore)) * 100).toFixed(0)}%</span>
                </div>
                {confidence && <div className="text-xs text-blue-700 mt-1">{confidence}</div>}
              </Card>
            )}
          </div>

          {/* Row 2: Trade Plan */}
          {/* Row 2: Trade Plan */}
          {(priceRange || targetPrice || stoploss || timeFrame) && (
            <Card className="shadow-md border border-indigo-200">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <ChartBar className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg font-bold">AI Trade Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceRange && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Flag className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-indigo-900 block mb-1">Price Range</span>
                          <p className="text-sm text-indigo-800 leading-relaxed">{priceRange}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {targetPrice && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-green-900 block mb-1">Target Price</span>
                          <p className="text-sm text-green-800 leading-relaxed">{targetPrice}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {stoploss && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-red-900 block mb-1">Stop Loss</span>
                          <p className="text-sm text-red-800 leading-relaxed">{stoploss}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {timeFrame && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-purple-900 block mb-1">Time Frame</span>
                          <p className="text-sm text-purple-800 leading-relaxed">{timeFrame}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Row 3: Sentiment, Risk, Volatility */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1 shadow-md border border-gray-100 flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`px-3 py-1 font-semibold ${getBadgeColor(sentiment)}`}>{sentiment}</Badge>
                <span className="text-xs text-gray-500">Sentiment</span>
              </div>
            </Card>
            <Card className="flex-1 shadow-md border border-gray-100 flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="h-5 w-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">Risk Score</span>
              </div>
              <RiskBar score={riskScore} />
            </Card>
            <Card className="flex-1 shadow-md border border-gray-100 flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <span className="font-bold text-orange-800">Volatility</span>
              </div>
              <Badge className={`px-3 py-1 font-semibold ${getBadgeColor(volatility)}`}>{volatility}</Badge>
            </Card>
          </div>

          {/* Row 4: Prediction */}
          {prediction && (
            <Card className="shadow-md border border-green-200">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <ArrowUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg font-bold">AI Short-Term Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded p-4 text-center text-lg font-semibold text-green-800">
                  {prediction}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Row 5: Strengths & Weaknesses */}
          {(strengths || weaknesses) && (
            <div className="flex flex-col md:flex-row gap-4">
              {strengths && (
                <Card className="flex-1 shadow-md border border-green-200">
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg font-bold">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-green-800 text-sm">{strengths}</div>
                  </CardContent>
                </Card>
              )}
              {weaknesses && (
                <Card className="flex-1 shadow-md border border-yellow-200">
                  <CardHeader className="pb-2 flex flex-row items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg font-bold">Weaknesses / Risks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-yellow-800 text-sm">{weaknesses}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Row 6: Next Steps */}
          {nextSteps && (
            <Card className="shadow-md border border-purple-200">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-purple-800 text-sm">{nextSteps}</div>
              </CardContent>
            </Card>
          )}

          {/* Row 7: Explanation (collapsible) */}
          {explanation && (
            <Card className="shadow-md border border-blue-100">
              <CardHeader className="pb-2 flex flex-row items-center gap-2 cursor-pointer select-none" onClick={() => setShowExplanation((v) => !v)}>
                <Info className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg font-bold">AI Reasoning & Explanation</CardTitle>
                <span className="ml-auto text-xs text-blue-500">{showExplanation ? 'Hide' : 'Show'}</span>
              </CardHeader>
              {showExplanation && (
                <CardContent>
                  <div className="text-blue-800 text-sm whitespace-pre-line">{explanation}</div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Row 8: Disclaimer */}
          {/* {disclaimer && ( */}
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
                    <li>This AI-generated analysis is based solely on the provided OHLCV data and does not include fundamental analysis, broader market conditions, news, or other technical indicators.</li>
                    <li>Stock trading involves significant risk, and past performance is not indicative of future results.</li>
                    <li>All information is for educational purposes only. We strongly recommend conducting your own research and consulting a qualified financial advisor before making any investment decisions.</li>
                    <li>The platform does not guarantee the accuracy, completeness, or reliability of any data or analysis.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* )} */}

          {/* Extra fields if present */}
          {extraFields.length > 0 && (
            <Card className="shadow-md border border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-700">Other AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  {extraFields.map(([k, v]) => (
                    <li key={k}><span className="font-medium">{k}:</span> {String(v)}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}



export const validatePortfolioData = (item: any) => {
  const issues = [];

  if (!item.stock?.symbol) issues.push('Missing stock symbol');
  if (!item.realTimePrice?.price) issues.push('Missing current price');
  if (!item.fundamentalData?.trailingPE && !item.fundamentalData?.epsTTM) {
    issues.push('Missing fundamental data');
  }
  if (!item.financialData?.profitMargin && !item.financialData?.totalRevenue) {
    issues.push('Missing financial data');
  }

  return {
    isValid: issues.length === 0,
    issues,
    dataCompleteness: calculateDataCompleteness(item)
  };
};

const calculateDataCompleteness = (item: any) => {
  const checks = [
    !!item.stock?.symbol,
    !!item.realTimePrice?.price,
    !!item.intradayPrice?.previousClose,
    !!item.fundamentalData?.trailingPE,
    !!item.financialData?.profitMargin,
    !!item.analystRating?.recommendation
  ];

  return (checks.filter(Boolean).length / checks.length) * 100;
};