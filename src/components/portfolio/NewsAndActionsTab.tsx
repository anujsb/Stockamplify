import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const NewsAndActionsTab = () => {
  return (
    <div>
         <Card>
              <CardHeader>
                <CardTitle>Latest News</CardTitle>
                <CardDescription>Recent news and market actions affecting this stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Q3 Earnings Beat Expectations</h4>
                    <p className="text-sm text-gray-600">Company reported strong quarterly results...</p>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">New Product Launch</h4>
                    <p className="text-sm text-gray-600">Company announced expansion into new markets...</p>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default NewsAndActionsTab