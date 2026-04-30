'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Header } from '@/components/layout/header'
import { SAAS_CATEGORIES, PAYMENT_METHODS, type PaymentMethod } from '@/lib/types'
import { 
  ArrowLeft, Globe, Phone, User, Calendar, ExternalLink, 
  Banknote, Building2, Mail, Lock, 
  Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Check
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import type { ClientWithPayments } from '@/lib/types'

dayjs.locale('es')

const methodIcons: Record<PaymentMethod, React.ElementType> = {
  transferencia: Building2,
  efectivo: Banknote,
}

export default function ClientDetailPage() {
  const params = useParams()
  const [client, setClient] = useState<ClientWithPayments | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<'email' | 'password' | null>(null)

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setClient(data.error ? null : data)
        setLoading(false)
      })
  }, [params.id])

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-lg font-medium text-foreground">Cargando...</h1>
          </div>
        </main>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-lg font-medium text-foreground">Cliente no encontrado</h1>
            <Link href="/clients" className="mt-4 text-sm text-accent hover:underline">
              Volver a clientes
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const categoryInfo = SAAS_CATEGORIES[client.category]

  // Group payments by year-month
  const paymentsByMonth = client.payments.reduce((acc, payment) => {
    const key = dayjs(payment.date).format('MMMM YYYY')
    if (!acc[key]) acc[key] = []
    acc[key].push(payment)
    return acc
  }, {} as Record<string, typeof client.payments>)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/clients"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>

        {/* Client Header Card */}
        <div className="mb-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-semibold',
                categoryInfo.bgColor,
                categoryInfo.color
              )}>
                {client.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    categoryInfo.bgColor,
                    categoryInfo.color
                  )}>
                    {categoryInfo.label}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                    client.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      client.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                    )} />
                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  {client.isPaidThisMonth ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pagado este mes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Pago pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link
              href={`/payments/new?client=${client.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-base font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
            >
              Registrar Pago
            </Link>
          </div>

          {/* Client Info Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5">
              <div className="rounded-xl bg-background p-2.5">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Dueno</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{client.ownerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5">
              <div className="rounded-xl bg-background p-2.5">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Telefono</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5">
              <div className="rounded-xl bg-background p-2.5">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Website</p>
                <a 
                  href={client.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  {client.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <button 
              onClick={() => copyToClipboard(client.email, 'email')}
              className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-left transition-colors hover:bg-secondary/70"
            >
              <div className="rounded-xl bg-background p-2.5">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground truncate">{client.email}</p>
              </div>
              {copied === 'email' ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <button 
              onClick={() => copyToClipboard(client.password, 'password')}
              className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-left transition-colors hover:bg-secondary/70"
            >
              <div className="rounded-xl bg-background p-2.5">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Password</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {showPassword ? client.password : '••••••••'}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPassword(!showPassword)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {copied === 'password' ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-5">
              <div className="rounded-xl bg-background p-2.5">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Cliente desde</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {dayjs(client.createdAt).format('D [de] MMMM, YYYY')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Cuota Mensual</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(client.monthlyFee)}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-success">
              {formatCurrency(client.totalPaid)}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Pagos</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
              {client.payments.length}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Ultimo Pago</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {client.lastPayment 
                ? dayjs(client.lastPayment).format('D MMM')
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment History by Month */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Historial de Pagos</h2>
          
          {client.payments.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(paymentsByMonth).map(([month, payments]) => (
                <div key={month}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold capitalize text-foreground">{month}</h3>
                    <span className="text-base font-semibold text-success">
                      +{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {payments.map((payment) => {
                      const Icon = methodIcons[payment.method]
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-secondary/50"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-foreground">
                              {payment.description}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {PAYMENT_METHODS[payment.method].label} · {dayjs(payment.date).format('D [de] MMMM, YYYY')}
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
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-base text-muted-foreground">No hay pagos registrados</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
