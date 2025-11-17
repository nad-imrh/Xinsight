'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { source: 'Mobile', value: 45 },
  { source: 'Web', value: 35 },
  { source: 'TweetDeck', value: 15 },
  { source: 'API', value: 5 },
]

export function TweetSourceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--color-border))" />
        <PolarAngleAxis dataKey="source" stroke="hsl(var(--color-muted-foreground))" />
        <PolarRadiusAxis stroke="hsl(var(--color-muted-foreground))" />
        <Radar name="Distribution" dataKey="value" stroke="hsl(var(--color-chart-1))" fill="hsl(var(--color-chart-1) / 0.3)" />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
