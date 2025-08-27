import { auth } from "@/lib/auth";
import {
  checkLimit,
  FEATURE_CODES,
  incrementCount,
} from "@/lib/rateLimit/rateLimit";
import {
  callGeminiAI,
  transformAnalysisResponse,
  validateAnalysisResponse,
} from "@/lib/services/aiAnalysisService";
import {
  ChartService,
  TimeInterval,
  TimeRange,
} from "@/lib/services/chartService";
import { buildAnalysisPrompt } from "@/lib/utils/aiPromptBuilder";
import { getHorizonConfig } from "@/lib/utils/investmentHorizons";
import { NextRequest, NextResponse } from "next/server";

export interface AIStockAnalysisRequest {
  symbol: string;
  investmentHorizon: string;
  interval?: TimeInterval;
  period?: TimeRange;
  language?: string;
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user?.dbUserId;

    // Rate limit check
    const { allowed, remaining, count, limit } = await checkLimit(
      userId,
      FEATURE_CODES.AI_ANALYSIS
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: `You have used all ${limit} analyses today. Try again tomorrow.`,
          message: "Daily limit exceeded",
          remaining,
          count,
        },
        { status: 429 }
      );
    }
    const body: AIStockAnalysisRequest = await request.json();
    const {
      symbol,
      investmentHorizon,
      interval,
      period,
      language = "english",
    } = body;

    if (!symbol || !investmentHorizon) {
      return NextResponse.json(
        {
          error: "Missing required fields: symbol and investmentHorizon",
        },
        { status: 400 }
      );
    }

    // Get default interval and period based on investment horizon if not provided
    const horizonConfig = getHorizonConfig(investmentHorizon);
    const finalInterval = interval || horizonConfig.interval;
    const finalPeriod = period || horizonConfig.period;

    // Fetch chart data
    const chart = await ChartService.getChartData(
      symbol,
      finalPeriod,
      finalInterval
    );

    if (!chart) {
      return NextResponse.json(
        {
          error:
            "Failed to fetch chart data. Please check the symbol and try again.",
        },
        { status: 400 }
      );
    }

    // Prepare data for AI analysis
    const analysisData = {
      symbol,
      chart,
      investmentHorizon,
      interval: finalInterval,
      period: finalPeriod,
      language,
    };

    // Build AI prompt using the utility function
    const prompt = buildAnalysisPrompt(analysisData);

    // Call Gemini AI using the service
    const aiResponse = await callGeminiAI(prompt);

    if (!aiResponse.success) {
      return NextResponse.json(
        {
          error: aiResponse.error || "AI analysis failed",
          details: aiResponse.details,
        },
        { status: 500 }
      );
    }

    if (
      !aiResponse.analysis ||
      !validateAnalysisResponse(aiResponse.analysis)
    ) {
      return NextResponse.json(
        {
          error: "Invalid AI analysis response",
          details: "Missing required fields in analysis",
        },
        { status: 500 }
      );
    }

    const analysis = transformAnalysisResponse(
      aiResponse.analysis
    ) as AIStockAnalysisResponse;

    // Increment count of rate limit
    await incrementCount(userId, FEATURE_CODES.AI_ANALYSIS);

    // Get updated remaining count
    const updated = await checkLimit(userId, FEATURE_CODES.AI_ANALYSIS);

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
          hasChart: !!chart,
          dataPoints: chart?.quotes?.length || 0,
        },
      },
      rateLimit: {
        count: updated.count,
        remaining: updated.remaining,
        limit: updated.limit,
      },
    });
  } catch (error) {
    console.error("AI stock analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
