import { pgTable, serial, integer, varchar, date, timestamp, unique, boolean, foreignKey, numeric, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const subscriptions = pgTable("subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	planId: integer("plan_id").notNull(),
	type: varchar({ length: 20 }).notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const planFeatures = pgTable("plan_features", {
	id: serial().primaryKey().notNull(),
	planId: integer("plan_id").notNull(),
	featureId: integer("feature_id").notNull(),
	quota: integer().notNull(),
	resetInterval: varchar("reset_interval", { length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const plans = pgTable("plans", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: varchar(),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("plans_name_unique").on(table.name),
]);

export const features = pgTable("features", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("features_code_unique").on(table.code),
]);

export const featureUsage = pgTable("feature_usage", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	featureCode: varchar("feature_code", { length: 50 }).notNull(),
	periodStart: date("period_start").notNull(),
	periodEnd: date("period_end").notNull(),
	usedCount: integer("used_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("feature_usage_daily_unique").on(table.userId, table.featureCode, table.periodStart, table.periodEnd),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 100 }),
	email: varchar({ length: 100 }).notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	nextauthId: varchar("nextauth_id", { length: 100 }).notNull(),
	password: varchar({ length: 255 }),
	defaultPlanId: integer("default_plan_id").default(1),
}, (table) => [
	foreignKey({
			columns: [table.defaultPlanId],
			foreignColumns: [plans.id],
			name: "users_default_plan_id_plans_id_fk"
		}),
	unique("users_email_unique").on(table.email),
	unique("users_nextauth_id_unique").on(table.nextauthId),
]);

export const stocks = pgTable("stocks", {
	id: serial().primaryKey().notNull(),
	symbol: varchar({ length: 20 }).notNull(),
	exchange: varchar({ length: 10 }).notNull(),
	currency: varchar({ length: 5 }).default('INR').notNull(),
	name: varchar({ length: 255 }),
	sector: varchar({ length: 50 }),
	industry: varchar({ length: 50 }),
	isActive: boolean("is_active").default(true).notNull(),
	lastRefreshedAt: timestamp("last_refreshed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("symbol_exchange_unique").on(table.symbol, table.exchange),
]);

export const analystRating = pgTable("analyst_rating", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	recommendation: varchar({ length: 20 }),
	numberOfAnalysts: integer("number_of_analysts"),
	targetPriceHigh: numeric("target_price_high", { precision: 18, scale:  4 }),
	targetLowPrice: numeric("target_low_price", { precision: 18, scale:  4 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "analyst_rating_stock_id_stocks_id_fk"
		}),
]);

export const stockFinancialData = pgTable("stock_financial_data", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalRevenue: bigint("total_revenue", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalCash: bigint("total_cash", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalDebt: bigint("total_debt", { mode: "number" }),
	debtToEquity: numeric("debt_to_equity", { precision: 18, scale:  4 }),
	currentRatio: numeric("current_ratio", { precision: 18, scale:  4 }),
	quickRatio: numeric("quick_ratio", { precision: 18, scale:  4 }),
	profitMargin: numeric("profit_margin", { precision: 18, scale:  6 }),
	grossMargin: numeric("gross_margin", { precision: 18, scale:  6 }),
	operatingMargin: numeric("operating_margin", { precision: 18, scale:  6 }),
	ebitdaMargin: numeric("ebitda_margin", { precision: 18, scale:  6 }),
	returnOnAssets: numeric("return_on_assets", { precision: 18, scale:  6 }),
	returnOnEquity: numeric("return_on_equity", { precision: 18, scale:  6 }),
	revenueGrowth: numeric("revenue_growth", { precision: 18, scale:  6 }),
	earningsGrowth: numeric("earnings_growth", { precision: 18, scale:  6 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "stock_financial_data_stock_id_stocks_id_fk"
		}),
]);

export const stockFundamentalData = pgTable("stock_fundamental_data", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	epsTtm: numeric("eps_ttm", { precision: 18, scale:  4 }),
	epsForward: numeric("eps_forward", { precision: 18, scale:  4 }),
	bookValue: numeric("book_value", { precision: 18, scale:  4 }),
	trailingPe: numeric("trailing_pe", { precision: 18, scale:  4 }),
	forwardPe: numeric("forward_pe", { precision: 18, scale:  4 }),
	priceToBook: numeric("price_to_book", { precision: 18, scale:  4 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "stock_fundamental_data_stock_id_stocks_id_fk"
		}),
]);

export const userStocks = pgTable("user_stocks", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	stockId: integer("stock_id").notNull(),
	quantity: integer().notNull(),
	buyPrice: numeric("buy_price", { precision: 18, scale:  4 }).notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_stocks_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "user_stocks_stock_id_stocks_id_fk"
		}),
]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	isUsed: boolean("is_used").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("email_verification_tokens_token_unique").on(table.token),
]);

export const stockIntradayPrice = pgTable("stock_intraday_price", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	previousClose: numeric("previous_close", { precision: 18, scale:  4 }),
	open: numeric({ precision: 18, scale:  4 }),
	dayHigh: numeric("day_high", { precision: 18, scale:  4 }),
	dayLow: numeric("day_low", { precision: 18, scale:  4 }),
	fiftyTwoWeekHigh: numeric("fifty_two_week_high", { precision: 18, scale:  4 }),
	fiftyTwoWeekLow: numeric("fifty_two_week_low", { precision: 18, scale:  4 }),
	fiftyDayMovingAverage: numeric("fifty_day_moving_average", { precision: 18, scale:  4 }),
	twoHundredDayMovingAverage: numeric("two_hundred_day_moving_average", { precision: 18, scale:  4 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	averageDailyVolume3Month: bigint("average_daily_volume_3month", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	averageDailyVolume10Day: bigint("average_daily_volume_10day", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	marketCap: bigint("market_cap", { mode: "number" }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "stock_intraday_price_stock_id_stocks_id_fk"
		}),
]);

export const stockRealtimePrice = pgTable("stock_realtime_price", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	price: numeric({ precision: 18, scale:  4 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	volume: bigint({ mode: "number" }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "stock_realtime_price_stock_id_stocks_id_fk"
		}),
]);

export const stockStatistics = pgTable("stock_statistics", {
	id: serial().primaryKey().notNull(),
	stockId: integer("stock_id").notNull(),
	sharesHeldByInstitutions: varchar("shares_held_by_institutions", { length: 5 }),
	sharesHeldByAllInsider: varchar("shares_held_by_all_insider", { length: 5 }),
	lastSplitFactor: varchar("last_split_factor", { length: 5 }),
	lastSplitDate: date("last_split_date"),
	lastDividendValue: numeric("last_dividend_value", { precision: 4, scale:  2 }),
	lastDividendDate: date("last_dividend_date"),
	earningsDate: date("earnings_date"),
	earningsCallDate: date("earnings_call_date"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stockId],
			foreignColumns: [stocks.id],
			name: "stock_statistics_stock_id_stocks_id_fk"
		}),
]);
