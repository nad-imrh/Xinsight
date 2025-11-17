'use client'

import { Topic } from '@/lib/types'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TopicModellingChartProps {
  topics: Topic[]
  title?: string
  brand?: 'disney' | 'netflix'
}

const BRAND_COLORS = {
  disney: '#4A9EFF', // Bright Disney blue
  netflix: '#E50914' // Netflix signature red
}

export function TopicModellingChart({ topics, title = 'Topic Modelling Analysis', brand = 'disney' }: TopicModellingChartProps) {
  if (!topics || topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No topics available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = topics.map(topic => ({
    name: topic.label,
    weight: Math.round(topic.weight * 100),
    tweetCount: topic.tweetCount
  }))

  const brandColor = BRAND_COLORS[brand]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Topic Weights */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <YAxis tick={{ fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="weight" 
                  fill={brandColor}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart - Topic Distribution */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <PolarRadiusAxis tick={{ fill: '#94A3B8' }} />
                <Radar 
                  name="Topic Weight" 
                  dataKey="weight" 
                  stroke={brandColor}
                  fill={brandColor}
                  fillOpacity={0.6}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => (
            <div 
              key={topic.id}
              className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <h4 className="font-semibold text-sm mb-2" style={{ color: brandColor }}>
                {topic.label}
              </h4>
              <div className="space-y-1 text-xs text-slate-300">
                <p>Keywords: {topic.keywords.join(', ')}</p>
                <p>Weight: {Math.round(topic.weight * 100)}%</p>
                <p>Tweets: {topic.tweetCount}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
