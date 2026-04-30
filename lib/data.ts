'use server'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import type { Client, Payment, ClientWithPayments, PaymentStats, MonthlyRevenue, SaaSCategory, PaymentMethod } from './types'
import { db } from './db'

dayjs.locale('es')

// Mapper functions to convert DB snake_case to TS camelCase
function mapClient(row: any): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as SaaSCategory,
    website: row.website as string,
    ownerName: row.owner_name as string,
    phone: row.phone as string,
    email: row.email as string,
    password: row.password as string,
    createdAt: row.created_at as string,
    status: row.status as 'active' | 'inactive',
    monthlyFee: row.monthly_fee as number,
  }
}

function mapPayment(row: any): Payment {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    amount: row.amount as number,
    date: row.date as string,
    description: row.description as string,
    method: row.method as PaymentMethod,
  }
}

// Helper to check if client paid this month
function hasPaidThisMonth(payments: Payment[], clientId: string): boolean {
  const now = dayjs()
  return payments.some(p => {
    const paymentDate = dayjs(p.date)
    return p.clientId === clientId && 
           paymentDate.month() === now.month() && 
           paymentDate.year() === now.year()
  })
}

// Data Access Functions - PostgreSQL/Turso
export async function getClientsWithPayments(category?: SaaSCategory): Promise<ClientWithPayments[]> {
  let clientsQuery = 'SELECT * FROM clients'
  const args: any[] = []
  
  if (category) {
    clientsQuery += ' WHERE category = ?'
    args.push(category)
  }
  
  const clientsResult = await db.execute({ sql: clientsQuery, args })
  const clients = clientsResult.rows.map(mapClient)
  
  const paymentsResult = await db.execute('SELECT * FROM payments ORDER BY date DESC')
  const allPayments = paymentsResult.rows.map(mapPayment)
  
  return clients.map(client => {
    const clientPayments = allPayments.filter(p => p.clientId === client.id)
    const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0)
    
    return {
      ...client,
      payments: clientPayments,
      totalPaid,
      lastPayment: clientPayments[0]?.date || null,
      isPaidThisMonth: hasPaidThisMonth(clientPayments, client.id),
    }
  })
}

