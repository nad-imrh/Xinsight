'use client'

import { TrendData } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'

interface TrendAnalysisChartProps {
  data: TrendData[]
  title?: string
  brand?: 'disney' | 'netflix'
}

export function TrendAnalysisChart({ data, title = 'Trend Analysis', brand = 'disney' }: TrendAnalysisChartProps) {
  const brandColors = {
    disney: {
      volume: '#4A9EFF', // Disney blue for tweet volume
      engagement: '#A78BFA', // Purple for engagement (distinct from blue)
      accent: '#38BDF8',
    },
    netflix: {
      volume: '#E50914', // Netflix red for tweet volume
      engagement: '#FB923C', // Orange for engagement (distinct from red)
      accent: '#F87171',
    }
  }
  
  const colors = brandColors[brand]

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No trend data available</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Composed Chart - Trend Over Time */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                stroke="#94A3B8"
                interval={Math.ceil(data.length / 7)}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                stroke="#94A3B8"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                stroke="#94A3B8"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#E2E8F0'
                }}
              />
              <Legend wrapperStyle={{ color: '#94A3B8' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                fill={`${colors.volume}30`}
                stroke={colors.volume}
                strokeWidth={2}
                name="Tweet Volume"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgEngagement"
                stroke={colors.engagement}
                strokeWidth={3}
                name="Avg Engagement"
                dot={{ fill: colors.engagement, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Activity Period */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Total Period</p>
            <p className="text-sm font-semibold text-slate-300">
              {data[0].date} to {data[data.length - 1].date}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Peak Day</p>
            <p className="text-2xl font-bold" style={{ color: colors.volume }}>
              {data.reduce((max, current) => current.count > max.count ? current : max).date}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Avg Daily Tweets</p>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>
              {(data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Peak Engagement</p>
            <p className="text-2xl font-bold" style={{ color: colors.engagement }}>
              {Math.max(...data.map(d => d.avgEngagement)).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-300">Daily Tweet Distribution</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  stroke="#94A3B8"
                  interval={Math.ceil(30 / 7)}
                />
                <YAxis 
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  stroke="#94A3B8"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    color: '#E2E8F0'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={colors.volume}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
