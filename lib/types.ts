// Domain Types - Following SOLID principles with clear interfaces

export type SaaSCategory = 'gimnasio' | 'pilates' | 'cymple'

export const SAAS_CATEGORIES: Record<SaaSCategory, { label: string; color: string; bgColor: string }> = {
  gimnasio: { 
    label: 'Gimnasio', 
    color: 'text-gimnasio',
    bgColor: 'bg-gimnasio/10'
  },
  pilates: { 
    label: 'Pilates', 
    color: 'text-pilates',
    bgColor: 'bg-pilates/10'
  },
  cymple: { 
    label: 'Cymple', 
    color: 'text-cymple',
    bgColor: 'bg-cymple/10'
  },
}

export type PaymentMethod = 'transferencia' | 'efectivo'

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string }> = {
  transferencia: { label: 'Transferencia', icon: 'building-2' },
  efectivo: { label: 'Efectivo', icon: 'banknote' },
}

export interface Client {
  id: string
  name: string
  category: SaaSCategory
  website: string
  ownerName: string
  phone: string
  email: string
  password: string
  createdAt: string
  status: 'active' | 'inactive'
  monthlyFee: number
}

export interface Payment {
  id: string
  clientId: string
  amount: number
  date: string
  description: string
  method: PaymentMethod
}

export interface ClientWithPayments extends Client {
  payments: Payment[]
  totalPaid: number
  lastPayment: string | null
  isPaidThisMonth: boolean
}

// Statistics Types
export interface PaymentStats {
  totalThisMonth: number
  totalLastMonth: number
  totalAllTime: number
  averageMonthly: number
  clientCount: number
  activeClients: number
  monthlyGrowth: number
  paidThisMonth: number
  pendingThisMonth: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

// Repository Interface - Dependency Inversion Principle
export interface IClientRepository {
  getAll(): Promise<Client[]>
  getById(id: string): Promise<Client | null>
  create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client>
  update(id: string, client: Partial<Client>): Promise<Client>
  delete(id: string): Promise<void>
}

export interface IPaymentRepository {
  getAll(): Promise<Payment[]>
  getByClientId(clientId: string): Promise<Payment[]>
  create(payment: Omit<Payment, 'id'>): Promise<Payment>
  delete(id: string): Promise<void>
}
