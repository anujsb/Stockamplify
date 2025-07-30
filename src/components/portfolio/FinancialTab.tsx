import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const FinancialTab = ({ item }: { item: any }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2">
              {/* <AlertCircle className="h-5 w-5 text-indigo-600" /> */}
              Financial Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="text-sm font-medium">{item.financialData.totalRevenue}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Total Cash</span>
                  <span className="text-sm font-medium">{item.financialData.totalCash}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Total Debt</span>
                  <span className="text-sm font-medium">{item.financialData.totalDebt}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Debt To Equity</span>
                  <span className="text-sm font-medium">{item.financialData.debtToEquity}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Current Ratio</span>
                  <span className="text-sm font-medium">{item.financialData.currentRatio}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Quick Ratio</span>
                  <span className="text-sm font-medium">{item.financialData.quickRatio}</span>
                </div>
                

              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2">
              {/* <AlertCircle className="h-5 w-5 text-indigo-600" /> */}
              Margins & Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Profit Margin</span>
                  <span className="text-sm font-medium">{item.financialData.profitMargin}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Gross Margin</span>
                  <span className="text-sm font-medium">{item.financialData.grossMargin}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Operating Margin</span>
                  <span className="text-sm font-medium">{item.financialData.operatingMargin}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Ebitda Margin</span>
                  <span className="text-sm font-medium">{item.financialData.ebitdaMargin}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Return on Assets</span>
                  <span className="text-sm font-medium">{item.financialData.returnOnAssets}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Return on Equity</span>
                  <span className="text-sm font-medium">{item.financialData.returnOnEquity}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span className="text-sm font-medium">{item.financialData.revenueGrowth}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Earnings Growth</span>
                  <span className="text-sm font-medium">{item.financialData.earningsGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2">
              {/* <AlertCircle className="h-5 w-5 text-indigo-600" /> */}
              Fundamental Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">eps TTM</span>
                  <span className="text-sm font-medium">{item.fundamentalData.epsTTM}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">eps Forward</span>
                  <span className="text-sm font-medium">{item.fundamentalData.epsForward}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Book Value</span>
                  <span className="text-sm font-medium">{item.fundamentalData.bookValue}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Trailing PE</span>
                  <span className="text-sm font-medium">{item.fundamentalData.trailingPE}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Forward PE</span>
                  <span className="text-sm font-medium">{item.fundamentalData.forwardPE}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-gray-600">Price to Book</span>
                  <span className="text-sm font-medium">{item.fundamentalData.priceToBook}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FinancialTab