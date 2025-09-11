import { auth } from "@/lib/auth";
import { checkLimit, incrementCount } from "@/lib/rateLimit/rateLimit";
import { getQuarterLabels, getUserAceMatches } from "@/lib/services/aceMatches";
import { UserService } from "@/lib/services/userService";
import { FEATURE_CODES } from "@/lib/utils/constants";
import { NextRequest, NextResponse } from "next/server";

function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    if (obj instanceof Date) return obj.toISOString();
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        if (typeof v === "bigint") return [k, v.toString()];
        if (v instanceof Date) return [k, v.toISOString()];
        return [k, convertBigIntToString(v)];
      })
    );
  }
  return obj;
}

type CacheEntry = {
  data: {
    labels: {
      latest: string | null;
      previous: string | null;
    };
    matches: {
      active: any[];
      exited: any[];
    };
    totalInvestment: number;
    matchedInvestment: number;
  };
  expiresAt: number;
};

// In-memory cache (per serverless instance)
const cache = new Map<string, CacheEntry>();

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.nextAuthId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserService.getUserByNextAuthId(session.user.nextAuthId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const userId = session?.user?.dbUserId;

    // Rate limit check
    const { allowed, remaining, count, limit } = await checkLimit(
      userId,
      FEATURE_CODES.SMART_MONEY
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

    const cacheKey = `ace-matches:${userId}`;
    const cached = cache.get(cacheKey);

    // ✅ Serve from cache if still valid
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ success: true, data: cached.data });
    }

    // ✅ Fetch fresh
    const [labels, matchData] = await Promise.all([getQuarterLabels(), getUserAceMatches(user.id)]);

    const responseData = convertBigIntToString({
      labels,
      matches: {
        active: matchData.active,
        exited: matchData.exited,
      },
      totalInvestment: matchData.totalInvestment ?? 0,
      matchedInvestment: matchData.matchedInvestment ?? 0,
      totalStockHeldByUser: matchData.totalStockHeldByUser ?? 0,
    });

    // ✅ Expire cache at next day's midnight (e.g., 10th 00:00 if cached on 9th anytime)
    const now = new Date();
    const nextDayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    const expiresAt = nextDayMidnight.getTime();

    // ✅ Save to cache
    cache.set(cacheKey, {
      data: responseData,
      expiresAt,
    });

    // Increment count of rate limit
    await incrementCount(userId, FEATURE_CODES.SMART_MONEY);

    // Get updated remaining count
    const updated = await checkLimit(userId, FEATURE_CODES.SMART_MONEY);

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        rateLimit: {
          count: updated.count,
          remaining: updated.remaining,
          limit: updated.limit,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
