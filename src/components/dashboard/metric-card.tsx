'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  change?: number
  icon?: React.ReactNode
}

export function MetricCard({ label, value, change, icon }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-content-subtle">{label}</p>
          {icon && <div className="text-content-subtle">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-content-emphasis">{value}</p>
          {change !== undefined && change !== 0 && (
            <span
              className={cn(
                'flex items-center text-sm font-medium',
                isPositive && 'text-emerald-500',
                isNegative && 'text-red-500'
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-0.5 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(change)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
