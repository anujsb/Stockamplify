import { NextRequest, NextResponse } from "next/server";
import { AIPortfolioAdvisorService } from "@/lib/services/aiPortfolioAdvisorService";
import { auth } from "@/lib/auth";

import { checkLimit, incrementCount } from "@/lib/rateLimit/rateLimit";
import { FEATURE_CODES } from "@/lib/utils/constants";

/**
 * POST API → /api/ai-portfolio-advisor
 * Accepts a `portfolio` array and returns AI-based portfolio insights.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.dbUserId;

    // Rate limit check
    const { allowed, remaining, count, limit } = await checkLimit(
      userId,
      FEATURE_CODES.AI_PORTFOLIO_ADVISOR
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: `You have used all ${limit} limit. Try again next month.`,
          message: "Monthly limit exceeded",
          remaining,
          count,
        },
        { status: 429 }
      );
    }

    // Parse portfolio from request body
    const { portfolio } = await request.json();
    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json({ error: "Missing or invalid portfolio data" }, { status: 400 });
    }

    // Call the AI Portfolio Advisor service
    const advisorInsights = AIPortfolioAdvisorService.GetAdvisorInsights(portfolio);

    // Increment count of rate limit
    await incrementCount(userId, FEATURE_CODES.AI_PORTFOLIO_ADVISOR);

    // Get updated remaining count
    const updated = await checkLimit(userId, FEATURE_CODES.AI_PORTFOLIO_ADVISOR);

    // Return the results
    return NextResponse.json({
      success: true,
      data: advisorInsights,
      rateLimit: {
        count: updated.count,
        remaining: updated.remaining,
        limit: updated.limit,
      },
    });
  } catch (error) {
    console.error("AI Portfolio Advisor API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}