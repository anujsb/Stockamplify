import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPercentage } from '@/lib/utils/stockUtils';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';

const OverViewTab = ({ stock }: { stock: any }) => {
    const formatCurrency = (value: number) => `₹${Number(value).toFixed(2)}`;
    const currentValue = stock.currentPrice * stock.quantity;
    const gainLoss = stock.currentPrice * stock.quantity - stock.buyPrice * stock.quantity;
    const gainLossPercentage = ((gainLoss / (stock.buyPrice * stock.quantity)) * 100).toFixed(2);

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
              <p className="text-lg font-bold text-blue-600">{stock.quantity}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Invested Value</p>
              <p className="text-lg font-bold text-green-600">{stock.buyPrice * stock.quantity}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Current Value</p>
              <p className="text-lg font-bold text-purple-600">{currentValue}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gain/Loss</p>
              {/* <p className={`text-lg font-bold ${gainLossData.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(gainLossData.gainLoss))}
              </p> */}
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gain/Loss %</p>
              {/* <p className={`text-lg font-bold ${gainLossData.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossData.gainLossPercent.toFixed(2)}%
              </p> */}
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Est. Yearly Return</p>
              {/* <p className="text-lg font-bold text-yellow-600">
                {(gainLossData.gainLossPercent * 1.2).toFixed(2)}%
              </p> */}
              <p className="text-xs text-gray-500">Est. yearly</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-semibold">{stock.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Buy Price:</span>
                        <span className="font-semibold">{formatCurrency(stock.buyPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Current Price:</span>
                        <span className="font-semibold">{formatCurrency(stock.currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span className="font-semibold">{formatCurrency(stock.currentPrice * stock.quantity)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Gain/Loss:</span>
                        <span className={`font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                            {formatCurrency(gainLoss)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Gain/Loss %:</span>
                        <span className={`font-semibold ${Number(gainLossPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(gainLossPercentage)}
                        </span>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

export default OverViewTab