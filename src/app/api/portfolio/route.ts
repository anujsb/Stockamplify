// src/app/api/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { StockDataService } from '@/lib/services/stockDataService';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { normalizeStockSymbol, isValidStockSymbol } from '@/lib/utils/stockUtils';

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

    // Validate input
    if (quantity <= 0 || buyPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid quantity or buy price' }, { status: 400 });
    }

    // Normalize and validate symbol format for Indian stocks
    const normalizedSymbol = normalizeStockSymbol(symbol);
    if (!isValidStockSymbol(normalizedSymbol)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Indian stock symbol format (must be e.g. RELIANCE.NS or SBIN.BO)' },
        { status: 400 }
      );
    }

    // Check if stock exists, if not fetch it using the same service as stocks page
    let existingStock = await StockDataService.getStockBySymbol(normalizedSymbol);
    let stockId: number;

    if (existingStock.length === 0) {
      // Fetch and create stock data first (same as stocks page)
      const stockResult = await StockDataService.createOrUpdateStockData(normalizedSymbol);
      if (!stockResult.success || !stockResult.stockId) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch stock data' },
          { status: 400 }
        );
      }
      stockId = stockResult.stockId;
    } else {
      stockId = existingStock[0].id;
    }

    // Add to user's portfolio
    const portfolioResult = await UserService.addStockToPortfolio(
      user.id,
      stockId,
      parseInt(quantity),
      parseFloat(buyPrice)
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Stock added to portfolio successfully',
      data: portfolioResult
    }, { status: 200 });
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