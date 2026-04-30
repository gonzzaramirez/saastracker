import { NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/db'
import type { SaaSCategory, PaymentMethod } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const { id } = await params
    
    const clientResult = await db.execute({
      sql: 'SELECT * FROM clients WHERE id = ?',
      args: [id],
    })
    
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    const row = clientResult.rows[0]
    
    const paymentsResult = await db.execute({
      sql: 'SELECT * FROM payments WHERE client_id = ? ORDER BY date DESC',
      args: [id],
    })
    
    const payments = paymentsResult.rows.map(p => ({
      id: p.id as string,
      clientId: p.client_id as string,
      amount: p.amount as number,
      date: p.date as string,
      description: p.description as string,
      method: p.method as PaymentMethod,
    }))
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    
    const client = {
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
      payments,
      totalPaid,
      lastPayment: payments[0]?.date || null,
    }
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const { id } = await params
    const body = await request.json()
    
    const updates: string[] = []
    const args: (string | number)[] = []
    
    if (body.name !== undefined) { updates.push('name = ?'); args.push(body.name) }
    if (body.category !== undefined) { updates.push('category = ?'); args.push(body.category) }
    if (body.website !== undefined) { updates.push('website = ?'); args.push(body.website) }
    if (body.ownerName !== undefined) { updates.push('owner_name = ?'); args.push(body.ownerName) }
    if (body.phone !== undefined) { updates.push('phone = ?'); args.push(body.phone) }
    if (body.email !== undefined) { updates.push('email = ?'); args.push(body.email) }
    if (body.password !== undefined) { updates.push('password = ?'); args.push(body.password) }
    if (body.monthlyFee !== undefined) { updates.push('monthly_fee = ?'); args.push(body.monthlyFee) }
    if (body.status !== undefined) { updates.push('status = ?'); args.push(body.status) }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }
    
    args.push(id)
    
    await db.execute({
      sql: `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const { id } = await params
    
    await db.execute({
      sql: 'DELETE FROM clients WHERE id = ?',
      args: [id],
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
