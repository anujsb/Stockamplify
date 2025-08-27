import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserUsageSummary } from '@/lib/rateLimit/rateLimit';
import { SubscriptionService } from "@/lib/services/subscriptionService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.dbUserId;

    // Ensure user has a subscription
    await SubscriptionService.ensureUserHasSubscription(userId);

    // Get user's current subscription
    const userPlan = await SubscriptionService.getUserSubscription(userId);

    // Get usage summary for all features
    const usageSummary = await getUserUsageSummary(userId);

    return NextResponse.json({
      success: true,
      data: {
        plan: userPlan,
        usage: usageSummary
      }
    });

  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
