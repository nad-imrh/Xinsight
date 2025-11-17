'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { date: 'Day 1', rate: 4.2, tweets: 8 },
  { date: 'Day 2', rate: 5.1, tweets: 6 },
  { date: 'Day 3', rate: 4.8, tweets: 7 },
  { date: 'Day 4', rate: 6.2, tweets: 9 },
  { date: 'Day 5', rate: 7.1, tweets: 5 },
  { date: 'Day 6', rate: 5.9, tweets: 8 },
  { date: 'Day 7', rate: 5.5, tweets: 6 },
]

export function EngagementRateChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis yAxisId="left" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--color-muted-foreground))" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }} />
        <Legend />
        <Bar yAxisId="left" dataKey="rate" fill="hsl(var(--color-chart-1))" name="Engagement Rate %" />
        <Line yAxisId="right" type="monotone" dataKey="tweets" stroke="hsl(var(--color-chart-2))" strokeWidth={2} name="Tweet Count" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
