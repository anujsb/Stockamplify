//src/lib/rateLimit/rateLimit.ts
import { db } from "@/lib/db";
import { features, featureUsage, planFeatures } from "@/lib/db/schema";
import { SubscriptionService } from "@/lib/services/subscriptionService";
import { FEATURE_META, type FeatureCode } from "@/lib/utils/constants";
import { format } from "date-fns";
import { and, eq, gte, lte } from "drizzle-orm";

/**
 * Produce a YYYY-MM-DD string for "today" in server local time.
 * If you need Europe/Amsterdam exact midnight, consider date-fns-tz.
 */
function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// --- helper functions (place near top of file) ---
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Compute periodStart/periodEnd (YYYY-MM-DD) and resetTime ISO for given resetInterval.
 * Supports: daily (default), monthly, weekly (Mon-Sun), hourly (approx using date-only period).
 */
function computeIntervalAndReset(resetInterval?: string) {
  const now = new Date();

  if (!resetInterval || resetInterval.toLowerCase() === "daily") {
    const start = toDateStr(now);
    const end = start;
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    tom.setHours(0, 0, 0, 0);
    return { periodStart: start, periodEnd: end, resetTimeISO: tom.toISOString() };
  }

  if (resetInterval.toLowerCase() === "monthly") {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextReset.setHours(0, 0, 0, 0);
    return {
      periodStart: toDateStr(startDate),
      periodEnd: toDateStr(endDate),
      resetTimeISO: nextReset.toISOString(),
    };
  }

  if (resetInterval.toLowerCase() === "weekly") {
    // ISO-like week starting Monday
    const day = (now.getDay() + 6) % 7; // 0 = Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);
    const nextReset = new Date(weekStart);
    nextReset.setDate(weekStart.getDate() + 7);
    nextReset.setHours(0, 0, 0, 0);
    const weekEnd = new Date(nextReset);
    weekEnd.setDate(nextReset.getDate() - 1);
    return {
      periodStart: toDateStr(weekStart),
      periodEnd: toDateStr(weekEnd),
      resetTimeISO: nextReset.toISOString(),
    };
  }

  if (resetInterval.toLowerCase() === "hourly") {
    // NOTE: your DB stores date-only period_start/period_end. For "hourly" this will still
    // aggregate rows by date. If you later store hour windows, update schema and queries.
    const start = toDateStr(now);
    const tom = new Date(now);
    tom.setHours(now.getHours() + 1, 0, 0, 0);
    return { periodStart: start, periodEnd: start, resetTimeISO: tom.toISOString() };
  }

  // fallback to daily
  const start = toDateStr(now);
  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  tom.setHours(0, 0, 0, 0);
  return { periodStart: start, periodEnd: start, resetTimeISO: tom.toISOString() };
}

/**
 * Check current usage & quota for any feature.
 * - userId is the numeric DB id (users.id)
 * - featureCode is the feature code (e.g., "AI_ANALYSIS", "PORTFOLIO")
 */
export async function checkLimit(userId: number, featureCode: FeatureCode) {
  // 1) Get user's current plan from subscription
  const planId = await SubscriptionService.getUserPlanId(userId);

  // 2) Quota for this feature on that plan
  const [planFeature] = await db
    .select({ quota: planFeatures.quota, resetInterval: planFeatures.resetInterval })
    .from(planFeatures)
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .where(and(eq(planFeatures.planId, planId), eq(features.code, featureCode)));

  const quota = planFeature?.quota ?? 0;
  const resetInterval = planFeature?.resetInterval ?? "daily";

  // 2) compute interval
  const { periodStart, periodEnd, resetTimeISO } = computeIntervalAndReset(resetInterval);

  // 3) Usage for today (date-only)
  const [usage] = await db
    .select({ usedCount: featureUsage.usedCount })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.featureCode, featureCode),
        gte(featureUsage.periodStart, periodStart),
        lte(featureUsage.periodEnd, periodEnd)
      )
    );

  const count = usage?.usedCount ?? 0;
  const remaining = Math.max(0, quota - count);
  const allowed = remaining > 0;

  return {
    allowed,
    count,
    remaining,
    limit: quota,
    periodStart,
    periodEnd,
    resetTime: resetTimeISO,
  };
}

/**
 * Increment today's usage for any feature.
 * - userId is the numeric DB id (users.id)
 * - featureCode is the feature code (e.g., "AI_ANALYSIS", "PORTFOLIO")
 */
export async function incrementCount(userId: number, featureCode: FeatureCode) {
  const planId = await SubscriptionService.getUserPlanId(userId);
  const [planFeature] = await db
    .select({ quota: planFeatures.quota, resetInterval: planFeatures.resetInterval })
    .from(planFeatures)
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .where(and(eq(planFeatures.planId, planId), eq(features.code, featureCode)));

  const quota = Number(planFeature?.quota ?? 0);
  const resetInterval = planFeature?.resetInterval ?? "daily";
  const { periodStart, periodEnd, resetTimeISO } = computeIntervalAndReset(resetInterval);

  const existing = await db
    .select({ id: featureUsage.id, usedCount: featureUsage.usedCount })
    .from(featureUsage)
    .where(
      and(
        eq(featureUsage.userId, userId),
        eq(featureUsage.featureCode, featureCode),
        gte(featureUsage.periodStart, periodStart),
        lte(featureUsage.periodEnd, periodEnd)
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
      periodStart: periodStart,
      periodEnd: periodEnd,
      usedCount: 1,
    });
  }
}

/**
 * Get usage summary for all features for a user (respecting per-feature resetInterval)
 */
export async function getUserUsageSummary(userId: number) {
  // Get user's plan from subscription
  const planId = await SubscriptionService.getUserPlanId(userId);
  if (!planId) return null;

  // Get all feature quotas for the user's plan
  const planFeaturesData = await db
    .select({
      featureCode: features.code,
      featureName: features.name,
      quota: planFeatures.quota,
      resetInterval: planFeatures.resetInterval,
    })
    .from(planFeatures)
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .where(eq(planFeatures.planId, planId));

  // For each feature, compute its current interval and query usage for that exact interval.
  const rows = await Promise.all(
    planFeaturesData.map(async (pf) => {
      const interval = computeIntervalAndReset(pf.resetInterval ?? undefined);
      // Query usage for this user+feature+period
      const [usage] = await db
        .select({ usedCount: featureUsage.usedCount })
        .from(featureUsage)
        .where(
          and(
            eq(featureUsage.userId, userId),
            eq(featureUsage.featureCode, pf.featureCode),
            eq(featureUsage.periodStart, interval.periodStart),
            eq(featureUsage.periodEnd, interval.periodEnd)
          )
        );

      const usedCount = usage?.usedCount ?? 0;
      const remaining = Math.max(0, (pf.quota ?? 0) - usedCount);

      const meta = (FEATURE_META as any)?.[pf.featureCode] ?? null;

      return {
        featureCode: pf.featureCode as FeatureCode,
        featureName: pf.featureName,
        short: meta?.short ?? pf.featureName,
        description: meta?.description ?? "",
        quota: pf.quota ?? 0,
        used: usedCount,
        remaining,
        resetInterval: pf.resetInterval,
        resetTime: interval.resetTimeISO,
        periodStart: interval.periodStart,
        periodEnd: interval.periodEnd,
      };
    })
  );

  return rows;
}
