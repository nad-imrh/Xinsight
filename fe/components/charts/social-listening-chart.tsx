'use client'

import { SocialListeningData } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SocialListeningChartProps {
  data: SocialListeningData
  title?: string
}

export function SocialListeningChart({ data, title = 'Social Listening' }: SocialListeningChartProps) {
  const topicChartData = data.trendingTopics.map(topic => ({
    name: topic.label,
    mentions: topic.tweetCount,
    weight: Math.round(topic.weight * 100)
  }))

  return (
    <div className="space-y-6">
      {/* Main Social Listening Card */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
              <p className="text-xs text-slate-400 mb-1">Total Mentions</p>
              <p className="text-2xl font-bold text-blue-400">{data.mentions}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/30">
              <p className="text-xs text-slate-400 mb-1">Unique Hashtags</p>
              <p className="text-2xl font-bold text-purple-400">{data.hashtags.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
              <p className="text-xs text-slate-400 mb-1">Keywords Tracked</p>
              <p className="text-2xl font-bold text-cyan-400">{data.keywords.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-700/30">
              <p className="text-xs text-slate-400 mb-1">Time Range</p>
              <p className="text-sm font-bold text-indigo-400">{data.timeRange}</p>
            </div>
          </div>

          {/* Trending Topics Chart */}
          {data.trendingTopics.length > 0 && (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="mentions" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Hashtags */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-300">Top Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {data.hashtags.slice(0, 15).map((hashtag, idx) => (
                <Badge 
                  key={idx}
                  className="bg-blue-900/40 text-blue-200 border-blue-700/50"
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Top Keywords */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-300">Top Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.slice(0, 15).map((keyword, idx) => (
                <Badge 
                  key={idx}
                  className="bg-purple-900/40 text-purple-200 border-purple-700/50"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
