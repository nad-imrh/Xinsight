'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { age: 18, engagement: 35, followers: 500 },
  { age: 25, engagement: 45, followers: 800 },
  { age: 30, engagement: 52, followers: 1200 },
  { age: 35, engagement: 48, followers: 900 },
  { age: 40, engagement: 38, followers: 600 },
  { age: 45, engagement: 30, followers: 400 },
  { age: 50, engagement: 25, followers: 300 },
]

export function AudienceInsightsChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis dataKey="age" name="Age" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis dataKey="engagement" name="Engagement %" stroke="hsl(var(--color-muted-foreground))" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }}
        />
        <Legend />
        <Scatter name="Audience Segment" data={data} fill="hsl(var(--color-chart-1))" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
