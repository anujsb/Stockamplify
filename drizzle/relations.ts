import { relations } from "drizzle-orm/relations";
import { stocks, analystRating, stockFinancialData, stockFundamentalData, users, userStocks, stockStatistics, stockIntradayPrice, stockRealtimePrice, plans } from "./schema";

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
	stockStatistics: many(stockStatistics),
	stockIntradayPrices: many(stockIntradayPrice),
	stockRealtimePrices: many(stockRealtimePrice),
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

export const usersRelations = relations(users, ({one, many}) => ({
	userStocks: many(userStocks),
	plan: one(plans, {
		fields: [users.defaultPlanId],
		references: [plans.id]
	}),
}));

export const stockStatisticsRelations = relations(stockStatistics, ({one}) => ({
	stock: one(stocks, {
		fields: [stockStatistics.stockId],
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

export const plansRelations = relations(plans, ({many}) => ({
	users: many(users),
}));