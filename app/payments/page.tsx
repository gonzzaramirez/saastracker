'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Header } from '@/components/layout/header'
import { SAAS_CATEGORIES, PAYMENT_METHODS, type SaaSCategory, type PaymentMethod, type PaymentStats } from '@/lib/types'
import { Search, Plus, Banknote, Building2, Filter, Calendar, Dumbbell, Activity } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'

dayjs.locale('es')

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  transferencia: Building2,
  efectivo: Banknote,
}

const categoryIcons: Record<SaaSCategory, React.ElementType> = {
  gimnasio: Dumbbell,
  pilates: Activity,
  cymple: Calendar,
}

type MethodFilter = PaymentMethod | 'all'
type CategoryFilter = SaaSCategory | 'all'

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [paymentsWithClient, setPaymentsWithClient] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => setStats(data.stats))
    fetch('/api/payments')
      .then(r => r.json())
      .then(setPaymentsWithClient)
  }, [])

  const filteredPayments = useMemo(() => {
    return paymentsWithClient.filter(payment => {
      const matchesSearch = payment.clientName.toLowerCase().includes(search.toLowerCase()) ||
        payment.description.toLowerCase().includes(search.toLowerCase())
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
      const matchesCategory = categoryFilter === 'all' || payment.category === categoryFilter
      return matchesSearch && matchesMethod && matchesCategory
    })
  }, [paymentsWithClient, search, methodFilter, categoryFilter])

  // Group payments by month
  const groupedPayments = useMemo(() => {
    const groups: { [key: string]: typeof filteredPayments } = {}
    filteredPayments.forEach(payment => {
      const key = dayjs(payment.date).format('YYYY-MM')
      if (!groups[key]) groups[key] = []
      groups[key].push(payment)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredPayments])

  const formatMonthHeader = (key: string) => {
    return dayjs(key + '-01').format('MMMM YYYY')
  }

  const getMonthTotal = (payments: typeof filteredPayments) => {
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 flex justify-center py-20">
          <p className="text-muted-foreground">Cargando...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Historial de Pagos
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {paymentsWithClient.length} pagos registrados
            </p>
          </div>
          
          <Link
            href="/payments/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-base font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Nuevo Pago
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-success">
              {formatCurrency(stats.totalThisMonth)}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Mes Anterior</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(stats.totalLastMonth)}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Historico</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(stats.totalAllTime)}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-5 flex flex-wrap gap-3">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'rounded-2xl px-4 py-2.5 text-sm font-medium transition-all',
              categoryFilter === 'all'
                ? 'bg-foreground text-background'
                : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            Todos
          </button>
          {(Object.keys(SAAS_CATEGORIES) as SaaSCategory[]).map((cat) => {
            const Icon = categoryIcons[cat]
            const info = SAAS_CATEGORIES[cat]
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all',
                  categoryFilter === cat
                    ? cn(info.bgColor, info.color)
                    : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                {info.label}
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-border/60 bg-card py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex rounded-2xl border border-border/60 bg-card p-1.5">
              {(['all', 'transferencia', 'efectivo'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setMethodFilter(method)}
                  className={cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                    methodFilter === method
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {method === 'all' ? 'Todos' : PAYMENT_METHODS[method].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments List */}
        {groupedPayments.length > 0 ? (
          <div className="space-y-8">
            {groupedPayments.map(([month, payments]) => (
              <div key={month}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-secondary p-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold capitalize text-foreground">
                      {formatMonthHeader(month)}
                    </h2>
                  </div>
                  <p className="text-lg font-semibold tabular-nums text-success">
                    {formatCurrency(getMonthTotal(payments))}
                  </p>
                </div>
                
                <div className="rounded-3xl border border-border/60 bg-card shadow-sm divide-y divide-border/50">
                  {payments.map((payment) => {
                    const Icon = methodIcons[payment.method]
                    const categoryInfo = SAAS_CATEGORIES[payment.category]
                    return (
                      <div
                        key={payment.id}
                        className="flex items-center gap-4 p-5 transition-colors hover:bg-secondary/30"
                      >
                        <div className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                          categoryInfo.bgColor
                        )}>
                          <Icon className={cn('h-5 w-5', categoryInfo.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/clients/${payment.clientId}`}
                              className="text-base font-semibold text-foreground hover:text-accent transition-colors"
                            >
                              {payment.clientName}
                            </Link>
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              categoryInfo.bgColor,
                              categoryInfo.color
                            )}>
                              {categoryInfo.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {payment.description} · {PAYMENT_METHODS[payment.method].label}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-base font-semibold tabular-nums text-success">
                            +{formatCurrency(payment.amount)}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {dayjs(payment.date).format('D MMM')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-medium text-foreground">No se encontraron pagos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar tu busqueda o filtros
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
