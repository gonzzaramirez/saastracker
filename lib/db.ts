import { createClient } from '@libsql/client'

// Turso Database Client
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Initialize database tables
export async function initializeDatabase() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('gimnasio', 'pilates', 'cymple')),
      website TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      monthly_fee INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      method TEXT NOT NULL CHECK(method IN ('transferencia', 'efectivo')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date)`,
    `CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category)`,
  ])
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID()
}
