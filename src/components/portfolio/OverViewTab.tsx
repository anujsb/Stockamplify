import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPercentage, formatPrice, formatLargeNumber, formatVolume, normalizeStockSymbol} from '@/lib/utils/stockUtils';
import { AlertCircle, TrendingDown, TrendingUp, Users } from 'lucide-react';

const OverViewTab = ({ item }: { item: any }) => {
    // const formatCurrency = (value: number) => `${Number(value).toFixed(2)}`;
    const currentValue = item.realTimePrice.price * item.quantity;
    const gainLoss = item.realTimePrice.price * item.quantity - item.buyPrice * item.quantity;
    // const gainLossPercentage = ((gainLoss / (stock.buyPrice * stock.quantity)) * 100).toFixed(2);
    const gainLossPercentage = (gainLoss / (item.buyPrice * item.quantity)) * 100;


    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Your Position
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Quantity Held</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600">{item.quantity}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Total Invested Value</p>
                            <p className="text-lg font-bold text-green-600">{formatPrice(item.buyPrice * item.quantity)}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Current Value</p>
                            <p className="text-lg font-bold text-purple-600">{formatPrice(currentValue)}</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Gain/Loss</p>
                            <p className={`text-lg font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(gainLoss)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Gain/Loss %</p>
                            <p className={`text-lg font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(gainLossPercentage)}

                            </p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Est. Yearly Return %</p>
                            <p className="text-lg font-bold text-yellow-600">
                                {formatPrice(gainLossPercentage * 1.2)}
                            </p>
                            <p className="text-xs text-gray-500">Est. yearly</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-indigo-600" />
                            Basic Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                        <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Company</span>
                                <span className="text-sm font-medium">{item.stock.name}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Ticker</span>
                                <span className="text-sm font-medium">{item.stock.symbol}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Sector</span>
                                <span className="text-sm font-medium">{item.stock.sector}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Industry</span>
                                <span className="text-sm font-medium">{item.stock.industry}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Volume</span>
                                <span className="text-sm font-medium">{formatVolume(item.realTimePrice.volume)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Market Cap</span>
                                <span className="text-sm font-medium">{formatLargeNumber(item.intradayPrice.marketCap)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-indigo-600" />
                            Market Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                        <div>
                            <div className="space-y-2">
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">Previous Close</span>
                                    <span className="text-sm font-medium">{formatPrice(item.intradayPrice.previousClose)}</span>
                                </div>  
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">Day's Range</span>
                                    <span className="text-sm font-medium">
                                        {formatPrice(item.intradayPrice.dayLow)}
                                        {' - '}
                                        {formatPrice(item.intradayPrice.dayHigh)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">52 Week Range</span>
                                    <span className="text-sm font-medium">
                                        {formatPrice(item.intradayPrice.fiftyTwoWeekHigh)}
                                        {' - '}
                                        {formatPrice(item.intradayPrice.fiftyTwoWeekLow)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">50 Day Moving Average</span>
                                    <span className="text-sm font-medium">{formatPrice(item.intradayPrice.fiftyDayMovingAverage)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">200 Day Moving Average</span>
                                    <span className="text-sm font-medium">{formatPrice(item.intradayPrice.twoHundredDayMovingAverage)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">Average Daily Volume (3 Month)</span>
                                    <span className="text-sm font-medium">{formatVolume(item.intradayPrice.averageDailyVolume3Month)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-sm text-gray-600">Average Daily Volume (10 Day)</span>
                                    <span className="text-sm font-medium">{formatVolume(item.intradayPrice.averageDailyVolume10Day)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-indigo-600" />
                            Analyst Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                        <div className="space-y-1 sm:space-y-2">
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Recommendation</span>
                                <span className="text-sm font-medium">{item.analystRating.recommendation}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Number Of Analysts</span>
                                <span className="text-sm font-medium">{item.analystRating.numberOfAnalysts}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Target Price High</span>
                                <span className="text-sm font-medium">{formatPrice(item.analystRating.targetPriceHigh)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-gray-600">Target Price Low</span>
                                <span className="text-sm font-medium">{formatPrice(item.analystRating.targetLowPrice)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default OverViewTab