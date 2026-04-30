'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { Payment, SaaSCategory, PaymentMethod } from '@/lib/types'
import { SAAS_CATEGORIES, PAYMENT_METHODS } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Banknote, Building2 } from 'lucide-react'
import Link from 'next/link'

dayjs.locale('es')

interface RecentPaymentsProps {
  payments: (Payment & { clientName: string; category: SaaSCategory })[]
}

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  transferencia: Building2,
  efectivo: Banknote,
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Pagos Recientes</h3>
          <p className="text-sm text-muted-foreground">Ultimas transacciones</p>
        </div>
        <Link 
          href="/payments"
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
        >
          Ver todos
        </Link>
      </div>
      
      <div className="space-y-2">
        {payments.map((payment) => {
          const Icon = methodIcons[payment.method]
          const categoryInfo = SAAS_CATEGORIES[payment.category]
          return (
            <div
              key={payment.id}
              className={cn(
                'flex items-center gap-4 rounded-2xl p-4 transition-colors',
                'hover:bg-secondary/50'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                categoryInfo.bgColor
              )}>
                <Icon className={cn('h-5 w-5', categoryInfo.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {payment.clientName}
                  </p>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    categoryInfo.bgColor,
                    categoryInfo.color
                  )}>
                    {categoryInfo.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {PAYMENT_METHODS[payment.method].label} · {dayjs(payment.date).format('D MMM YYYY')}
                </p>
              </div>
              
              <p className="text-base font-semibold tabular-nums text-success">
                +{formatCurrency(payment.amount)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
