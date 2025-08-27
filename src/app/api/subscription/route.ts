import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    // Get user's current subscription details
    const userPlan = await SubscriptionService.getUserSubscription(userId);

    return NextResponse.json({
      success: true,
      data: userPlan
    });

  } catch (error) {
    console.error("Subscription API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.dbUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.dbUserId;
    const { planId } = await request.json();

    if (!planId || typeof planId !== 'number') {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    // Update user's subscription
    await SubscriptionService.updateUserSubscription(userId, planId);

    // Get updated subscription details
    const userPlan = await SubscriptionService.getUserSubscription(userId);

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      data: userPlan
    });

  } catch (error) {
    console.error("Subscription update error:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
