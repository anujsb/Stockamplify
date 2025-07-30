import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, DollarSign, Activity } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: any[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const calculatePortfolioSummary = () => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalGainLoss = 0;
    let lastUpdated: Date | null = null;

    portfolio.forEach(item => {
      const invested = Number(item.buyPrice) * item.quantity;
      const currentValue = Number(item.realTimePrice?.price || 0) * item.quantity;
      const gainLoss = currentValue - invested;

      totalInvested += invested;
      totalCurrentValue += currentValue;
      totalGainLoss += gainLoss;

      // Track the most recent update time
      // if (item.realTimePrice?.updatedAt) {
      //   const updateTime = new Date(item.realTimePrice.updatedAt.toLocaleTimeString);
      //   if (!lastUpdated || updateTime > lastUpdated) {
      //     lastUpdated = updateTime;
      //   }
      // }
    });

    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercentage,
      lastUpdated
    };
  };

  const { totalInvested, totalCurrentValue, totalGainLoss, totalGainLossPercentage, lastUpdated } = calculatePortfolioSummary();

  const formatCurrency = (value: number) => `₹${Number(value).toFixed(2)}`;
  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (portfolio.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Portfolio Summary
            {lastUpdated && (
              <span className="text-sm font-normal text-gray-500 ml-auto flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {/* Last updated: {formatDateTime(lastUpdated)} */}
                {/* Last updated: {stock.realTimePrice.lastUpdated.toLocaleTimeString()} ({lastUpdated.toLocaleDateString()}) */}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Invested</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInvested)}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Current Value</span>
              </div>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalCurrentValue)}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-600">Total Gain/Loss</span>
              </div>
              <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalGainLoss)}
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {totalGainLossPercentage >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm font-medium text-gray-600">Gain/Loss %</span>
              </div>
              <p className={`text-xl font-bold ${totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(totalGainLossPercentage)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary; 