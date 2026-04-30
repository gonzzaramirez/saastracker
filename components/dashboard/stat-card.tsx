'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, subtitle, trend, icon, className }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-3.5 w-3.5" />
    return trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground bg-muted'
    return trend > 0 ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
  }

  return (
    <div className={cn(
      'relative overflow-hidden rounded-3xl bg-card p-6 transition-all duration-300',
      'border border-border/60 shadow-sm',
      'hover:shadow-lg hover:shadow-black/5 hover:border-border',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-2xl bg-secondary p-3 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      {trend !== undefined && (
        <div className={cn(
          'mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
          getTrendColor()
        )}>
          {getTrendIcon()}
          <span>{Math.abs(trend).toFixed(1)}% vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
