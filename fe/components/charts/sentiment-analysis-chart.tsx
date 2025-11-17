'use client'

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SentimentExample {
  id_str?: string
  text?: string
  text_preview?: string
  engagement?: number
  favorite_count?: number
  retweet_count?: number
  score?: number
  created_at?: string
}

interface SentimentAnalysisChartProps {
  sentiment?: {
    positive: number
    neutral: number
    negative: number
    positive_pct?: number
    neutral_pct?: number
    negative_pct?: number
  }
  examples?: {
    positive?: SentimentExample[]
    neutral?: SentimentExample[]
    negative?: SentimentExample[]
  }
  brand?: string
}

const SENTIMENT_COLORS = {
  positive: '#22C55E',
  neutral: '#F59E0B',
  negative: '#EF4444',
}

const renderLabel = (props: PieLabelRenderProps) => {
  return `${props.name}: ${props.value}%`
}

export function SentimentAnalysisChart({
  sentiment,
  examples,
  brand,
}: SentimentAnalysisChartProps) {
  // ✅ Gunakan persentase jika ada, fallback ke raw numbers
  const data = sentiment
    ? [
        {
          name: 'Positive',
          value: sentiment.positive_pct ?? sentiment.positive,
          fill: SENTIMENT_COLORS.positive,
        },
        {
          name: 'Neutral',
          value: sentiment.neutral_pct ?? sentiment.neutral,
          fill: SENTIMENT_COLORS.neutral,
        },
        {
          name: 'Negative',
          value: sentiment.negative_pct ?? sentiment.negative,
          fill: SENTIMENT_COLORS.negative,
        },
      ]
    : [
        { name: 'Positive', value: 65, fill: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: 25, fill: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: 10, fill: SENTIMENT_COLORS.negative },
      ]

  // ✅ Render sentiment examples dengan data dari backend
  const renderExamples = (exampleList?: SentimentExample[], sentimentType?: string) => {
    if (!exampleList || exampleList.length === 0) {
      return (
        <p className="text-xs text-slate-400 italic">
          Tidak ada contoh tweet untuk sentimen {sentimentType}
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {exampleList.slice(0, 2).map((example, idx) => (
          <div
            key={example.id_str || idx}
            className="text-xs p-2 rounded bg-slate-800/30 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <p className="line-clamp-2 text-slate-200">
              {example.text_preview || example.text || 'No text available'}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-slate-400 text-[10px]">
                {example.favorite_count ?? 0} likes · {example.retweet_count ?? 0} retweets
              </p>
              {example.score !== undefined && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  Score: {example.score.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ✅ Get persentase untuk display
  const positivePct = sentiment?.positive_pct ?? sentiment?.positive ?? 0
  const neutralPct = sentiment?.neutral_pct ?? sentiment?.neutral ?? 0
  const negativePct = sentiment?.negative_pct ?? sentiment?.negative ?? 0

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Sentiment Analysis</CardTitle>
        <CardDescription className="text-slate-400">
          Analisis sentimen dari tweet dengan contoh
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={{ stroke: '#94a3b8' }}
                label={renderLabel}
                outerRadius={100}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="#1e293b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend wrapperStyle={{ color: '#FFFFFF' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>

          {/* Examples */}
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.positive }}
                />
                Positif ({positivePct.toFixed(1)}%)
              </h4>
              {renderExamples(examples?.positive, 'positif')}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.neutral }}
                />
                Netral ({neutralPct.toFixed(1)}%)
              </h4>
              {renderExamples(examples?.neutral, 'netral')}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.negative }}
                />
                Negatif ({negativePct.toFixed(1)}%)
              </h4>
              {renderExamples(examples?.negative, 'negatif')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}