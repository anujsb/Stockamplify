import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceService, TimeInterval, TimeRange } from '@/lib/services/yahooFinanceService';
import { getHorizonConfig } from '@/lib/utils/investmentHorizons';
import { buildAnalysisPrompt } from '@/lib/utils/aiPromptBuilder';
import { callGeminiAI, validateAnalysisResponse, transformAnalysisResponse } from '@/lib/services/aiAnalysisService';

export interface AIStockAnalysisRequest {
  symbol: string;
  investmentHorizon: string;
  interval?: TimeInterval;
  period?: TimeRange;
}

export interface AIStockAnalysisResponse {
  symbol: string;
  trendDirection: string;
  trendByTimeframe: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  trendConfidenceScore: number;
  volatility: string;
  volatilityScore: number;
  riskLevel: string;
  supportLevels: string[];
  resistanceLevels: string[];
  targetPrice: {
    upside: string;
    downside: string;
  };
  entryPoint: string;
  stopLoss: string;
  exitTarget: string;
  indicators: {
    RSI: string;
    MACD: string;
    SMA: string;
  };
  recommendation: string;
  confidenceScore: number;
  recommendedHoldingPeriod: string;
  suitableFor: string[];
  marketSentiment: string;
  sentimentSource: string;
  week52Comparison: {
    currentPrice: string;
    week52High: string;
    week52Low: string;
    position: string;
  };
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIStockAnalysisRequest = await request.json();
    const { symbol, investmentHorizon, interval, period } = body;

    if (!symbol || !investmentHorizon) {
      return NextResponse.json({ 
        error: 'Missing required fields: symbol and investmentHorizon' 
      }, { status: 400 });
    }

    // Get default interval and period based on investment horizon if not provided
    const horizonConfig = getHorizonConfig(investmentHorizon);
    const finalInterval = interval || horizonConfig.interval;
    const finalPeriod = period || horizonConfig.period;

    console.log(`Analyzing ${symbol} with horizon: ${investmentHorizon}, interval: ${finalInterval}, period: ${finalPeriod}`);

    // Fetch comprehensive stock data
    const stockData = await YahooFinanceService.getStockDataForAnalysis(symbol, finalPeriod, finalInterval);

    if (!stockData.quote) {
      return NextResponse.json({ 
        error: 'Failed to fetch stock data. Please check the symbol and try again.' 
      }, { status: 400 });
    }

    // Prepare data for AI analysis
    const analysisData = {
      symbol,
      quote: stockData.quote,
      modules: stockData.modules,
      historical: stockData.historical,
      chart: stockData.chart,
      investmentHorizon,
      interval: finalInterval,
      period: finalPeriod
    };

    // Build AI prompt using the utility function
    const prompt = buildAnalysisPrompt(analysisData);

    // Call Gemini AI using the service
    const aiResponse = await callGeminiAI(prompt);
    
    if (!aiResponse.success) {
      return NextResponse.json({ 
        error: aiResponse.error || 'AI analysis failed',
        details: aiResponse.details 
      }, { status: 500 });
    }

    if (!aiResponse.analysis || !validateAnalysisResponse(aiResponse.analysis)) {
      return NextResponse.json({ 
        error: 'Invalid AI analysis response',
        details: 'Missing required fields in analysis'
      }, { status: 500 });
    }

    const analysis = transformAnalysisResponse(aiResponse.analysis) as AIStockAnalysisResponse;

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        symbol,
        investmentHorizon,
        interval: finalInterval,
        period: finalPeriod,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          hasQuote: !!stockData.quote,
          hasModules: !!stockData.modules,
          historicalDataPoints: stockData.historical.length,
          hasChart: !!stockData.chart
        }
      }
    });

  } catch (error) {
    console.error('AI Stock Analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: String(error) 
    }, { status: 500 });
  }
}

 