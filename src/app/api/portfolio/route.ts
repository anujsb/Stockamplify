// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

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

    const portfolio = await UserService.getUserPortfolioWithDetails(user.id);
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

// POST /api/portfolio - Add stock to user's portfolio
export async function POST(req: NextRequest): Promise<NextResponse<PortfolioResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { symbol, quantity, buyPrice } = body;
    if (!symbol || !quantity || !buyPrice) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Find the stock in the DB (by symbol, prefer NSE, fallback to BSE)
    const stock = await (async () => {
      const { db } = await import('@/lib/db');
      const { stocks } = await import('@/lib/db/schema');
      // Try NSE first
      let found = await db.select().from(stocks).where(and(eq(stocks.symbol, symbol), eq(stocks.exchange, 'NSE'))).limit(1);
      if (found.length === 0) {
        // Try BSE
        found = await db.select().from(stocks).where(and(eq(stocks.symbol, symbol), eq(stocks.exchange, 'BSE'))).limit(1);
      }
      return found[0];
    })();

    if (!stock) {
      return NextResponse.json({ success: false, error: 'Stock not found in database' }, { status: 404 });
    }

    // Add stock to user's portfolio
    await UserService.addStockToPortfolio(user.id, stock.id, Number(quantity), Number(buyPrice));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/portfolio - Delete stock from user's portfolio
export async function DELETE(req: NextRequest): Promise<NextResponse<PortfolioResponse>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const user = await UserService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 });
    }
    // Find the portfolio entry and ensure it belongs to the user
    // Remove by portfolio row id (userStocks.id)
    const result = await UserService.removeStockFromPortfolioById(user.id, Number(id));
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to remove stock' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/portfolio:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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