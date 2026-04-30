import { NextResponse } from 'next/server'
import { db, generateId, initializeDatabase } from '@/lib/db'
import type { SaaSCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initializeDatabase()
    
    const result = await db.execute(`
      SELECT 
        c.*,
        COALESCE(SUM(p.amount), 0) as total_paid,
        MAX(p.date) as last_payment
      FROM clients c
      LEFT JOIN payments p ON c.id = p.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)
    
    const clients = result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      category: row.category as SaaSCategory,
      website: row.website as string,
      ownerName: row.owner_name as string,
      phone: row.phone as string,
      email: row.email as string,
      password: row.password as string,
      monthlyFee: row.monthly_fee as number,
      status: row.status as 'active' | 'inactive',
      createdAt: row.created_at as string,
      totalPaid: row.total_paid as number,
      lastPayment: row.last_payment as string | null,
    }))
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase()
    
    const body = await request.json()

    // Validate required fields
    const required = ['name', 'category', 'website', 'ownerName', 'phone', 'email', 'password', 'monthlyFee']
    for (const field of required) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const validCategories = ['gimnasio', 'pilates', 'cymple']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const id = generateId()
    
    await db.execute({
      sql: `INSERT INTO clients (id, name, category, website, owner_name, phone, email, password, monthly_fee, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.name,
        body.category,
        body.website,
        body.ownerName,
        body.phone,
        body.email,
        body.password,
        Number(body.monthlyFee),
        body.status || 'active',
      ],
    })
    
    return NextResponse.json({ id, ...body }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
