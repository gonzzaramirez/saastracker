'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { MonthlyRevenue } from '@/lib/types'

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">Ingresos Mensuales</h3>
        <p className="text-sm text-muted-foreground">Ultimos 6 meses</p>
      </div>
      
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.45 0 0)', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'oklch(0.45 0 0)', fontSize: 11 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              cursor={{ fill: 'oklch(0.96 0 0)', radius: 8 }}
              contentStyle={{
                backgroundColor: 'oklch(1 0 0)',
                border: '1px solid oklch(0.92 0 0)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'oklch(0.12 0 0)', fontWeight: 600, marginBottom: 6 }}
              formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
            />
            <Bar 
              dataKey="revenue" 
              fill="oklch(0.55 0.2 145)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
