import { relations } from "drizzle-orm/relations";
import { plans, users, stocks, analystRating, stockFinancialData, stockFundamentalData, userStocks, stockIntradayPrice, stockRealtimePrice, stockStatistics } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	plan: one(plans, {
		fields: [users.defaultPlanId],
		references: [plans.id]
	}),
	userStocks: many(userStocks),
}));

export const plansRelations = relations(plans, ({many}) => ({
	users: many(users),
}));

export const analystRatingRelations = relations(analystRating, ({one}) => ({
	stock: one(stocks, {
		fields: [analystRating.stockId],
		references: [stocks.id]
	}),
}));

export const stocksRelations = relations(stocks, ({many}) => ({
	analystRatings: many(analystRating),
	stockFinancialData: many(stockFinancialData),
	stockFundamentalData: many(stockFundamentalData),
	userStocks: many(userStocks),
	stockIntradayPrices: many(stockIntradayPrice),
	stockRealtimePrices: many(stockRealtimePrice),
	stockStatistics: many(stockStatistics),
}));

export const stockFinancialDataRelations = relations(stockFinancialData, ({one}) => ({
	stock: one(stocks, {
		fields: [stockFinancialData.stockId],
		references: [stocks.id]
	}),
}));

export const stockFundamentalDataRelations = relations(stockFundamentalData, ({one}) => ({
	stock: one(stocks, {
		fields: [stockFundamentalData.stockId],
		references: [stocks.id]
	}),
}));

export const userStocksRelations = relations(userStocks, ({one}) => ({
	user: one(users, {
		fields: [userStocks.userId],
		references: [users.id]
	}),
	stock: one(stocks, {
		fields: [userStocks.stockId],
		references: [stocks.id]
	}),
}));

export const stockIntradayPriceRelations = relations(stockIntradayPrice, ({one}) => ({
	stock: one(stocks, {
		fields: [stockIntradayPrice.stockId],
		references: [stocks.id]
	}),
}));

export const stockRealtimePriceRelations = relations(stockRealtimePrice, ({one}) => ({
	stock: one(stocks, {
		fields: [stockRealtimePrice.stockId],
		references: [stocks.id]
	}),
}));

export const stockStatisticsRelations = relations(stockStatistics, ({one}) => ({
	stock: one(stocks, {
		fields: [stockStatistics.stockId],
		references: [stocks.id]
	}),
}));