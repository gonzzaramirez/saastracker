'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Header } from '@/components/layout/header'
import { SAAS_CATEGORIES, PAYMENT_METHODS, type PaymentMethod, type ClientWithPayments } from '@/lib/types'
import { ArrowLeft, Banknote, Building2, Check } from 'lucide-react'
import Link from 'next/link'
import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'

dayjs.locale('es')

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'transferencia', label: 'Transferencia', icon: Building2 },
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
]

function NewPaymentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get('client')
  
  const [clients, setClients] = useState<ClientWithPayments[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: preselectedClient || '',
    amount: '',
    description: '',
    method: 'transferencia' as PaymentMethod,
    date: dayjs().format('YYYY-MM-DD'),
  })

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(setClients)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          amount: parseInt(formData.amount) || 0,
          description: formData.description,
          method: formData.method,
          date: formData.date,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create payment')
      }
      router.push('/payments')
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
  }

  const selectedClient = clients.find(c => c.id === formData.clientId)
  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      const monthName = dayjs().format('MMMM YYYY')
      setFormData({
        ...formData,
        clientId,
        amount: client.monthlyFee.toString(),
        description: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
      })
    } else {
      setFormData({
        ...formData,
        clientId,
        amount: '',
        description: '',
      })
    }
  }

  // Group clients by category
  const clientsByCategory = clients
    .filter(c => c.status === 'active')
    .reduce((acc, client) => {
      if (!acc[client.category]) acc[client.category] = []
      acc[client.category].push(client)
      return acc
    }, {} as Record<string, typeof clients>)

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Client Selection */}
      <div>
        <label htmlFor="clientId" className="block text-sm font-semibold text-foreground">
          Cliente
        </label>
        <select
          id="clientId"
          required
          value={formData.clientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground focus:border-foreground focus:outline-none transition-colors appearance-none"
        >
          <option value="">Selecciona un cliente</option>
          {Object.entries(clientsByCategory).map(([category, clients]) => (
            <optgroup key={category} label={SAAS_CATEGORIES[category as keyof typeof SAAS_CATEGORIES].label}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {formatCurrency(client.monthlyFee)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-semibold text-foreground">
          Cantidad
        </label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
            $
          </span>
          <input
            type="number"
            id="amount"
            required
            min="0"
            step="1"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full rounded-2xl border border-border/60 bg-secondary/50 pl-8 pr-16 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            placeholder="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
            ARS
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-foreground">
          Descripcion
        </label>
        <input
          type="text"
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
          placeholder="Ej: Abril 2026"
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Metodo de pago
        </label>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            const isSelected = formData.method === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData({ ...formData, method: method.id })}
                className={cn(
                  'relative flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all',
                  isSelected
                    ? 'border-2 border-foreground bg-secondary/50'
                    : 'border-border/60 bg-secondary/30 hover:bg-secondary/50'
                )}
              >
                {isSelected && (
                  <div className="absolute right-3 top-3">
                    <Check className="h-4 w-4 text-foreground" />
                  </div>
                )}
                <div className={cn(
                  'rounded-xl p-3',
                  isSelected ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={cn(
                  'text-base font-medium',
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {method.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-foreground">
          Fecha
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground focus:border-foreground focus:outline-none transition-colors"
        />
      </div>

      {/* Preview */}
      {formData.clientId && formData.amount && (
        <div className="rounded-2xl bg-secondary/50 p-5">
          <p className="text-sm font-semibold text-muted-foreground">
            Resumen
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-base font-medium text-foreground">{selectedClient?.name}</span>
              {selectedClient && (
                <span className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-medium',
                  SAAS_CATEGORIES[selectedClient.category].bgColor,
                  SAAS_CATEGORIES[selectedClient.category].color
                )}>
                  {SAAS_CATEGORIES[selectedClient.category].label}
                </span>
              )}
            </div>
            <span className="text-xl font-semibold tabular-nums text-success">
              +{formatCurrency(parseFloat(formData.amount || '0'))}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-4">
        <Link
          href="/payments"
          className="rounded-2xl px-5 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  )
}

export default function NewPaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/payments"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pagos
        </Link>

        {/* Form Card */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Nuevo Pago</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Registra un nuevo pago de cliente
          </p>

          <Suspense fallback={<div className="mt-8 animate-pulse h-96 bg-secondary/20 rounded-2xl" />}>
            <NewPaymentForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
