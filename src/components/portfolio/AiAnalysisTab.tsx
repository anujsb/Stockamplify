import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const AiAnalysisTab = () => {
  return (
    <div>
        <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>Machine learning insights and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Sentiment Analysis</h4>
                    <p className="text-blue-700">Positive sentiment detected in recent news and social media</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">Price Prediction</h4>
                    <p className="text-green-700">AI predicts 5-8% upside potential in the next 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card> 
    </div>
  )
}

export default AiAnalysisTab