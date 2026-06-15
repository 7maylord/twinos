'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', profit: 400, loss: 240 },
  { month: 'Feb', profit: 300, loss: 221 },
  { month: 'Mar', profit: 200, loss: 229 },
  { month: 'Apr', profit: 278, loss: 200 },
  { month: 'May', profit: 189, loss: 250 },
  { month: 'Jun', profit: 239, loss: 210 },
  { month: 'Jul', profit: 349, loss: 290 },
]

export default function ProfitChart() {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 backdrop-blur-md animate-fade-up" style={{ animationDelay: '0.1s' }}>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Profit Analysis</h2>
        <p className="text-sm text-muted">Profit vs Cost breakdown</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8}/>
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
          <Bar dataKey="profit" fill="url(#colorProfit)" radius={[8, 8, 0, 0]} isAnimationActive={true} />
          <Bar dataKey="loss" fill="url(#colorLoss)" radius={[8, 8, 0, 0]} isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-6 mt-6 pt-6 border-t border-card-border">
        <div>
          <p className="text-xs text-muted mb-1">Total Profit</p>
          <p className="text-lg font-bold text-green-500">$1.9M</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-1">Total Costs</p>
          <p className="text-lg font-bold text-red-500">$1.6M</p>
        </div>
      </div>
    </div>
  )
}
