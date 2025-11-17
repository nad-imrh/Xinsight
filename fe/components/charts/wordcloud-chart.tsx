'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface WordData {
  word: string
  count: number
}

interface WordcloudChartProps {
  data: WordData[]
  title: string
  description?: string
}

export function WordcloudChart({ data, title, description }: WordcloudChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const minCount = Math.min(...data.map(d => d.count), 1)
  
  const getSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount) || 0
    return 12 + ratio * 32 // Font size between 12px and 44px
  }

  const getOpacity = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount) || 0
    return 0.5 + ratio * 0.5 // Opacity between 0.5 and 1
  }

  // Shuffle array for better visual distribution
  const shuffledData = [...data].sort(() => Math.random() - 0.5)

  const colors = [
    'text-blue-400',
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-violet-400',
    'text-indigo-400',
    'text-sky-400',
    'text-teal-400'
  ]

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center items-center p-8 bg-slate-950 rounded-lg min-h-80">
          {shuffledData.map((item, index) => (
            <div
              key={`${item.word}-${index}`}
              className={`${colors[index % colors.length]} font-bold whitespace-nowrap hover:text-blue-300 transition-colors cursor-default`}
              style={{
                fontSize: `${getSize(item.count)}px`,
                opacity: getOpacity(item.count),
                animation: `fadeIn 0.5s ease-out ${index * 0.02}s both`
              }}
              title={`${item.word}: ${item.count} occurrences`}
            >
              {item.word}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  )
}
