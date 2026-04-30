import { Header } from '@/components/layout/header'
import { StatCard } from '@/components/dashboard/stat-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentPayments } from '@/components/dashboard/recent-payments'
import { getPaymentStats, getMonthlyRevenue, getRecentPayments, getStatsByCategory } from '@/lib/data'
import { SAAS_CATEGORIES, type SaaSCategory } from '@/lib/types'
import { Users, TrendingUp, CheckCircle2, AlertCircle, Dumbbell, Activity, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const categoryIcons: Record<SaaSCategory, React.ElementType> = {
  gimnasio: Dumbbell,
  pilates: Activity,
  cymple: Calendar,
}

export default async function DashboardPage() {
  const stats = await getPaymentStats()
  const monthlyRevenue = await getMonthlyRevenue()
  const recentPayments = await getRecentPayments(5)
  const categoryStats = await getStatsByCategory()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Resumen de tu negocio SaaS
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ingresos este mes"
            value={formatCurrency(stats.totalThisMonth)}
            trend={stats.monthlyGrowth}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Total historico"
            value={formatCurrency(stats.totalAllTime)}
            subtitle="Desde el inicio"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Clientes activos"
            value={stats.activeClients}
            subtitle={`de ${stats.clientCount} totales`}
            icon={<Users className="h-5 w-5" />}
          />
          
          {/* Payment Status Card */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Estado del mes
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-success/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pagados</span>
                </div>
                <span className="text-2xl font-semibold text-success">{stats.paidThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-warning/10 p-1.5">
                    <AlertCircle className="h-4 w-4 text-warning" />
                  </div>
                  <span className="text-sm text-muted-foreground">Pendientes</span>
                </div>
                <span className="text-2xl font-semibold text-warning">{stats.pendingThisMonth}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          {(Object.keys(SAAS_CATEGORIES) as SaaSCategory[]).map((cat) => {
            const Icon = categoryIcons[cat]
            const info = SAAS_CATEGORIES[cat]
            const catStats = categoryStats[cat]
            return (
              <Link
                key={cat}
                href={`/clients?category=${cat}`}
                className={cn(
                  'group rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300',
                  'hover:shadow-lg hover:shadow-black/5 hover:border-border',
                  'active:scale-[0.98]'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('rounded-2xl p-3', info.bgColor)}>
                    <Icon className={cn('h-6 w-6', info.color)} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                      {info.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {catStats.clients} clientes activos
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className={cn('text-2xl font-semibold tabular-nums', info.color)}>
                    {formatCurrency(catStats.revenue)}
                  </span>
                  <span className="text-sm text-muted-foreground">este mes</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart data={monthlyRevenue} />
          <RecentPayments payments={recentPayments} />
        </div>
      </main>
    </div>
  )
}
