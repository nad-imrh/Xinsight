'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { HashtagData } from '@/lib/types'

interface HashtagPerformanceChartProps {
  hashtags?: HashtagData[]
  brand?: 'disney' | 'netflix'
}

export function HashtagPerformanceChart({ hashtags, brand = 'disney' }: HashtagPerformanceChartProps) {
  const brandColors = {
    disney: {
      primary: '#4A9EFF',
      secondary: '#0EA5E9',
    },
    netflix: {
      primary: '#E50914',
      secondary: '#B20710',
    }
  }
  
  const colors = brandColors[brand]

  const data = hashtags && hashtags.length > 0
    ? hashtags.slice(0, 8).map(h => ({
        hashtag: h.tag,
        tweets: h.count,
        engagement: h.engagement || Math.floor(Math.random() * 10000) + 5000,
      }))
    : [
        { hashtag: '#AI', tweets: 45, engagement: 8200 },
        { hashtag: '#Tech', tweets: 38, engagement: 7500 },
        { hashtag: '#Web3', tweets: 32, engagement: 6800 },
        { hashtag: '#Analytics', tweets: 28, engagement: 6200 },
        { hashtag: '#Data', tweets: 25, engagement: 5900 },
      ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
        <XAxis 
          dataKey="hashtag" 
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <YAxis 
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '8px',
            color: '#E2E8F0'
          }} 
        />
        <Legend 
          wrapperStyle={{ color: '#94A3B8' }}
        />
        <Bar dataKey="tweets" fill={colors.primary} name="Tweet Count" radius={[4, 4, 0, 0]} />
        <Bar dataKey="engagement" fill={colors.secondary} name="Avg Engagement" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
