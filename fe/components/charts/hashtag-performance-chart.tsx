'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { HashtagData } from '@/lib/types'

interface HashtagPerformanceChartProps {
  hashtags?: HashtagData[]
  brand?: string
}

export function HashtagPerformanceChart({ hashtags, brand }: HashtagPerformanceChartProps) {
  // 🔍 DEBUG: Log data yang diterima
  console.log('📊 HashtagPerformanceChart received:', {
    brand,
    hashtagsCount: hashtags?.length,
    firstHashtag: hashtags?.[0]
  })

  const brandColors = {
    disney: {
      primary: '#4A9EFF',
      secondary: '#0EA5E9',
    },
    netflix: {
      primary: '#E50914',
      secondary: '#B20710',
    },
  } as const

  const brandKey: 'disney' | 'netflix' =
    brand?.toLowerCase().includes('netflix') ? 'netflix' : 'disney'

  const colors = brandColors[brandKey]

  // ✅ Cek apakah ada data hashtags yang valid
  const hasValidData = hashtags && Array.isArray(hashtags) && hashtags.length > 0

  const data = hasValidData
    ? hashtags.slice(0, 8).map((h) => ({
        hashtag: h.hashtag || 'N/A',
        tweets: h.count || 0,
        engagement: h.total_engagement || h.avg_engagement || 0,
      }))
    : [
        { hashtag: 'No data', tweets: 0, engagement: 0 },
      ]

  console.log('📈 Chart data prepared:', data)

  return (
    <div className="w-full h-full">
      {!hasValidData && (
        <div className="text-center text-slate-400 mb-4 text-sm">
          No hashtag data available
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis 
            dataKey="hashtag" 
            stroke="#94A3B8" 
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              color: '#E2E8F0',
            }}
          />
          <Legend wrapperStyle={{ color: '#94A3B8' }} />
          <Bar dataKey="tweets" fill={colors.primary} name="Tweet Count" radius={[4, 4, 0, 0]} />
          <Bar dataKey="engagement" fill={colors.secondary} name="Total Engagement" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}