// src/app/api/stocks/update-intraday/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks, stockIntraDayPrice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { YahooFinanceService } from '@/lib/services/yahooFinanceService';

export async function POST() {
  try {
    console.log('Starting intraday data update for all stocks...');
    
    // Get all active stocks
    const activeStocks = await db
      .select()
      .from(stocks)
      .where(eq(stocks.isActive, true));

    if (activeStocks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active stocks found',
        data: { updatedCount: 0, totalStocks: 0 }
      });
    }

    let updatedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process stocks in batches to avoid overwhelming the API
    for (let i = 0; i < activeStocks.length; i += 3) {
      const batch = activeStocks.slice(i, i + 3);
      
      const batchPromises = batch.map(async (stock) => {
        try {
          // Fetch quote data from Yahoo Finance
          const quote = await YahooFinanceService.getQuote(stock.symbol);
          
          if (!quote || !quote.regularMarketPrice) {
            throw new Error(`Unable to fetch valid data for ${stock.symbol}`);
          }

          // Prepare intraday data
          const intradayData = {
            stockId: stock.id,
            previousClose: quote.regularMarketPreviousClose !== undefined ? quote.regularMarketPreviousClose.toString() : null,
            open: quote.regularMarketOpen !== undefined ? quote.regularMarketOpen.toString() : null,
            dayHigh: quote.regularMarketDayHigh !== undefined ? quote.regularMarketDayHigh.toString() : null,
            dayLow: quote.regularMarketDayLow !== undefined ? quote.regularMarketDayLow.toString() : null,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh !== undefined ? quote.fiftyTwoWeekHigh.toString() : null,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow !== undefined ? quote.fiftyTwoWeekLow.toString() : null,
            fiftyDayMovingAverage: quote.fiftyDayAverage !== undefined ? quote.fiftyDayAverage.toString() : null,
            twoHundredDayMovingAverage: quote.twoHundredDayAverage !== undefined ? quote.twoHundredDayAverage.toString() : null,
            averageDailyVolume3Month: quote.averageDailyVolume3Month !== undefined ? BigInt(quote.averageDailyVolume3Month) : null,
            averageDailyVolume10Day: quote.averageDailyVolume10Day !== undefined ? BigInt(quote.averageDailyVolume10Day) : null,
            marketCap: quote.marketCap !== undefined ? BigInt(quote.marketCap) : null,
            updatedAt: new Date(),
          };

          // Check if intraday data already exists for this stock
          const existing = await db
            .select()
            .from(stockIntraDayPrice)
            .where(eq(stockIntraDayPrice.stockId, stock.id))
            .limit(1);

          if (existing.length > 0) {
            // Update existing record
            await db
              .update(stockIntraDayPrice)
              .set(intradayData)
              .where(eq(stockIntraDayPrice.id, existing[0].id));
          } else {
            // Insert new record
            await db.insert(stockIntraDayPrice).values(intradayData);
          }

          // Update stock's last refreshed timestamp
          await db
            .update(stocks)
            .set({ lastRefreshedAt: new Date() })
            .where(eq(stocks.id, stock.id));

          updatedCount++;
          return { symbol: stock.symbol, success: true };
        } catch (error) {
          failedCount++;
          const errorMsg = `Failed to update ${stock.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
          return { symbol: stock.symbol, success: false, error: errorMsg };
        }
      });

      // Wait for batch to complete
      await Promise.allSettled(batchPromises);

      // Add delay between batches to respect API limits
      if (i + 3 < activeStocks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Intraday data update complete: ${updatedCount} successful, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Updated intraday data for ${updatedCount} stocks`,
      data: {
        updatedCount,
        failedCount,
        totalStocks: activeStocks.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error updating intraday data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
