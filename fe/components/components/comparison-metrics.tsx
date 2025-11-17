'use client'

import { Card, CardContent } from '@/components/ui/card'

interface Account {
  username: string
  tweets: number
  followers: number
  engagement_rate: number
  sentiment_positive: number
}

interface ComparisonMetricsProps {
  disneyData: Account
  netflixData: Account
}

export function ComparisonMetrics({ disneyData, netflixData }: ComparisonMetricsProps) {
  const safeValue = (val: number | undefined): number => val ?? 0

  const metrics = [
    {
      label: 'Total Followers',
      disney: safeValue(disneyData.followers),
      netflix: safeValue(netflixData.followers),
      format: (val: number) => `${(val / 1000).toFixed(1)}K`
    },
    {
      label: 'Total Tweets',
      disney: safeValue(disneyData.tweets),
      netflix: safeValue(netflixData.tweets),
      format: (val: number) => val.toLocaleString()
    },
    {
      label: 'Engagement Rate',
      disney: safeValue(disneyData.engagement_rate),
      netflix: safeValue(netflixData.engagement_rate),
      format: (val: number) => `${val}%`
    },
    {
      label: 'Positive Sentiment',
      disney: safeValue(disneyData.sentiment_positive),
      netflix: safeValue(netflixData.sentiment_positive),
      format: (val: number) => `${val}%`
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const winner = metric.disney > metric.netflix ? 'disney' : 'netflix'
        return (
          <Card key={idx} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-3">{metric.label}</p>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg ${winner === 'disney' ? 'bg-blue-900/30 border border-blue-700' : 'bg-slate-800'}`}>
                  <p className="text-slate-300 text-xs uppercase tracking-wide">Disney</p>
                  <p className={`text-lg font-bold ${winner === 'disney' ? 'text-blue-400' : 'text-slate-300'}`}>
                    {metric.format(metric.disney)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${winner === 'netflix' ? 'bg-red-900/30 border border-red-700' : 'bg-slate-800'}`}>
                  <p className="text-slate-300 text-xs uppercase tracking-wide">Netflix</p>
                  <p className={`text-lg font-bold ${winner === 'netflix' ? 'text-red-400' : 'text-slate-300'}`}>
                    {metric.format(metric.netflix)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
