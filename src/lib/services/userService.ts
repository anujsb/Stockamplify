// src/lib/services/userService.ts
import { db } from '@/lib/db';
import { analystRating, plans, stockFinancialData, stockFundamentalData, stockIntraDayPrice, stockRealTimePrice, stocks, stockStatistics, subscriptions, users, userStocks } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const FREE_PLAN_NAME = "Free";

export interface UserData {
  nextAuthId: string;
  email: string;
  username?: string;
}

export interface CreateUserData {
  nextAuthId: string;
  email: string;
  username?: string;
  password: string;
}

export class UserService {
  /**
   * Create a default 'Free' subscription for the given user.
   * Assumes plans table has a row name='Free'.
   */
  private static async createDefaultFreeSubscription(userId: number) {
    // Lookup pre-seeded Free plan
    const freePlan = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.name, FREE_PLAN_NAME))
      .limit(1);

    if (!freePlan.length) {
      throw new Error(`Plan "${FREE_PLAN_NAME}" not found. Seed your plans table first.`);
    }

    // Choose validity: far-future end date since column is NOT NULL
    const start = new Date();
    const end = "2099-12-31";

    await db.insert(subscriptions).values({
      userId: userId,
      planId: freePlan[0].id,
      type: "monthly", // 'monthly', 'quarterly', 'yearly'
      startDate: start.toDateString(),
      endDate: end,
    });
  }

  /**
   * Create or get user from NextAuth data
   */
  static async createOrGetUser(userData: UserData) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.nextAuthId, userData.nextAuthId))
        .limit(1);

      if (existingUser.length > 0) {
        return existingUser[0];
      }

      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          nextAuthId: userData.nextAuthId,
          email: userData.email,
          username: userData.username,
          password: "", // This will be set during signup
        })
        .returning();

      // Insert the default FREE subscription (plans table is pre-filled)
      await this.createDefaultFreeSubscription(newUser[0].id);

      return newUser[0];
    } catch (error) {
      console.error("Error creating/getting user:", error);
      throw error;
    }
  }

  /**
   * Get current user from NextAuth
   */
  static async getCurrentUser(nextAuthId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.nextAuthId, nextAuthId)).limit(1);

      if (user.length === 0) {
        return null;
      }

      return {
        id: user[0].id,
        nextAuthId: user[0].nextAuthId,
        email: user[0].email,
        username: user[0].username,
        isActive: user[0].isActive,
        createdAt: user[0].createdAt,
        lastLogin: user[0].lastLogin,
      };
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  /**
   * Update user's last login
   */
  static async updateLastLogin(userId: number) {
    try {
      await db
        .update(users)
        .set({
          lastLogin: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  /**
   * Get user by NextAuth ID
   */
  static async getUserByNextAuthId(nextAuthId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.nextAuthId, nextAuthId)).limit(1);

      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error("Error fetching user by NextAuth ID:", error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: number,
    updates: Partial<{
      username: string;
      email: string;
      isActive: boolean;
    }>
  ) {
    try {
      const updatedUser = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

      return updatedUser[0];
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId: number) {
    try {
      await db
        .update(users)
        .set({
          isActive: false,
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }

  /**
   * Get all active users
   */
  static async getAllActiveUsers() {
    try {
      const activeUsers = await db.select().from(users).where(eq(users.isActive, true));

      return activeUsers;
    } catch (error) {
      console.error("Error fetching active users:", error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    try {
      const totalUsers = await db.select({ count: users.id }).from(users);

      const activeUsers = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.isActive, true));

      return {
        total: totalUsers.length,
        active: activeUsers.length,
        inactive: totalUsers.length - activeUsers.length,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
      };
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
        .where(and(eq(userStocks.userId, userId), eq(userStocks.stockId, stockId)))
        .limit(1);

      if (existingUserStock.length > 0) {
        // Update existing position (average cost basis)
        const existing = existingUserStock[0];
        const totalValue = existing.quantity * Number(existing.buyPrice) + quantity * buyPrice;
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
      console.error("Error adding stock to portfolio:", error);
      throw new Error("Failed to add stock to portfolio");
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
      console.error("Error getting user portfolio:", error);
      return [];
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
            beta: stockStatistics.beta,
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
      console.error("Error getting user portfolio with details:", error);
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
        .where(and(eq(userStocks.userId, userId), eq(userStocks.stockId, stockId)))
        .returning();
    } catch (error) {
      console.error("Error removing stock from portfolio:", error);
      throw new Error("Failed to remove stock from portfolio");
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
        return { success: false, error: "Not found or not authorized" };
      }
    } catch (error) {
      console.error("Error removing stock from portfolio by id:", error);
      return { success: false, error: "Failed to remove stock from portfolio" };
    }
  }

  static async removeAllStocksFromPortfolio(userId: number) {
    try {
      // Delete all stocks belonging to the user
      const result = await db.delete(userStocks).where(eq(userStocks.userId, userId)).returning();

      if (result.length > 0) {
        return { success: true, deleted: result.length };
      } else {
        return { success: false, error: "No stocks found for this user" };
      }
    } catch (error) {
      console.error("Error removing all stocks from portfolio:", error);
      return { success: false, error: "Failed to remove all stocks from portfolio" };
    }
  }
}