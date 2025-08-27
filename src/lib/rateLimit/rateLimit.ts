import { db } from "@/lib/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { featureUsage, planFeatures, features, subscriptions } from "@/lib/db/schema";
import { format } from "date-fns";
import { SubscriptionService } from "@/lib/services/subscriptionService";

// Feature codes from your features.json
export const FEATURE_CODES = {
  PORTFOLIO: "PORTFOLIO",
  AI_ANALYSIS: "AI_ANALYSIS", 
  MARKET_NEWS: "MARKET_NEWS",
  STOCK_SEARCH: "STOCK_SEARCH"
} as const;

export type FeatureCode = typeof FEATURE_CODES[keyof typeof FEATURE_CODES];

/**
 * Produce a YYYY-MM-DD string for "today" in server local time.
 * If you need Europe/Amsterdam exact midnight, consider date-fns-tz.
 */
function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Check current usage & quota for any feature.
 * - userId is the numeric DB id (users.id)
 * - featureCode is the feature code (e.g., "AI_ANALYSIS", "PORTFOLIO")
 */
export async function checkLimit(userId: number, featureCode: FeatureCode) {
  const today = todayStr();

  // 1) Get user's current plan from subscription
  const planId = await SubscriptionService.getUserPlanId(userId);

  // 2) Quota for this feature on that plan
  const [planFeature] = await db
    .select({ quota: planFeatures.quota })
    .from(planFeatures)
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .where(and(eq(planFeatures.planId, planId), eq(features.code, featureCode)));

  const quota = planFeature?.quota ?? 0;

  // 3) Usage for today (date-only)
  const [usage] = await db
    .select({ usedCount: featureUsage.usedCount })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.featureCode, featureCode),
        gte(featureUsage.periodStart, today),
        lte(featureUsage.periodEnd, today)
      )
    );

  const count = usage?.usedCount ?? 0;
  const remaining = Math.max(0, quota - count);
  const allowed = remaining > 0;

  return { allowed, count, remaining, limit: quota };
}

/**
 * Increment today's usage for any feature.
 * - userId is the numeric DB id (users.id)
 * - featureCode is the feature code (e.g., "AI_ANALYSIS", "PORTFOLIO")
 */
export async function incrementCount(userId: number, featureCode: FeatureCode) {
  const today = todayStr();

  const existing = await db
    .select({ id: featureUsage.id, usedCount: featureUsage.usedCount })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.featureCode, featureCode),
        gte(featureUsage.periodStart, today),
        lte(featureUsage.periodEnd, today)
      )
    );

  if (existing.length > 0) {
    await db
      .update(featureUsage)
      .set({ usedCount: existing[0].usedCount + 1 })
      .where(eq(featureUsage.id, existing[0].id));
  } else {
    await db.insert(featureUsage).values({
      userId,
      featureCode: featureCode,
      periodStart: today,
      periodEnd: today,
      usedCount: 1,
    });
  }
}

/**
 * Get usage summary for all features for a user
 */
export async function getUserUsageSummary(userId: number) {
  const today = todayStr();
  
  // Get user's plan from subscription
  const planId = await SubscriptionService.getUserPlanId(userId);

  if (!planId) {
    return null;
  }

  // Get all feature quotas for the user's plan
  const planFeaturesData = await db
    .select({
      featureCode: features.code,
      featureName: features.name,
      quota: planFeatures.quota,
      resetInterval: planFeatures.resetInterval
    })
    .from(planFeatures)
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .where(eq(planFeatures.planId, planId));

  // Get today's usage for all features
  const usageData = await db
    .select({
      featureCode: featureUsage.featureCode,
      usedCount: featureUsage.usedCount
    })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        gte(featureUsage.periodStart, today),
        lte(featureUsage.periodEnd, today)
      )
    );

  // Combine quota and usage data
  const summary = planFeaturesData.map(planFeature => {
    const usage = usageData.find(u => u.featureCode === planFeature.featureCode);
    const usedCount = usage?.usedCount ?? 0;
    const remaining = Math.max(0, planFeature.quota - usedCount);
    
    return {
      featureCode: planFeature.featureCode,
      featureName: planFeature.featureName,
      quota: planFeature.quota,
      used: usedCount,
      remaining,
      resetInterval: planFeature.resetInterval
    };
  });

  return summary;
}
