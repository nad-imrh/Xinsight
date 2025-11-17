'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { week: 'Week 1', followers: 95000 },
  { week: 'Week 2', followers: 102000 },
  { week: 'Week 3', followers: 108500 },
  { week: 'Week 4', followers: 115200 },
  { week: 'Week 5', followers: 119800 },
  { week: 'Week 6', followers: 125400 },
]

export function FollowersGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis dataKey="week" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis stroke="hsl(var(--color-muted-foreground))" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }} />
        <Area type="monotone" dataKey="followers" stroke="hsl(var(--color-chart-1))" fill="hsl(var(--color-chart-1) / 0.2)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
