'use client'

import { Header } from '@/components/layout/header'
import { ClientCard } from '@/components/clients/client-card'
import { SAAS_CATEGORIES, type SaaSCategory } from '@/lib/types'
import { Search, Plus, Dumbbell, Activity, Calendar, CheckCircle2, AlertCircle, Users } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ClientWithPayments } from '@/lib/types'

const categoryIcons: Record<SaaSCategory, React.ElementType> = {
  gimnasio: Dumbbell,
  pilates: Activity,
  cymple: Calendar,
}

type FilterCategory = SaaSCategory | 'all'
type PaymentFilter = 'all' | 'paid' | 'pending'

export default function ClientsPage() {
  const [allClients, setAllClients] = useState<ClientWithPayments[]>([])
  const [categoryStats, setCategoryStats] = useState<Record<SaaSCategory, { clients: number; revenue: number }>>({
    gimnasio: { clients: 0, revenue: 0 },
    pilates: { clients: 0, revenue: 0 },
    cymple: { clients: 0, revenue: 0 },
  })

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(setAllClients)
  }, [])

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')

  const filteredClients = useMemo(() => {
    return allClients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || client.category === categoryFilter
      const matchesPayment = paymentFilter === 'all' || 
        (paymentFilter === 'paid' && client.isPaidThisMonth) ||
        (paymentFilter === 'pending' && !client.isPaidThisMonth)
      return matchesSearch && matchesCategory && matchesPayment
    })
  }, [allClients, search, categoryFilter, paymentFilter])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Clientes
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {allClients.length} clientes registrados
            </p>
          </div>
          
          <Link
            href="/clients/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-base font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Nuevo Cliente
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-medium transition-all',
              categoryFilter === 'all'
                ? 'bg-foreground text-background'
                : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Users className="h-4 w-4" />
            Todos
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{allClients.length}</span>
          </button>
          
          {(Object.keys(SAAS_CATEGORIES) as SaaSCategory[]).map((cat) => {
            const Icon = categoryIcons[cat]
            const info = SAAS_CATEGORIES[cat]
            const count = allClients.filter(c => c.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-medium transition-all',
                  categoryFilter === cat
                    ? cn(info.bgColor, info.color)
                    : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                {info.label}
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  categoryFilter === cat ? 'bg-white/20' : 'bg-secondary'
                )}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Search and Payment Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, dueno o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-border/60 bg-card py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex rounded-2xl border border-border/60 bg-card p-1.5">
            <button
              onClick={() => setPaymentFilter('all')}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                paymentFilter === 'all'
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                paymentFilter === 'paid'
                  ? 'bg-success/15 text-success'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Pagados
            </button>
            <button
              onClick={() => setPaymentFilter('pending')}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                paymentFilter === 'pending'
                  ? 'bg-warning/15 text-warning'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <AlertCircle className="h-4 w-4" />
              Pendientes
            </button>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-medium text-foreground">No se encontraron clientes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar tu busqueda o filtros
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
