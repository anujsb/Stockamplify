import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkLimit, FEATURE_CODES } from '@/lib/rateLimit/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.nextAuthId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count, remaining, limit } = await checkLimit(Number(session.user.dbUserId), FEATURE_CODES.AI_ANALYSIS);

    return NextResponse.json({
      count,
      remaining,
      limit,
      resetTime: getTomorrowMidnight()
    });
  } catch (error) {
    console.error("Rate limit status API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getTomorrowMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
