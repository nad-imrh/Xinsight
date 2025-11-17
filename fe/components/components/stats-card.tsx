import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  change: string
  isPositive?: boolean
}

export function StatsCard({ title, value, change, isPositive = true }: StatsCardProps) {
  const isUp = change.startsWith('+')

  return (
    <Card className="bg-card/50 border-border">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {change}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
