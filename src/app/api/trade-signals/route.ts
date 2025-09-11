// src/app/api/trade-signals/route.ts
import { auth } from "@/lib/auth";
import { checkLimit, incrementCount } from "@/lib/rateLimit/rateLimit";
import { GetTradeSignalsData } from "@/lib/services/tradeSignalService";
import { FEATURE_CODES } from "@/lib/utils/constants";
import { NextRequest, NextResponse } from "next/server";

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
      FEATURE_CODES.TRADE_SIGNALS
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: `You have used all ${limit} limit today. Try again tomorrow.`,
          message: "Daily limit exceeded",
          remaining,
          count,
        },
        { status: 429 }
      );
    }

    const { portfolio } = await request.json();
    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json({ error: "Missing or invalid portfolio" }, { status: 400 });
    }

    const data = GetTradeSignalsData(portfolio);

    // Increment count of rate limit
    await incrementCount(userId, FEATURE_CODES.TRADE_SIGNALS);

    // Get updated remaining count
    const updated = await checkLimit(userId, FEATURE_CODES.TRADE_SIGNALS);

    return NextResponse.json({
      success: true,
      data, // { movingAverageData, volumeAnalysisData, weekRangeData }
      rateLimit: {
        count: updated.count,
        remaining: updated.remaining,
        limit: updated.limit,
      },
    });
  } catch (error) {
    console.error("Trade Signals API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
