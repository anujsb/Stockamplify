import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPercentage } from '@/lib/utils/stockUtils';
import { AlertCircle, TrendingDown, TrendingUp, Users } from 'lucide-react';

const OverViewTab = ({ item }: { item: any }) => {
    const formatCurrency = (value: number) => `₹${Number(value).toFixed(2)}`;
    const currentValue = item.realTimePrice.price * item.quantity;
    const gainLoss = item.realTimePrice.price * item.quantity - item.buyPrice * item.quantity;
    // const gainLossPercentage = ((gainLoss / (stock.buyPrice * stock.quantity)) * 100).toFixed(2);
    const gainLossPercentage = (gainLoss / (item.buyPrice * item.quantity)) * 100;


    return (
        <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Your Position
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Quantity Held</p>
                            <p className="text-lg font-bold text-blue-600">{item.quantity}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Total Invested Value</p>
                            <p className="text-lg font-bold text-green-600">{item.buyPrice * item.quantity}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Current Value</p>
                            <p className="text-lg font-bold text-purple-600">{currentValue}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Gain/Loss</p>
                            <p className={`text-lg font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Number(gainLoss).toFixed(2)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Gain/Loss %</p>
                            <p className={`text-lg font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Number(gainLossPercentage).toFixed(2)}

                            </p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Est. Yearly Return</p>
                            <p className="text-lg font-bold text-yellow-600">
                                {Number(gainLossPercentage * 1.2).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">Est. yearly</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                        Stock Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Basic Info</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">Company</span>
                                    <span className="text-sm font-medium">{item.stock.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Ticker</span>
                                    <span className="text-sm font-medium">{item.stock.symbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sector</span>
                                    <span className="text-sm font-medium">{item.stock.sector}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Industry</span>
                                    <span className="text-sm font-medium">{item.stock.industry}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Market Data</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Market Cap</span>
                                    {/* <span className="text-sm font-medium">{stockOverview.marketCap}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">P/E Ratio</span>
                                    {/* <span className="text-sm font-medium">{stockOverview.peRatio}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Dividend Yield</span>
                                    {/* <span className="text-sm font-medium">{stockOverview.dividendYield}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Currency</span>
                                    {/* <span className="text-sm font-medium">{stockOverview.currency}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Previous Close</span>
                                    {/* <span className="text-sm font-medium">{stockOverview.previousClose}</span> */}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">52-Week High</span>
                                    {/* <span className="text-sm font-medium text-green-600">{stockOverview.high52Week}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">52-Week Low</span>
                                    {/* <span className="text-sm font-medium text-red-600">{stockOverview.low52Week}</span> */}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Analyst Ratings</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Buy</span>
                                    {/* <span className="text-sm font-medium text-green-600">{analystRatings.buy}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Hold</span>
                                    {/* <span className="text-sm font-medium text-yellow-600">{analystRatings.hold}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sell</span>
                                    {/* <span className="text-sm font-medium text-red-600">{analystRatings.sell}</span> */}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg Rating</span>
                                    {/* <span className="text-sm font-medium">{analystRatings.average}</span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

export default OverViewTab