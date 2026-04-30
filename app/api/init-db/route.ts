import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ message: 'Database initialized successfully. Tables created.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
