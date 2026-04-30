-- ClientHub Database Schema for PostgreSQL
-- Run this script to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SaaS Category enum
CREATE TYPE saas_category AS ENUM ('gimnasio', 'pilates', 'cymple');

-- Client status enum
CREATE TYPE client_status AS ENUM ('active', 'inactive');

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('transfer', 'card', 'cash', 'paypal');

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category saas_category NOT NULL DEFAULT 'gimnasio',
  website VARCHAR(500) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 99.00,
  status client_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(500) NOT NULL,
  method payment_method NOT NULL DEFAULT 'transfer',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);

-- Composite index for monthly reports
CREATE INDEX IF NOT EXISTS idx_payments_date_client ON payments(date, client_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for clients with payment status
CREATE OR REPLACE VIEW clients_with_payment_status AS
SELECT 
  c.*,
  COALESCE(SUM(p.amount), 0) as total_paid,
  COUNT(p.id) as total_payments,
  MAX(p.date) as last_payment_date,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM payments p2 
      WHERE p2.client_id = c.id 
      AND EXTRACT(MONTH FROM p2.date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM p2.date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ) THEN true
    ELSE false
  END as is_paid_this_month
FROM clients c
LEFT JOIN payments p ON c.id = p.client_id
GROUP BY c.id;

-- Monthly revenue view
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT 
  DATE_TRUNC('month', date) as month,
  SUM(amount) as revenue,
  COUNT(*) as payment_count
FROM payments
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;

-- Revenue by category view
CREATE OR REPLACE VIEW revenue_by_category AS
SELECT 
  c.category,
  EXTRACT(MONTH FROM p.date) as month,
  EXTRACT(YEAR FROM p.date) as year,
  SUM(p.amount) as revenue,
  COUNT(DISTINCT c.id) as client_count
FROM payments p
JOIN clients c ON p.client_id = c.id
GROUP BY c.category, EXTRACT(MONTH FROM p.date), EXTRACT(YEAR FROM p.date)
ORDER BY year DESC, month DESC, c.category;
