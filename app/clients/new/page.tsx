'use client'

import { Header } from '@/components/layout/header'
import { SAAS_CATEGORIES, type SaaSCategory } from '@/lib/types'
import { ArrowLeft, Dumbbell, Activity, Calendar, Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const categoryIcons: Record<SaaSCategory, React.ElementType> = {
  gimnasio: Dumbbell,
  pilates: Activity,
  cymple: Calendar,
}

export default function NewClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'gimnasio' as SaaSCategory,
    website: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    monthlyFee: 45000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Replace with actual API call to PostgreSQL
    console.log('Creating client:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.push('/clients')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/clients"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>

        {/* Form Card */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Nuevo Cliente</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Agrega la informacion del nuevo cliente
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Tipo de SaaS
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(SAAS_CATEGORIES) as SaaSCategory[]).map((cat) => {
                  const Icon = categoryIcons[cat]
                  const info = SAAS_CATEGORIES[cat]
                  const isSelected = formData.category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        'relative flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all',
                        isSelected
                          ? cn('border-2', info.bgColor)
                          : 'border-border/60 bg-secondary/30 hover:bg-secondary/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3">
                          <Check className={cn('h-4 w-4', info.color)} />
                        </div>
                      )}
                      <div className={cn(
                        'rounded-xl p-3',
                        isSelected ? info.bgColor : 'bg-secondary'
                      )}>
                        <Icon className={cn(
                          'h-6 w-6',
                          isSelected ? info.color : 'text-muted-foreground'
                        )} />
                      </div>
                      <span className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {info.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                Nombre del negocio
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                placeholder="Ej: FitMax Gym"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-foreground">
                Website
              </label>
              <input
                type="url"
                id="website"
                required
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                placeholder="https://ejemplo.com.ar"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ownerName" className="block text-sm font-semibold text-foreground">
                  Nombre del dueno
                </label>
                <input
                  type="text"
                  id="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="Carlos Garcia"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
                  Telefono
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="+54 11 4567-8901"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                Email de acceso
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                placeholder="admin@ejemplo.com.ar"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                Password de acceso
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-2xl border border-border/60 bg-secondary/50 px-4 py-3.5 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                  placeholder="Password del cliente"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="monthlyFee" className="block text-sm font-semibold text-foreground">
                Cuota mensual
              </label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  id="monthlyFee"
                  required
                  min={0}
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-2xl border border-border/60 bg-secondary/50 pl-8 pr-16 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                  ARS
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                href="/clients"
                className="rounded-2xl px-5 py-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Cliente'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
