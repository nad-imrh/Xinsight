'use client'

import { PostingTimeData } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts'

interface PostingTimeHeatmapProps {
  data: PostingTimeData[]
  title?: string
}

export function PostingTimeHeatmap({ data, title = 'Posting Time Analysis' }: PostingTimeHeatmapProps) {
  const peakHour = data.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  )
  const avgEngagement = data.reduce((sum, d) => sum + d.avgEngagement, 0) / data.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-slate-400 mt-2">
          Peak posting hour: <span className="text-blue-400 font-semibold">{peakHour.hour}:00 ({peakHour.count} tweets)</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Composed Chart - Count + Engagement */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis 
                dataKey="hour"
                label={{ value: 'Hour of Day (UTC)', position: 'insideBottomRight', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Tweet Count', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Avg Engagement', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="count" 
                fill="hsl(217, 91%, 60%)"
                radius={[8, 8, 0, 0]}
                name="Tweet Count"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgEngagement" 
                stroke="hsl(280, 85%, 65%)"
                strokeWidth={2}
                name="Avg Engagement"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Total Tweets</p>
            <p className="text-2xl font-bold text-blue-400">{data.reduce((sum, d) => sum + d.count, 0)}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Peak Hour</p>
            <p className="text-2xl font-bold text-cyan-400">{peakHour.hour}:00</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Avg per Hour</p>
            <p className="text-2xl font-bold text-purple-400">{(data.reduce((sum, d) => sum + d.count, 0) / 24).toFixed(1)}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Avg Engagement</p>
            <p className="text-2xl font-bold text-indigo-400">{avgEngagement.toFixed(2)}</p>
          </div>
        </div>

        {/* Hour-by-Hour Breakdown */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-300">Hour-by-Hour Breakdown</h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {data.map(hour => (
              <div 
                key={hour.hour}
                className="p-2 rounded bg-slate-800/50 border border-slate-700 text-center text-xs"
              >
                <p className="text-slate-400 font-semibold">{hour.hour}h</p>
                <p className="text-blue-400 font-bold">{hour.count}</p>
                <p className="text-purple-300 text-xs">{hour.avgEngagement.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
