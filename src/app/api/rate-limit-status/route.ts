// app/api/rate-limit-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkLimit } from "@/lib/rateLimit/rateLimit";
import { FEATURE_CODES, type FeatureCode } from "@/lib/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.nextAuthId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!FEATURE_CODES || typeof FEATURE_CODES !== "object") {
      return NextResponse.json(
        { error: "Server configuration error: missing feature map" },
        { status: 500 }
      );
    }

    const featureParam = request.nextUrl.searchParams.get("feature");
    const featureCode = resolveFeatureCode(featureParam);

    if (!featureCode) {
      return NextResponse.json(
        { error: "Invalid or missing feature parameter" },
        { status: 400 }
      );
    }

    const { count, remaining, limit } = await checkLimit(
      Number(session.user.dbUserId),
      featureCode
    );

    return NextResponse.json({
      count,
      remaining,
      limit,
      resetTime: getTomorrowMidnight(),
    });
  } catch (error) {
    console.error("Rate limit status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function resolveFeatureCode(param: string | null | undefined): FeatureCode | undefined {
  if (!param) return undefined;

  const trimmed = param.trim();

  // SAFETY: FEATURE_CODES may be undefined due to import/circular issues, guard anyway
  if (!FEATURE_CODES || typeof FEATURE_CODES !== "object") return undefined;

  // 1) Direct match against values (your actual feature codes)
  const values = Object.values(FEATURE_CODES) as string[]; // safe now
  if (values.includes(trimmed)) {
    return trimmed as FeatureCode;
  }

  // 2) Match against keys (case-insensitive)
  const keys = Object.keys(FEATURE_CODES) as Array<keyof typeof FEATURE_CODES>;
  const foundKey = keys.find((k) => k.toLowerCase() === trimmed.toLowerCase());
  if (foundKey) return FEATURE_CODES[foundKey];

  return undefined;
}

function getTomorrowMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
