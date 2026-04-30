import { createClient, type Client } from '@libsql/client/http'

// Lazy singleton — created on first use, not at module import time
let _db: Client | null = null

export function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) {
      throw new Error('TURSO_DATABASE_URL environment variable is not set')
    }
    _db = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _db
}

// Keep backward-compatible `db` export as a proxy
export const db = new Proxy({} as Client, {
  get(_target, prop) {
    return (getDb() as any)[prop]
  },
})

// Singleton flag — avoid re-init on every serverless request
let dbInitialized = false

// Initialize database tables (only runs once per serverless instance)
export async function initializeDatabase() {
  if (dbInitialized) return
  dbInitialized = true
  await getDb().batch([
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
