'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { ClientWithPayments } from '@/lib/types'
import { SAAS_CATEGORIES } from '@/lib/types'
import { formatCurrency } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Phone, Mail, Globe, CheckCircle2, AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

dayjs.locale('es')

interface ClientCardProps {
  client: ClientWithPayments
}

export function ClientCard({ client }: ClientCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const categoryInfo = SAAS_CATEGORIES[client.category]
  
  const handleCopyPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(client.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPassword(!showPassword)
  }
  
  return (
    <Link
      href={`/clients/${client.id}`}
      className={cn(
        'group block rounded-3xl bg-card p-6 transition-all duration-300',
        'border border-border/60 shadow-sm',
        'hover:shadow-lg hover:shadow-black/5 hover:border-border',
        'active:scale-[0.98]'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold',
            categoryInfo.bgColor,
            categoryInfo.color
          )}>
            {client.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-accent transition-colors">
              {client.name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                categoryInfo.bgColor,
                categoryInfo.color
              )}>
                {categoryInfo.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {client.ownerName}
              </span>
            </div>
          </div>
        </div>
        
        {/* Payment Status Badge */}
        <div className="shrink-0">
          {client.isPaidThisMonth ? (
            <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">Pagado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-warning">Pendiente</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>

      {/* Password Section */}
      <div 
        className="mt-4 flex items-center gap-3 rounded-2xl bg-secondary/50 px-4 py-3"
        onClick={(e) => e.preventDefault()}
      >
        <span className="text-xs font-medium text-muted-foreground">Password:</span>
        <span className="flex-1 text-sm font-mono text-foreground">
          {showPassword ? client.password : '••••••••'}
        </span>
        <button
          onClick={togglePassword}
          className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={handleCopyPassword}
          className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Footer Stats */}
      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total pagado</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-success">
            {formatCurrency(client.totalPaid)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">Cuota mensual</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {formatCurrency(client.monthlyFee)}
          </p>
        </div>
      </div>
    </Link>
  )
}
