// src/app/api/trade-signals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GetTradeSignalsData } from "@/lib/services/tradeSignalService";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { portfolio } = await request.json();
    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json(
        { error: "Missing or invalid portfolio" },
        { status: 400 }
      );
    }

    const data = GetTradeSignalsData(portfolio);

    return NextResponse.json({
      success: true,
      data, // { movingAverageData, volumeAnalysisData, weekRangeData }
    });
  } catch (error) {
    console.error("Trade Signals API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
