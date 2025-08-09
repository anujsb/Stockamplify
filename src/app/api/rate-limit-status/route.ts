import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkLimit } from '@/lib/rateLimit/rateLimit';

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
  }

  const { count, remaining, limit } = await checkLimit(userId);

  return NextResponse.json({
    count,
    remaining,
    limit,
    resetTime: getTomorrowMidnight()
  });
}

function getTomorrowMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
