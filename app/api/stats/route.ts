import { NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import dayjs from 'dayjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initializeDatabase()
    
    const now = dayjs()
    const thisMonth = now.format('YYYY-MM')
    const lastMonth = now.subtract(1, 'month').format('YYYY-MM')
    
    // Total this month
    const thisMonthResult = await db.execute({
      sql: `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE strftime('%Y-%m', date) = ?`,
      args: [thisMonth],
    })
    const totalThisMonth = Number(thisMonthResult.rows[0]?.total || 0)
    
    // Total last month
    const lastMonthResult = await db.execute({
      sql: `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE strftime('%Y-%m', date) = ?`,
      args: [lastMonth],
    })
    const totalLastMonth = Number(lastMonthResult.rows[0]?.total || 0)
    
    // Total all time
    const allTimeResult = await db.execute('SELECT COALESCE(SUM(amount), 0) as total FROM payments')
    const totalAllTime = Number(allTimeResult.rows[0]?.total || 0)
    
    // Client counts
    const clientCountResult = await db.execute('SELECT COUNT(*) as count FROM clients')
    const clientCount = Number(clientCountResult.rows[0]?.count || 0)
    
    const activeClientsResult = await db.execute(`SELECT COUNT(*) as count FROM clients WHERE status = 'active'`)
    const activeClients = Number(activeClientsResult.rows[0]?.count || 0)
    
    // Paid this month
    const paidThisMonthResult = await db.execute({
      sql: `SELECT COUNT(DISTINCT client_id) as count FROM payments WHERE strftime('%Y-%m', date) = ?`,
      args: [thisMonth],
    })
    const paidThisMonth = Number(paidThisMonthResult.rows[0]?.count || 0)
    const pendingThisMonth = activeClients - paidThisMonth
    
    // Monthly revenue for chart
    const monthlyRevenueResult = await db.execute(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as revenue
      FROM payments
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
      LIMIT 6
    `)
    
    const monthlyRevenue = monthlyRevenueResult.rows
      .map(row => ({
        month: formatMonthLabel(row.month as string),
        revenue: Number(row.revenue),
      }))
      .reverse()
    
    // Stats by category
    const categoryStatsResult = await db.execute({
      sql: `
        SELECT 
          c.category,
          COUNT(DISTINCT c.id) as clients,
          COALESCE(SUM(CASE WHEN strftime('%Y-%m', p.date) = ? THEN p.amount ELSE 0 END), 0) as revenue
        FROM clients c
        LEFT JOIN payments p ON c.id = p.client_id
        WHERE c.status = 'active'
        GROUP BY c.category
      `,
      args: [thisMonth],
    })
    
    const statsByCategory = {
      gimnasio: { clients: 0, revenue: 0 },
      pilates: { clients: 0, revenue: 0 },
      cymple: { clients: 0, revenue: 0 },
    }
    
    categoryStatsResult.rows.forEach(row => {
      const cat = row.category as 'gimnasio' | 'pilates' | 'cymple'
      statsByCategory[cat] = {
        clients: Number(row.clients),
        revenue: Number(row.revenue),
      }
    })
    
    // Recent payments
    const recentPaymentsResult = await db.execute(`
      SELECT 
        p.*,
        c.name as client_name,
        c.category as client_category
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.date DESC
      LIMIT 5
    `)
    
    const recentPayments = recentPaymentsResult.rows.map(row => ({
      id: row.id as string,
      clientId: row.client_id as string,
      clientName: row.client_name as string,
      category: row.client_category as string,
      amount: Number(row.amount),
      date: row.date as string,
      description: row.description as string,
      method: row.method as string,
    }))
    
    // Calculate growth
    const monthlyGrowth = totalLastMonth > 0 
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 
      : 0
    
    // Average monthly
    const monthsResult = await db.execute(`SELECT COUNT(DISTINCT strftime('%Y-%m', date)) as count FROM payments`)
    const monthsActive = Number(monthsResult.rows[0]?.count || 1)
    const averageMonthly = totalAllTime / monthsActive
    
    return NextResponse.json({
      stats: {
        totalThisMonth,
        totalLastMonth,
        totalAllTime,
        averageMonthly,
        clientCount,
        activeClients,
        monthlyGrowth,
        paidThisMonth,
        pendingThisMonth,
      },
      monthlyRevenue,
      statsByCategory,
      recentPayments,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`
}
