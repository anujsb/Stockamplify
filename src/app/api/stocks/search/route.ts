import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/services/searchService';
import { db } from '@/lib/db';
import { stocks } from '@/lib/db/schema';
import { like, or } from 'drizzle-orm';

export interface StockSearchResult {
  symbol: string;
  name: string;
  type?: string;
  region?: string;
  marketOpen?: string;
  marketClose?: string;
  timezone?: string;
  currency?: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  source: 'database' | 'yahoo';
}

// Handle stock search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is missing' }, { status: 400 });
    }

    const searchTerm = query.trim();
    
    // Search in the database first (by symbol or name), only for Indian exchanges
    const dbResults = await db
      .select()
      .from(stocks)
      .where(
        like(stocks.name, `%${searchTerm}%`)
      )
      .limit(20);

    // Also search by symbol
    const symbolResults = await db
      .select()
      .from(stocks)
      .where(
        like(stocks.symbol, `%${searchTerm.toUpperCase()}%`)
      )
      .limit(10);

    // Combine and filter for Indian exchanges only
    const combinedDbResults = [...dbResults, ...symbolResults]
      .filter((stock, index, self) =>
        (stock.exchange === 'NSE' || stock.exchange === 'BSE') &&
        index === self.findIndex(s => s.id === stock.id)
      )
      .slice(0, 10)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        type: 'Equity',
        region: 'India',
        marketOpen: '09:15',
        marketClose: '15:30',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        exchange: stock.exchange,
        sector: stock.sector,
        industry: stock.industry,
        source: 'database' as const
      }));

    // If we have good database results, return them
    if (combinedDbResults.length > 0) {
      return NextResponse.json(combinedDbResults);
    }

    // If not found in DB, search Yahoo Finance
    try {
let yahooResults = await SearchService.searchStocks(searchTerm);
      
      // If the search term looks like a bank name (ends with I, C, etc.), try adding BANK suffix
      if (searchTerm.toUpperCase().endsWith('I') || searchTerm.toUpperCase().endsWith('C')) {
const bankResults = await SearchService.searchStocks(searchTerm + 'BANK');
        yahooResults = [...yahooResults, ...bankResults];
      }
      // Filter for Indian stocks only (NSI/BSE or region IN) and prioritize actual stocks over mutual funds
      const filteredYahooResults = yahooResults.filter(result => {
        const ex = result.exchange?.toUpperCase();
        const region = result.region?.toUpperCase();
        const quoteType = result.quoteType?.toUpperCase();
        
        // Only include Indian exchanges
        const isIndianExchange = ex === 'NSI' || ex === 'BSE' || region === 'IN';
        
        // Prioritize EQUITY over MUTUALFUND, FUTURE, etc.
        const isPreferredType = quoteType === 'EQUITY';
        
        // Filter out mutual funds and other non-stock instruments
        const isNotMutualFund = quoteType !== 'MUTUALFUND';
        
        return isIndianExchange && isNotMutualFund;
      });
      
      // Sort results to prioritize EQUITY stocks first
      filteredYahooResults.sort((a, b) => {
        const aIsEquity = a.quoteType?.toUpperCase() === 'EQUITY';
        const bIsEquity = b.quoteType?.toUpperCase() === 'EQUITY';
        
        if (aIsEquity && !bIsEquity) return -1;
        if (!aIsEquity && bIsEquity) return 1;
        
        // If both are same type, sort by score if available
        return (b.score || 0) - (a.score || 0);
      });
      // Format Yahoo results to match our interface
      const formattedYahooResults = filteredYahooResults.slice(0, 10).map(result => ({
        symbol: result.symbol,
        name: result.shortname || result.longname || result.symbol,
        type: result.quoteType || 'Equity',
        region: 'India',
        marketOpen: '09:15',
        marketClose: '15:30',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        exchange: result.exchange === 'NSI' ? 'NSE' : result.exchange,
        sector: result.sector,
        industry: result.industry,
        source: 'yahoo' as const
      }));
      return NextResponse.json(formattedYahooResults);
    } catch (yahooError) {
      //console.error('Yahoo Finance search failed:', yahooError);
      // Return empty array if both database and Yahoo searches fail
      return NextResponse.json([]);
    }
  } catch (error) {
    //console.error('Error during stock search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
