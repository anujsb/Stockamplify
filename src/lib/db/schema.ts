// src/lib/db/schema.ts
import { relations } from 'drizzle-orm';
import { bigint, boolean, date, decimal, integer, pgTable, serial, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

// Users table (integrates with NextAuth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nextAuthId: varchar('nextauth_id', { length: 100 }).notNull().unique(),
  username: varchar('username', { length: 100 }),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

// =================== PLANS ===================
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description"),
  active: boolean("active").default(true),
  IsDefaultPlan: boolean("is_default_plan").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// =================== SUBSCRIPTIONS ===================
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: integer("plan_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'monthly', 'quarterly', 'yearly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =================== FEATURES ===================
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// =================== PLAN FEATURES ===================
export const planFeatures = pgTable("plan_features", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  featureId: integer("feature_id").notNull(),
  quota: integer("quota").notNull(),
  resetInterval: varchar("reset_interval", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =================== FEATURE USAGE ===================
export const featureUsage = pgTable("feature_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  featureCode: varchar("feature_code", { length: 50 }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
  (table) => ({
    dailyUniq: unique("feature_usage_daily_unique").on(
      table.userId,
      table.featureCode,
      table.periodStart,
      table.periodEnd
    ),
  })
);

// =================== EMAIL Verification ===================
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stock master table
export const stocks = pgTable('stocks', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  exchange: varchar('exchange', { length: 10 }).notNull(), // allow for 'NSE', 'BSE', etc.
  currency: varchar('currency', { length: 5 }).notNull().default('INR'),
  name: varchar('name', { length: 255 }),
  sector: varchar('sector', { length: 50 }),
  industry: varchar('industry', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastRefreshedAt: timestamp('last_refreshed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  symbolExchangeUnique: unique('symbol_exchange_unique').on(table.symbol, table.exchange)
}));

// Real-time price data
export const stockRealTimePrice = pgTable('stock_realtime_price', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  price: decimal('price', { precision: 18, scale: 4 }),
  volume: bigint('volume', { mode: 'bigint' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Intraday price data
export const stockIntraDayPrice = pgTable('stock_intraday_price', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  previousClose: decimal('previous_close', { precision: 18, scale: 4 }),
  open: decimal('open', { precision: 18, scale: 4 }),
  dayHigh: decimal('day_high', { precision: 18, scale: 4 }),
  dayLow: decimal('day_low', { precision: 18, scale: 4 }),
  fiftyTwoWeekHigh: decimal('fifty_two_week_high', { precision: 18, scale: 4 }),
  fiftyTwoWeekLow: decimal('fifty_two_week_low', { precision: 18, scale: 4 }),
  fiftyDayMovingAverage: decimal('fifty_day_moving_average', { precision: 18, scale: 4 }),
  twoHundredDayMovingAverage: decimal('two_hundred_day_moving_average', { precision: 18, scale: 4 }),
  averageDailyVolume3Month: bigint('average_daily_volume_3month', { mode: 'bigint' }),
  averageDailyVolume10Day: bigint('average_daily_volume_10day', { mode: 'bigint' }),
  marketCap: bigint('market_cap', { mode: 'bigint' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Fundamental data
export const stockFundamentalData = pgTable('stock_fundamental_data', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  epsTTM: decimal('eps_ttm', { precision: 18, scale: 4 }),
  epsForward: decimal('eps_forward', { precision: 18, scale: 4 }),
  bookValue: decimal('book_value', { precision: 18, scale: 4 }),
  trailingPE: decimal('trailing_pe', { precision: 18, scale: 4 }),
  forwardPE: decimal('forward_pe', { precision: 18, scale: 4 }),
  priceToBook: decimal('price_to_book', { precision: 18, scale: 4 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Financial data
export const stockFinancialData = pgTable('stock_financial_data', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  totalRevenue: bigint('total_revenue', { mode: 'bigint' }),
  totalCash: bigint('total_cash', { mode: 'bigint' }),
  totalDebt: bigint('total_debt', { mode: 'bigint' }),
  debtToEquity: decimal('debt_to_equity', { precision: 18, scale: 4 }),
  currentRatio: decimal('current_ratio', { precision: 18, scale: 4 }),
  quickRatio: decimal('quick_ratio', { precision: 18, scale: 4 }),
  profitMargin: decimal('profit_margin', { precision: 18, scale: 6 }),
  grossMargin: decimal('gross_margin', { precision: 18, scale: 6 }),
  operatingMargin: decimal('operating_margin', { precision: 18, scale: 6 }),
  ebitdaMargin: decimal('ebitda_margin', { precision: 18, scale: 6 }),
  returnOnAssets: decimal('return_on_assets', { precision: 18, scale: 6 }),
  returnOnEquity: decimal('return_on_equity', { precision: 18, scale: 6 }),
  revenueGrowth: decimal('revenue_growth', { precision: 18, scale: 6 }),
  earningsGrowth: decimal('earnings_growth', { precision: 18, scale: 6 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Stock statistics
export const stockStatistics = pgTable('stock_statistics', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  sharesHeldByInstitutions: varchar('shares_held_by_institutions', { length: 10 }),
  sharesHeldByAllInsider: varchar('shares_held_by_all_insider', { length: 10 }),
  lastSplitFactor: varchar('last_split_factor', { length: 10 }),
  lastSplitDate: date('last_split_date'),
  lastDividendValue: decimal('last_dividend_value', { precision: 4, scale: 2 }),
  lastDividendDate: date('last_dividend_date'),
  beta: decimal('beta', { precision: 6, scale: 3 }),
  earningsDate: date('earnings_date'),
  earningsCallDate: date('earnings_call_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analyst ratings
export const analystRating = pgTable('analyst_rating', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  recommendation: varchar('recommendation', { length: 20 }),
  numberOfAnalysts: integer('number_of_analysts'),
  targetPriceHigh: decimal('target_price_high', { precision: 18, scale: 4 }),
  targetLowPrice: decimal('target_low_price', { precision: 18, scale: 4 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User stocks (portfolio)
export const userStocks = pgTable('user_stocks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  stockId: integer('stock_id').references(() => stocks.id).notNull(),
  quantity: integer('quantity').notNull(),
  buyPrice: decimal('buy_price', { precision: 18, scale: 4 }).notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const stocksRelations = relations(stocks, ({ many }) => ({
  realTimePrices: many(stockRealTimePrice),
  intraDayPrices: many(stockIntraDayPrice),
  fundamentalData: many(stockFundamentalData),
  financialData: many(stockFinancialData),
  statistics: many(stockStatistics),
  analystRatings: many(analystRating),
  userStocks: many(userStocks),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userStocks: many(userStocks),
}));

export const userStocksRelations = relations(userStocks, ({ one }) => ({
  user: one(users, {
    fields: [userStocks.userId],
    references: [users.id],
  }),
  stock: one(stocks, {
    fields: [userStocks.stockId],
    references: [stocks.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const planRelations = relations(plans, ({ many }) => ({
  features: many(planFeatures),
}));

export const planFeatureRelations = relations(planFeatures, ({ one }) => ({
  plan: one(plans, {
    fields: [planFeatures.planId],
    references: [plans.id],
  }),
  feature: one(features, {
    fields: [planFeatures.featureId],
    references: [features.id],
  }),
}));

export const featureRelations = relations(features, ({ many }) => ({
  planMappings: many(planFeatures),
}));

export const featureUsageRelations = relations(featureUsage, ({ one }) => ({
  user: one(users, {
    fields: [featureUsage.userId],
    references: [users.id],
  }),
}));
