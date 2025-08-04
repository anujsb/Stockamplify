// src/app/api/stocks/update-monthly-data/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stocks, stockFundamentalData, stockFinancialData, stockStatistics, analystRating } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { QuoteService } from '@/lib/services/quoteService';
import { ModulesService } from '@/lib/services/modulesService';

// Shared function to update monthly data
async function updateMonthlyData() {
  console.log('Starting monthly data update for all stocks...');
  
  // Get all active stocks
  const activeStocks = await db
    .select()
    .from(stocks)
    .where(eq(stocks.isActive, true));

  if (activeStocks.length === 0) {
    return {
      success: true,
      message: 'No active stocks found',
      data: { updatedCount: 0, totalStocks: 0 }
    };
  }

  let totalUpdated = 0;
  let totalFailed = 0;
  const errors: string[] = [];
  const results = {
    fundamentalData: { successful: 0, failed: 0 },
    financialData: { successful: 0, failed: 0 },
    statistics: { successful: 0, failed: 0 },
    analystRatings: { successful: 0, failed: 0 }
  };

  // Process stocks in batches to avoid overwhelming the API
  for (let i = 0; i < activeStocks.length; i += 2) {
    const batch = activeStocks.slice(i, i + 2);
    
    const batchPromises = batch.map(async (stock) => {
      try {
        // Fetch comprehensive data from Yahoo Finance
const [quote, modules] = await Promise.all([
          QuoteService.getQuote(stock.symbol),
          ModulesService.getModulesData(stock.symbol)
        ]);
        
        if (!quote) {
          throw new Error(`Unable to fetch valid data for ${stock.symbol}`);
        }

        // Update fundamental data
        try {
          const fundamentalData = {
            stockId: stock.id,
            epsTTM: quote.epsTrailingTwelveMonths !== undefined ? quote.epsTrailingTwelveMonths.toString() : null,
            epsForward: quote.epsForward !== undefined ? quote.epsForward.toString() : null,
            bookValue: quote.bookValue !== undefined ? quote.bookValue.toString() : null,
            trailingPE: quote.trailingPE !== undefined ? quote.trailingPE.toString() : null,
            forwardPE: quote.forwardPE !== undefined ? quote.forwardPE.toString() : null,
            priceToBook: quote.priceToBook !== undefined ? quote.priceToBook.toString() : null,
            updatedAt: new Date(),
          };

          const existingFundamental = await db
            .select()
            .from(stockFundamentalData)
            .where(eq(stockFundamentalData.stockId, stock.id))
            .limit(1);

          if (existingFundamental.length > 0) {
            await db
              .update(stockFundamentalData)
              .set(fundamentalData)
              .where(eq(stockFundamentalData.id, existingFundamental[0].id));
          } else {
            await db.insert(stockFundamentalData).values(fundamentalData);
          }
          results.fundamentalData.successful++;
        } catch (error) {
          results.fundamentalData.failed++;
          console.error(`Failed to update fundamental data for ${stock.symbol}:`, error);
        }

        // Update financial data
        try {
          if (modules?.financialData) {
            const financialData = {
              stockId: stock.id,
              totalRevenue: modules.financialData.totalRevenue !== undefined ? BigInt(modules.financialData.totalRevenue) : null,
              totalCash: modules.financialData.totalCash !== undefined ? BigInt(modules.financialData.totalCash) : null,
              totalDebt: modules.financialData.totalDebt !== undefined ? BigInt(modules.financialData.totalDebt) : null,
              debtToEquity: modules.financialData.debtToEquity !== undefined ? modules.financialData.debtToEquity.toString() : null,
              currentRatio: modules.financialData.currentRatio !== undefined ? modules.financialData.currentRatio.toString() : null,
              quickRatio: modules.financialData.quickRatio !== undefined ? modules.financialData.quickRatio.toString() : null,
              profitMargin: modules.financialData.profitMargins !== undefined ? modules.financialData.profitMargins.toString() : null,
              grossMargin: modules.financialData.grossMargins !== undefined ? modules.financialData.grossMargins.toString() : null,
              operatingMargin: modules.financialData.operatingMargins !== undefined ? modules.financialData.operatingMargins.toString() : null,
              ebitdaMargin: modules.financialData.ebitdaMargins !== undefined ? modules.financialData.ebitdaMargins.toString() : null,
              returnOnAssets: modules.financialData.returnOnAssets !== undefined ? modules.financialData.returnOnAssets.toString() : null,
              returnOnEquity: modules.financialData.returnOnEquity !== undefined ? modules.financialData.returnOnEquity.toString() : null,
              revenueGrowth: modules.financialData.revenueGrowth !== undefined ? modules.financialData.revenueGrowth.toString() : null,
              earningsGrowth: modules.financialData.earningsGrowth !== undefined ? modules.financialData.earningsGrowth.toString() : null,
              updatedAt: new Date(),
            };

            const existingFinancial = await db
              .select()
              .from(stockFinancialData)
              .where(eq(stockFinancialData.stockId, stock.id))
              .limit(1);

            if (existingFinancial.length > 0) {
              await db
                .update(stockFinancialData)
                .set(financialData)
                .where(eq(stockFinancialData.id, existingFinancial[0].id));
            } else {
              await db.insert(stockFinancialData).values(financialData);
            }
            results.financialData.successful++;
          }
        } catch (error) {
          results.financialData.failed++;
          console.error(`Failed to update financial data for ${stock.symbol}:`, error);
        }

        // Update statistics data
        try {
          const statisticsData = {
            stockId: stock.id,
            sharesHeldByInstitutions: null,
            sharesHeldByAllInsider: null,
            lastSplitFactor: null,
            lastSplitDate: null,
            lastDividendValue: null,
            lastDividendDate: null,
            earningsDate: null,
            earningsCallDate: null,
            updatedAt: new Date(),
          };

          const existingStatistics = await db
            .select()
            .from(stockStatistics)
            .where(eq(stockStatistics.stockId, stock.id))
            .limit(1);

          if (existingStatistics.length > 0) {
            await db
              .update(stockStatistics)
              .set(statisticsData)
              .where(eq(stockStatistics.id, existingStatistics[0].id));
          } else {
            await db.insert(stockStatistics).values(statisticsData);
          }
          results.statistics.successful++;
        } catch (error) {
          results.statistics.failed++;
          console.error(`Failed to update statistics for ${stock.symbol}:`, error);
        }

        // Update analyst ratings
        try {
          if (modules?.financialData?.recommendationKey) {
            const analystRatingData = {
              stockId: stock.id,
              recommendation: modules.financialData.recommendationKey,
              numberOfAnalysts: modules.financialData.numberOfAnalystOpinions || null,
              targetPriceHigh: modules.financialData.targetHighPrice !== undefined ? 
                modules.financialData.targetHighPrice.toString() : null,
              targetLowPrice: modules.financialData.targetLowPrice !== undefined ? 
                modules.financialData.targetLowPrice.toString() : null,
              updatedAt: new Date(),
            };

            const existingAnalystRating = await db
              .select()
              .from(analystRating)
              .where(eq(analystRating.stockId, stock.id))
              .limit(1);

            if (existingAnalystRating.length > 0) {
              await db
                .update(analystRating)
                .set(analystRatingData)
                .where(eq(analystRating.id, existingAnalystRating[0].id));
            } else {
              await db.insert(analystRating).values(analystRatingData);
            }
            results.analystRatings.successful++;
          }
        } catch (error) {
          results.analystRatings.failed++;
          console.error(`Failed to update analyst ratings for ${stock.symbol}:`, error);
        }

        // Update stock's last refreshed timestamp
        await db
          .update(stocks)
          .set({ lastRefreshedAt: new Date() })
          .where(eq(stocks.id, stock.id));

        totalUpdated++;
        return { symbol: stock.symbol, success: true };
      } catch (error) {
        totalFailed++;
        const errorMsg = `Failed to update ${stock.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
        return { symbol: stock.symbol, success: false, error: errorMsg };
      }
    });

    // Wait for batch to complete
    await Promise.allSettled(batchPromises);

    // Add delay between batches to respect API limits
    if (i + 2 < activeStocks.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`Monthly data update complete: ${totalUpdated} successful, ${totalFailed} failed`);

  return {
    success: true,
    message: `Monthly data update completed for ${totalUpdated} stocks`,
    data: {
      totalStocks: activeStocks.length,
      totalUpdated,
      totalFailed,
      results,
      errors: errors.length > 0 ? errors : undefined
    }
  };
}

export async function GET() {
  try {
    const result = await updateMonthlyData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating monthly data:', error);
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

export async function POST() {
  try {
    const result = await updateMonthlyData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating monthly data:', error);
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