export async function getClientById(id: string): Promise<ClientWithPayments | null> {
  const clientResult = await db.execute({
    sql: 'SELECT * FROM clients WHERE id = ?',
    args: [id]
  })
  
  if (clientResult.rows.length === 0) return null
  
  const client = mapClient(clientResult.rows[0])
  
  const paymentsResult = await db.execute({
    sql: 'SELECT * FROM payments WHERE client_id = ? ORDER BY date DESC',
    args: [id]
  })
  
  const clientPayments = paymentsResult.rows.map(mapPayment)
  const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0)
  
  return {
    ...client,
    payments: clientPayments,
    totalPaid,
    lastPayment: clientPayments[0]?.date || null,
    isPaidThisMonth: hasPaidThisMonth(clientPayments, client.id),
  }
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const now = dayjs()
  const thisMonth = String(now.month() + 1).padStart(2, '0')
  const thisYear = String(now.year())
  
  const lastMonthDate = now.subtract(1, 'month')
  const lastMonth = String(lastMonthDate.month() + 1).padStart(2, '0')
  const lastMonthYear = String(lastMonthDate.year())

  const thisMonthPrefix = `${thisYear}-${thisMonth}-%`
  const lastMonthPrefix = `${lastMonthYear}-${lastMonth}-%`

  // Total this month
  const totalThisMonthResult = await db.execute({
    sql: 'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE date LIKE ?',
    args: [thisMonthPrefix]
  })
  const totalThisMonth = totalThisMonthResult.rows[0].total as number

  // Total last month
  const totalLastMonthResult = await db.execute({
    sql: 'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE date LIKE ?',
    args: [lastMonthPrefix]
  })
  const totalLastMonth = totalLastMonthResult.rows[0].total as number

  // Total all time
  const totalAllTimeResult = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments')
  const totalAllTime = totalAllTimeResult.rows[0].total as number
  
  // Months active
  const monthsActiveResult = await db.execute('SELECT COUNT(DISTINCT substr(date, 1, 7)) as count FROM payments')
  const monthsActive = monthsActiveResult.rows[0].count as number
  
  const averageMonthly = monthsActive > 0 ? totalAllTime / monthsActive : 0
  const monthlyGrowth = totalLastMonth > 0 
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
    : 0

  // Client counts
  const clientCountResult = await db.execute('SELECT COUNT(*) as count FROM clients')
  const clientCount = clientCountResult.rows[0].count as number

  const activeClientsResult = await db.execute({
    sql: 'SELECT * FROM clients WHERE status = ?', 
    args: ['active']
  })
  const activeClients = activeClientsResult.rows.map(mapClient)

  // Paid this month
  const paymentsThisMonthResult = await db.execute({
    sql: 'SELECT DISTINCT client_id FROM payments WHERE date LIKE ?',
    args: [thisMonthPrefix]
  })
  const paidClientIds = new Set(paymentsThisMonthResult.rows.map(r => r.client_id as string))
  
  const paidThisMonth = activeClients.filter(c => paidClientIds.has(c.id)).length
  const pendingThisMonth = activeClients.length - paidThisMonth

  return {
    totalThisMonth,
    totalLastMonth,
    totalAllTime,
    averageMonthly,
    clientCount,
    activeClients: activeClients.length,
    monthlyGrowth,
    paidThisMonth,
    pendingThisMonth,
  }
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const result = await db.execute(`
    SELECT substr(date, 1, 7) as month, SUM(amount) as revenue 
    FROM payments 
    GROUP BY substr(date, 1, 7)
    ORDER BY month ASC
  `)

  // Ensure we have last 6 months even if missing
  const last6Months = []
  let current = dayjs().subtract(5, 'month').startOf('month')
  for (let i = 0; i < 6; i++) {
    const key = `${current.year()}-${String(current.month() + 1).padStart(2, '0')}`
    last6Months.push(key)
    current = current.add(1, 'month')
  }

  const dbMonths: Record<string, number> = {}
  result.rows.forEach(r => {
    dbMonths[r.month as string] = r.revenue as number
  })

  return last6Months.map(month => ({
    month: formatMonthLabel(month),
    revenue: dbMonths[month] || 0,
  }))
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`
}

export async function getAllPayments(): Promise<(Payment & { clientName: string; category: SaaSCategory })[]> {
  const result = await db.execute(`
    SELECT p.*, c.name as clientName, c.category as clientCategory 
    FROM payments p
    JOIN clients c ON p.client_id = c.id
    ORDER BY p.date DESC
  `)

  return result.rows.map(row => {
    const payment = mapPayment(row)
    return {
      ...payment,
      clientName: row.clientName as string,
      category: row.clientCategory as SaaSCategory,
    }
  })
}

export async function getRecentPayments(limit = 5): Promise<(Payment & { clientName: string; category: SaaSCategory })[]> {
  const result = await db.execute({
    sql: `
      SELECT p.*, c.name as clientName, c.category as clientCategory 
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.date DESC
      LIMIT ?
    `,
    args: [limit]
  })

  return result.rows.map(row => {
    const payment = mapPayment(row)
    return {
      ...payment,
      clientName: row.clientName as string,
      category: row.clientCategory as SaaSCategory,
    }
  })
}

export async function getStatsByCategory(): Promise<Record<SaaSCategory, { clients: number; revenue: number }>> {
  const stats: Record<SaaSCategory, { clients: number; revenue: number }> = {
    gimnasio: { clients: 0, revenue: 0 },
    pilates: { clients: 0, revenue: 0 },
    cymple: { clients: 0, revenue: 0 },
  }
  
  // Clients count
  const clientsResult = await db.execute("SELECT category, COUNT(*) as count FROM clients WHERE status = 'active' GROUP BY category")
  clientsResult.rows.forEach(r => {
    const cat = r.category as SaaSCategory
    if (stats[cat]) {
      stats[cat].clients = r.count as number
    }
  })
  
  // Revenue this month
  const now = dayjs()
  const thisMonthPrefix = `${now.year()}-${String(now.month() + 1).padStart(2, '0')}-%`
  
  const revenueResult = await db.execute({
    sql: `
      SELECT c.category, SUM(p.amount) as revenue 
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      WHERE p.date LIKE ?
      GROUP BY c.category
    `,
    args: [thisMonthPrefix]
  })

  revenueResult.rows.forEach(r => {
    const cat = r.category as SaaSCategory
    if (stats[cat]) {
      stats[cat].revenue = r.revenue as number
    }
  })
  
  return stats
}
