import { NextResponse } from 'next/server'
import { db, generateId, initializeDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

const seedClients = [
  { name: 'FitMax Gym', category: 'gimnasio', website: 'https://fitmaxgym.com.ar', ownerName: 'Carlos Garcia', phone: '+54 11 4567-8901', email: 'admin@fitmaxgym.com.ar', password: 'fitmax2024', monthlyFee: 45000, status: 'active' },
  { name: 'PowerHouse Fitness', category: 'gimnasio', website: 'https://powerhouse.com.ar', ownerName: 'Maria Lopez', phone: '+54 11 5678-9012', email: 'contact@powerhouse.com.ar', password: 'power123', monthlyFee: 55000, status: 'active' },
  { name: 'Iron Temple', category: 'gimnasio', website: 'https://irontemple.com.ar', ownerName: 'Antonio Ruiz', phone: '+54 11 6789-0123', email: 'admin@irontemple.com.ar', password: 'iron2024', monthlyFee: 45000, status: 'inactive' },
  { name: 'Pilates Studio Zen', category: 'pilates', website: 'https://pilateszen.com.ar', ownerName: 'Laura Fernandez', phone: '+54 11 7890-1234', email: 'info@pilateszen.com.ar', password: 'zen2024', monthlyFee: 38000, status: 'active' },
  { name: 'Core Balance Pilates', category: 'pilates', website: 'https://corebalance.com.ar', ownerName: 'Elena Martin', phone: '+54 11 8901-2345', email: 'elena@corebalance.com.ar', password: 'balance123', monthlyFee: 38000, status: 'active' },
  { name: 'Reformer Pilates BA', category: 'pilates', website: 'https://reformerba.com.ar', ownerName: 'Sofia Navarro', phone: '+54 11 9012-3456', email: 'sofia@reformerba.com.ar', password: 'reformer24', monthlyFee: 42000, status: 'active' },
  { name: 'Clinica Dental Sonrie', category: 'cymple', website: 'https://clinicasonrie.com.ar', ownerName: 'Pedro Sanchez', phone: '+54 11 0123-4567', email: 'info@clinicasonrie.com.ar', password: 'dental2024', monthlyFee: 32000, status: 'active' },
  { name: 'Peluqueria Style', category: 'cymple', website: 'https://stylehair.com.ar', ownerName: 'Ana Rodriguez', phone: '+54 11 1234-5678', email: 'ana@stylehair.com.ar', password: 'style123', monthlyFee: 25000, status: 'active' },
  { name: 'Centro Fisio Plus', category: 'cymple', website: 'https://fisioplus.com.ar', ownerName: 'Roberto Diaz', phone: '+54 11 2345-6789', email: 'roberto@fisioplus.com.ar', password: 'fisio2024', monthlyFee: 32000, status: 'inactive' },
]

export async function POST() {
  try {
    await initializeDatabase()
    
    // Check if data already exists
    const existingClients = await db.execute('SELECT COUNT(*) as count FROM clients')
    if ((existingClients.rows[0]?.count as number) > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }
    
    // Insert clients
    const clientIds: Record<string, string> = {}
    
    for (const client of seedClients) {
      const id = generateId()
      clientIds[client.name] = id
      
      await db.execute({
        sql: `INSERT INTO clients (id, name, category, website, owner_name, phone, email, password, monthly_fee, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, client.name, client.category, client.website, client.ownerName, client.phone, client.email, client.password, client.monthlyFee, client.status],
      })
    }
    
    // Insert payments
    const payments = [
      { clientName: 'FitMax Gym', amount: 45000, date: '2026-01-15', description: 'Enero 2026', method: 'transferencia' },
      { clientName: 'FitMax Gym', amount: 45000, date: '2026-02-15', description: 'Febrero 2026', method: 'transferencia' },
      { clientName: 'FitMax Gym', amount: 45000, date: '2026-03-15', description: 'Marzo 2026', method: 'transferencia' },
      { clientName: 'FitMax Gym', amount: 45000, date: '2026-04-10', description: 'Abril 2026', method: 'transferencia' },
      { clientName: 'PowerHouse Fitness', amount: 55000, date: '2026-01-20', description: 'Enero 2026', method: 'efectivo' },
      { clientName: 'PowerHouse Fitness', amount: 55000, date: '2026-02-20', description: 'Febrero 2026', method: 'efectivo' },
      { clientName: 'PowerHouse Fitness', amount: 55000, date: '2026-03-20', description: 'Marzo 2026', method: 'efectivo' },
      { clientName: 'PowerHouse Fitness', amount: 55000, date: '2026-04-18', description: 'Abril 2026', method: 'efectivo' },
      { clientName: 'Pilates Studio Zen', amount: 38000, date: '2026-01-05', description: 'Enero 2026', method: 'transferencia' },
      { clientName: 'Pilates Studio Zen', amount: 38000, date: '2026-02-05', description: 'Febrero 2026', method: 'transferencia' },
      { clientName: 'Pilates Studio Zen', amount: 38000, date: '2026-03-05', description: 'Marzo 2026', method: 'transferencia' },
      { clientName: 'Pilates Studio Zen', amount: 38000, date: '2026-04-05', description: 'Abril 2026', method: 'transferencia' },
      { clientName: 'Core Balance Pilates', amount: 38000, date: '2026-02-12', description: 'Febrero 2026', method: 'efectivo' },
      { clientName: 'Core Balance Pilates', amount: 38000, date: '2026-03-12', description: 'Marzo 2026', method: 'efectivo' },
      { clientName: 'Reformer Pilates BA', amount: 42000, date: '2026-01-18', description: 'Enero 2026', method: 'transferencia' },
      { clientName: 'Reformer Pilates BA', amount: 42000, date: '2026-02-18', description: 'Febrero 2026', method: 'transferencia' },
      { clientName: 'Reformer Pilates BA', amount: 42000, date: '2026-03-18', description: 'Marzo 2026', method: 'transferencia' },
      { clientName: 'Reformer Pilates BA', amount: 42000, date: '2026-04-20', description: 'Abril 2026', method: 'transferencia' },
      { clientName: 'Clinica Dental Sonrie', amount: 32000, date: '2026-01-22', description: 'Enero 2026', method: 'transferencia' },
      { clientName: 'Clinica Dental Sonrie', amount: 32000, date: '2026-02-22', description: 'Febrero 2026', method: 'transferencia' },
      { clientName: 'Clinica Dental Sonrie', amount: 32000, date: '2026-03-22', description: 'Marzo 2026', method: 'transferencia' },
      { clientName: 'Clinica Dental Sonrie', amount: 32000, date: '2026-04-22', description: 'Abril 2026', method: 'transferencia' },
      { clientName: 'Peluqueria Style', amount: 25000, date: '2026-02-15', description: 'Febrero 2026', method: 'efectivo' },
      { clientName: 'Peluqueria Style', amount: 25000, date: '2026-03-15', description: 'Marzo 2026', method: 'efectivo' },
      { clientName: 'Peluqueria Style', amount: 25000, date: '2026-04-15', description: 'Abril 2026', method: 'efectivo' },
    ]
    
    for (const payment of payments) {
      const clientId = clientIds[payment.clientName]
      if (clientId) {
        await db.execute({
          sql: `INSERT INTO payments (id, client_id, amount, date, description, method)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [generateId(), clientId, payment.amount, payment.date, payment.description, payment.method],
        })
      }
    }
    
    return NextResponse.json({ message: 'Database seeded successfully', clientCount: seedClients.length, paymentCount: payments.length })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
