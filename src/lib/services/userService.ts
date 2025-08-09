// src/lib/services/userService.ts
import { db } from '@/lib/db';
import { users, userStocks, stocks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { stockRealTimePrice } from '@/lib/db/schema';
import { stockIntraDayPrice, stockFundamentalData, stockFinancialData, stockStatistics, analystRating } from '@/lib/db/schema';


export interface CreateUserParams {
  clerkId: string;
  email: string;
  username?: string;
}

export class UserService {
  /**
   * Create or get user from Clerk data
   */
  static async createOrGetUser(userData: CreateUserParams) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userData.clerkId))
        .limit(1);

      let user;
      if (existingUser.length > 0) {
        // Update last login
        const updatedUser = await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.clerkId, userData.clerkId))
          .returning();
        
        user = updatedUser[0];
      } else {
        // Create new user
        const newUser = await db
          .insert(users)
          .values({
            clerkId: userData.clerkId,
            email: userData.email,
            username: userData.username,
            lastLogin: new Date(),
          })
          .returning();
        
        user = newUser[0];
      }

      // Removed background intraday data update - now handled by cronjob.org

      return user;
    } catch (error) {
      console.error('Error creating or getting user:', error);
      throw new Error('Failed to create or get user');
    }
  }

  /**
   * Get current user from Clerk
   */
  static async getCurrentUser() {
    try {
      const clerkUser = await currentUser();
      if (!clerkUser) return null;

      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

      if (dbUser.length === 0) {
        // Create user if doesn't exist
        return await this.createOrGetUser({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.firstName || undefined,
        });
      }

      return dbUser[0];
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Add stock to user's portfolio
   */
  static async addStockToPortfolio(
    userId: number,
    stockId: number,
    quantity: number,
    buyPrice: number
  ) {
    try {
      // Check if user already owns this stock
      const existingUserStock = await db
        .select()
        .from(userStocks)
        .where(and(
          eq(userStocks.userId, userId),
          eq(userStocks.stockId, stockId)
        ))
        .limit(1);

      if (existingUserStock.length > 0) {
        // Update existing position (average cost basis)
        const existing = existingUserStock[0];
        const totalValue = (existing.quantity * Number(existing.buyPrice)) + (quantity * buyPrice);
        const totalQuantity = existing.quantity + quantity;
        const avgPrice = totalValue / totalQuantity;

        return await db
          .update(userStocks)
          .set({
            quantity: totalQuantity,
            buyPrice: avgPrice.toString(),
            updatedAt: new Date(),
          })
          .where(eq(userStocks.id, existing.id))
          .returning();
      } else {
        // Create new position
        return await db
          .insert(userStocks)
          .values({
            userId,
            stockId,
            quantity,
            buyPrice: buyPrice.toString(),
          })
          .returning();
      }
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      throw new Error('Failed to add stock to portfolio');
    }
  }

  /**
   * Get user's portfolio
   */
  static async getUserPortfolio(userId: number) {
    try {
      return await db
        .select({
          id: userStocks.id,
          quantity: userStocks.quantity,
          buyPrice: userStocks.buyPrice,
          addedAt: userStocks.addedAt,
          updatedAt: userStocks.updatedAt,
          stock: {
            id: stocks.id,
            symbol: stocks.symbol,
            name: stocks.name,
            exchange: stocks.exchange,
          },
          currentPrice: stockRealTimePrice.price,
        })
        .from(userStocks)
        .leftJoin(stocks, eq(userStocks.stockId, stocks.id))
        .leftJoin(stockRealTimePrice, eq(userStocks.stockId, stockRealTimePrice.stockId))
        .where(eq(userStocks.userId, userId));
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      return [];
    }
  }

   /**
   * Get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string) {
    try {
      const dbUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      return dbUser.length > 0 ? dbUser[0] : null;
    } catch (error) {
      console.error('Error fetching user by Clerk ID:', error);
      return null;
    }
  }

  /**
   * Get user's portfolio with complete stock details
   */
  static async getUserPortfolioWithDetails(userId: number) {
    try {
      return await db
        .select({
          // Portfolio data
          id: userStocks.id,
          quantity: userStocks.quantity,
          buyPrice: userStocks.buyPrice,
          addedAt: userStocks.addedAt,
          updatedAt: userStocks.updatedAt,
          
          // Stock basic info
          stock: {
            id: stocks.id,
            symbol: stocks.symbol,
            name: stocks.name,
            exchange: stocks.exchange,
            sector: stocks.sector,
            industry: stocks.industry,
            currency: stocks.currency,
            lastRefreshedAt: stocks.lastRefreshedAt,
          },
          
          // Real-time price data
          realTimePrice: {
            price: stockRealTimePrice.price,
            volume: stockRealTimePrice.volume,
            updatedAt: stockRealTimePrice.updatedAt,
          },
          
          // Intraday price data
          intradayPrice: {
            previousClose: stockIntraDayPrice.previousClose,
            open: stockIntraDayPrice.open,
            dayHigh: stockIntraDayPrice.dayHigh,
            dayLow: stockIntraDayPrice.dayLow,
            fiftyTwoWeekHigh: stockIntraDayPrice.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: stockIntraDayPrice.fiftyTwoWeekLow,
            fiftyDayMovingAverage: stockIntraDayPrice.fiftyDayMovingAverage,
            twoHundredDayMovingAverage: stockIntraDayPrice.twoHundredDayMovingAverage,
            averageDailyVolume3Month: stockIntraDayPrice.averageDailyVolume3Month,
            averageDailyVolume10Day: stockIntraDayPrice.averageDailyVolume10Day,
            marketCap: stockIntraDayPrice.marketCap,
            updatedAt: stockIntraDayPrice.updatedAt,
          },
          
          // Fundamental data
          fundamentalData: {
            epsTTM: stockFundamentalData.epsTTM,
            epsForward: stockFundamentalData.epsForward,
            bookValue: stockFundamentalData.bookValue,
            trailingPE: stockFundamentalData.trailingPE,
            forwardPE: stockFundamentalData.forwardPE,
            priceToBook: stockFundamentalData.priceToBook,
            updatedAt: stockFundamentalData.updatedAt,
          },
          
          // Financial data
          financialData: {
            totalRevenue: stockFinancialData.totalRevenue,
            totalCash: stockFinancialData.totalCash,
            totalDebt: stockFinancialData.totalDebt,
            debtToEquity: stockFinancialData.debtToEquity,
            currentRatio: stockFinancialData.currentRatio,
            quickRatio: stockFinancialData.quickRatio,
            profitMargin: stockFinancialData.profitMargin,
            grossMargin: stockFinancialData.grossMargin,
            operatingMargin: stockFinancialData.operatingMargin,
            ebitdaMargin: stockFinancialData.ebitdaMargin,
            returnOnAssets: stockFinancialData.returnOnAssets,
            returnOnEquity: stockFinancialData.returnOnEquity,
            revenueGrowth: stockFinancialData.revenueGrowth,
            earningsGrowth: stockFinancialData.earningsGrowth,
            updatedAt: stockFinancialData.updatedAt,
          },
          
          // Statistics data
          statistics: {
            sharesHeldByInstitutions: stockStatistics.sharesHeldByInstitutions,
            sharesHeldByAllInsider: stockStatistics.sharesHeldByAllInsider,
            lastSplitFactor: stockStatistics.lastSplitFactor,
            lastSplitDate: stockStatistics.lastSplitDate,
            lastDividendValue: stockStatistics.lastDividendValue,
            lastDividendDate: stockStatistics.lastDividendDate,
            earningsDate: stockStatistics.earningsDate,
            earningsCallDate: stockStatistics.earningsCallDate,
            updatedAt: stockStatistics.updatedAt,
          },
          
          // Analyst ratings
          analystRating: {
            recommendation: analystRating.recommendation,
            numberOfAnalysts: analystRating.numberOfAnalysts,
            targetPriceHigh: analystRating.targetPriceHigh,
            targetLowPrice: analystRating.targetLowPrice,
            updatedAt: analystRating.updatedAt,
          },
        })
        .from(userStocks)
        .leftJoin(stocks, eq(userStocks.stockId, stocks.id))
        .leftJoin(stockRealTimePrice, eq(userStocks.stockId, stockRealTimePrice.stockId))
        .leftJoin(stockIntraDayPrice, eq(userStocks.stockId, stockIntraDayPrice.stockId))
        .leftJoin(stockFundamentalData, eq(userStocks.stockId, stockFundamentalData.stockId))
        .leftJoin(stockFinancialData, eq(userStocks.stockId, stockFinancialData.stockId))
        .leftJoin(stockStatistics, eq(userStocks.stockId, stockStatistics.stockId))
        .leftJoin(analystRating, eq(userStocks.stockId, analystRating.stockId))
        .where(eq(userStocks.userId, userId));
    } catch (error) {
      console.error('Error getting user portfolio with details:', error);
      return [];
    }
  }

  /**
   * Remove stock from user's portfolio
   */
  static async removeStockFromPortfolio(userId: number, stockId: number) {
    try {
      return await db
        .delete(userStocks)
        .where(and(
          eq(userStocks.userId, userId),
          eq(userStocks.stockId, stockId)
        ))
        .returning();
    } catch (error) {
      console.error('Error removing stock from portfolio:', error);
      throw new Error('Failed to remove stock from portfolio');
    }
  }

  /**
   * Remove stock from user's portfolio by portfolio row id (userStocks.id)
   */
  static async removeStockFromPortfolioById(userId: number, portfolioId: number) {
    try {
      // Only delete if the row belongs to the user
      const result = await db
        .delete(userStocks)
        .where(and(eq(userStocks.userId, userId), eq(userStocks.id, portfolioId)))
        .returning();
      if (result.length > 0) {
        return { success: true };
      } else {
        return { success: false, error: 'Not found or not authorized' };
      }
    } catch (error) {
      console.error('Error removing stock from portfolio by id:', error);
      return { success: false, error: 'Failed to remove stock from portfolio' };
    }
  }
}