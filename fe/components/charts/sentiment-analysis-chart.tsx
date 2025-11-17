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
import { Tweet } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SentimentAnalysisChartProps {
  sentiment?: {
    positive: number
    neutral: number
    negative: number
    positiveExamples?: Tweet[]
    neutralExamples?: Tweet[]
    negativeExamples?: Tweet[]
  }
  // boleh string bebas biar nggak ribet sama brand id
  brand?: string
}

const SENTIMENT_COLORS = {
  positive: '#22C55E',
  neutral: '#F59E0B',
  negative: '#EF4444',
}

const renderLabel = (props: PieLabelRenderProps) => {
  // props.name & props.value sudah disediakan Recharts
  return `${props.name}: ${props.value}%`
}

export function SentimentAnalysisChart({
  sentiment,
  brand, // sekarang nggak kepake, tapi boleh disimpan buat future styling
}: SentimentAnalysisChartProps) {
  const data = sentiment
    ? [
        {
          name: 'Positive',
          value: sentiment.positive,
          fill: SENTIMENT_COLORS.positive,
        },
        {
          name: 'Neutral',
          value: sentiment.neutral,
          fill: SENTIMENT_COLORS.neutral,
        },
        {
          name: 'Negative',
          value: sentiment.negative,
          fill: SENTIMENT_COLORS.negative,
        },
      ]
    : [
        { name: 'Positive', value: 65, fill: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: 25, fill: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: 10, fill: SENTIMENT_COLORS.negative },
      ]

  const renderExamples = (examples?: Tweet[]) => {
    if (!examples || examples.length === 0) {
      return (
        <p className="text-xs text-slate-400 italic">
          Tidak ada contoh tweet
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {examples.map((tweet, idx) => (
          <div
            key={idx}
            className="text-xs p-2 rounded bg-slate-800/30 border border-slate-700"
          >
            <p className="line-clamp-2 text-slate-200">{tweet.full_text}</p>
            <p className="text-slate-400 mt-1 text-[10px]">
              {tweet.favorite_count} likes · {tweet.retweet_count} retweets
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Sentiment Analysis</CardTitle>
        <CardDescription className="text-slate-400">
          Analisis sentimen dari tweet
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

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.positive }}
                />
                Positif ({sentiment?.positive ?? 0}%)
              </h4>
              {renderExamples(sentiment?.positiveExamples)}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.neutral }}
                />
                Netral ({sentiment?.neutral ?? 0}%)
              </h4>
              {renderExamples(sentiment?.neutralExamples)}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS.negative }}
                />
                Negatif ({sentiment?.negative ?? 0}%)
              </h4>
              {renderExamples(sentiment?.negativeExamples)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}