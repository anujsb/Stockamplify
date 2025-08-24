import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AIPortfolioAdvisorService } from "@/lib/services/aiPortfolioAdvisorService";

/**
 * POST API → /api/ai-portfolio-advisor
 * Accepts a `portfolio` array and returns AI-based portfolio insights.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse portfolio from request body
    const { portfolio } = await request.json();
    if (!portfolio || !Array.isArray(portfolio)) {
      return NextResponse.json(
        { error: "Missing or invalid portfolio data" },
        { status: 400 }
      );
    }

    // Call the AI Portfolio Advisor service
    const advisorInsights = AIPortfolioAdvisorService.GetAdvisorInsights(portfolio);

    // Return the results
    return NextResponse.json({
      success: true,
      data: advisorInsights,
    });
  } catch (error) {
    console.error("AI Portfolio Advisor API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}