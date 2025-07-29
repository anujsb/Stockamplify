import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const FinancialTab = () => {
  return (
    <div>
        <Card>
              <CardHeader>
                <CardTitle>Financial Metrics</CardTitle>
                <CardDescription>Key financial ratios and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Valuation Ratios</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>P/E Ratio:</span>
                        <span>15.2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P/B Ratio:</span>
                        <span>2.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROE:</span>
                        <span>18.5%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Growth Metrics</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue Growth:</span>
                        <span className="text-green-600">+12.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>EPS Growth:</span>
                        <span className="text-green-600">+8.7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Debt/Equity:</span>
                        <span>0.45</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default FinancialTab