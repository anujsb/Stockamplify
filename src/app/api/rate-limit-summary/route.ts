// src/app/api/rate-limit-summary/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserUsageSummary } from "@/lib/rateLimit/rateLimit";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.dbUserId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getUserUsageSummary(Number(userId));
    if (summary == null) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    console.error("rate-limit-summary error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
