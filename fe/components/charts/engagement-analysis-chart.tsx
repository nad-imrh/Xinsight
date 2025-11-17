'use client'

import { EngagementMetrics } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'

interface EngagementAnalysisChartProps {
  metrics: EngagementMetrics
  title?: string
}

export function EngagementAnalysisChart({ metrics, title = 'Engagement Deep Dive' }: EngagementAnalysisChartProps) {
  const engagementBreakdown = [
    { name: 'Likes', value: metrics.likeRate },
    { name: 'Retweets', value: metrics.retweetRate },
    { name: 'Replies', value: metrics.replyRate }
  ]

  const colors = ['hsl(217, 91%, 60%)', 'hsl(280, 85%, 65%)', 'hsl(262, 100%, 70%)']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/30">
              <p className="text-xs text-slate-400 mb-2">Total Engagement</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.totalEngagement}</p>
            </div>
            <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
              <p className="text-xs text-slate-400 mb-2">Avg per Tweet</p>
              <p className="text-2xl font-bold text-cyan-400">{metrics.avgEngagementPerTweet.toFixed(1)}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/30">
              <p className="text-xs text-slate-400 mb-2">Engagement Rate</p>
              <p className="text-2xl font-bold text-purple-400">{metrics.engagementRate.toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-700/30">
              <p className="text-xs text-slate-400 mb-2">Interaction Type</p>
              <p className="text-xs font-semibold text-indigo-400">See breakdown</p>
            </div>
          </div>

          {/* Engagement Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Engagement Rate Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Like Rate</span>
                  <span className="text-lg font-bold text-blue-400">{metrics.likeRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(metrics.likeRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Retweet Rate</span>
                  <span className="text-lg font-bold text-purple-400">{metrics.retweetRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min(metrics.retweetRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Reply Rate</span>
                  <span className="text-lg font-bold text-indigo-400">{metrics.replyRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${Math.min(metrics.replyRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engagement by Topic */}
          {metrics.engagementByTopic.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-300">Engagement by Topic</h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.engagementByTopic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="topic" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="engagement" 
                      fill="hsl(217, 91%, 60%)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
