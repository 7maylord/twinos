'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', revenue: 2400, target: 2200 },
  { month: 'Feb', revenue: 2210, target: 2290 },
  { month: 'Mar', revenue: 2290, target: 2000 },
  { month: 'Apr', revenue: 2000, target: 2181 },
  { month: 'May', revenue: 2181, target: 2500 },
  { month: 'Jun', revenue: 2500, target: 2100 },
  { month: 'Jul', revenue: 2400, target: 2300 },
]

export default function RevenueChart() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md animate-fade-up">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Revenue Trend</h2>
        <p className="text-sm text-muted">Last 7 months performance</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value) => `$${value}k`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-card-border">
        <div>
          <p className="text-xs text-muted mb-1">Actual Revenue</p>
          <p className="text-lg font-bold text-primary">$2.4M</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Target</p>
          <p className="text-lg font-bold text-accent">$2.3M</p>
        </div>
      </div>
    </div>
  )
}
