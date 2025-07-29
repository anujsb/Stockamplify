import React from 'react'
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ChartTab = () => {
  return (
    <div>
        <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <CardDescription>Interactive chart showing price movement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart component will be implemented here</p>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default ChartTab