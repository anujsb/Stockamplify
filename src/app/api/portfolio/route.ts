// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { auth } from '@clerk/nextjs/server';

// Define the response type for clarity and type safety
interface PortfolioResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

// Helper to convert BigInt to string recursively
function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : convertBigIntToString(v)])
    );
  }
  return obj;
}

// GET /api/portfolio - Get user's portfolio
export async function GET(req: NextRequest): Promise<NextResponse<PortfolioResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const portfolio = await UserService.getUserPortfolio(user.id);
    return NextResponse.json(
      { success: true, data: convertBigIntToString(portfolio) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optionally, handle unsupported methods (for edge runtime or custom routing)
export function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
  }
  // @ts-ignore
  return GET(req);
}