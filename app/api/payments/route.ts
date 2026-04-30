import { NextResponse } from 'next/server'
import { db, generateId, initializeDatabase } from '@/lib/db'
import type { PaymentMethod, SaaSCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initializeDatabase()
    
    const result = await db.execute(`
      SELECT 
        p.*,
        c.name as client_name,
        c.category as client_category
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.date DESC
    `)
    
    const payments = result.rows.map(row => ({
      id: row.id as string,
      clientId: row.client_id as string,
      clientName: row.client_name as string,
      category: row.client_category as SaaSCategory,
      amount: Number(row.amount),
      date: row.date as string,
      description: row.description as string,
      method: row.method as PaymentMethod,
    }))
    
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initializeDatabase()
    
    const body = await request.json()

    // Validate required fields
    const required = ['clientId', 'amount', 'date', 'description', 'method']
    for (const field of required) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const validMethods = ['transferencia', 'efectivo']
    if (!validMethods.includes(body.method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    const id = generateId()
    
    await db.execute({
      sql: `INSERT INTO payments (id, client_id, amount, date, description, method)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.clientId,
        Number(body.amount),
        body.date,
        body.description,
        body.method,
      ],
    })
    
    return NextResponse.json({ id, ...body }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
