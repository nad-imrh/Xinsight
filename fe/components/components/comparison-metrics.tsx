'use client'

import { Card, CardContent } from '@/components/ui/card'

export interface ComparisonAccount {
  username: string
  tweets: number
  followers: number
  engagement_rate: number
  sentiment_positive: number
}

interface ComparisonMetricsProps {
  brands: ComparisonAccount[]
}

const safeNumber = (val: number | undefined | null): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val
  return 0
}

export function ComparisonMetrics({ brands }: ComparisonMetricsProps) {
  // butuh minimal 2 brand untuk dibandingkan
  if (!brands || brands.length < 2) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-6">
            <p className="text-sm text-slate-400">
              Not enough data to compare brands yet. Please upload at least two brands.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ambil 2 brand pertama dari list (boleh sampai 5 total, tapi yang dibandingkan 2 dulu)
  const [brandA, brandB] = brands

  const metrics = [
    {
      label: 'Total Followers',
      a: safeNumber(brandA.followers),
      b: safeNumber(brandB.followers),
      format: (val: number) => `${(val / 1000).toFixed(1)}K`,
    },
    {
      label: 'Total Tweets',
      a: safeNumber(brandA.tweets),
      b: safeNumber(brandB.tweets),
      format: (val: number) => val.toLocaleString(),
    },
    {
      label: 'Engagement Rate',
      a: safeNumber(brandA.engagement_rate),
      b: safeNumber(brandB.engagement_rate),
      format: (val: number) => `${val.toFixed(2)}%`,
    },
    {
      label: 'Positive Sentiment',
      a: safeNumber(brandA.sentiment_positive),
      b: safeNumber(brandB.sentiment_positive),
      format: (val: number) => `${val.toFixed(1)}%`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const isAWin = metric.a > metric.b
        return (
          <Card key={idx} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm mb-3">{metric.label}</p>
              <div className="space-y-2">
                {/* Brand A */}
                <div
                  className={`p-3 rounded-lg ${
                    isAWin
                      ? 'bg-emerald-900/30 border border-emerald-700'
                      : 'bg-slate-800'
                  }`}
                >
                  <p className="text-slate-300 text-xs uppercase tracking-wide">
                    {brandA.username}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      isAWin ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {metric.format(metric.a)}
                  </p>
                </div>

                {/* Brand B */}
                <div
                  className={`p-3 rounded-lg ${
                    !isAWin
                      ? 'bg-sky-900/30 border border-sky-700'
                      : 'bg-slate-800'
                  }`}
                >
                  <p className="text-slate-300 text-xs uppercase tracking-wide">
                    {brandB.username}
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      !isAWin ? 'text-sky-400' : 'text-slate-200'
                    }`}
                  >
                    {metric.format(metric.b)}
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
