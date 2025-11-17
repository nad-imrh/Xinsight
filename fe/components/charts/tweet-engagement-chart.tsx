'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { date: 'Mon', likes: 240, retweets: 120, replies: 80 },
  { date: 'Tue', likes: 320, retweets: 150, replies: 95 },
  { date: 'Wed', likes: 280, retweets: 140, replies: 75 },
  { date: 'Thu', likes: 450, retweets: 220, replies: 150 },
  { date: 'Fri', likes: 520, retweets: 280, replies: 180 },
  { date: 'Sat', likes: 390, retweets: 190, replies: 130 },
  { date: 'Sun', likes: 310, retweets: 160, replies: 100 },
]

export function TweetEngagementChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis stroke="hsl(var(--color-muted-foreground))" />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }} />
        <Legend />
        <Line type="monotone" dataKey="likes" stroke="hsl(var(--color-chart-1))" strokeWidth={2} />
        <Line type="monotone" dataKey="retweets" stroke="hsl(var(--color-chart-2))" strokeWidth={2} />
        <Line type="monotone" dataKey="replies" stroke="hsl(var(--color-chart-3))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
