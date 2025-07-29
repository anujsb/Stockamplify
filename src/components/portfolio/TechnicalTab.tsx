import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TechnicalTab = () => {
  return (
    <div>
        <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Technical analysis and trading signals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Moving Averages</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>50-day MA:</span>
                        <span>₹1,245</span>
                      </div>
                      <div className="flex justify-between">
                        <span>200-day MA:</span>
                        <span>₹1,180</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Position:</span>
                        <span className="text-green-600">Above MA</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Oscillators</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>RSI:</span>
                        <span>65</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MACD:</span>
                        <span className="text-green-600">Bullish</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Signal:</span>
                        <span className="text-green-600">Buy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default TechnicalTab