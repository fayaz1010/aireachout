'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Mail,
  Users,
  Phone,
  MessageSquare,
  MousePointerClick,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

const emailData = [
  { month: 'Aug', sent: 1200, opened: 540, clicked: 210 },
  { month: 'Sep', sent: 1800, opened: 720, clicked: 290 },
  { month: 'Oct', sent: 2100, opened: 980, clicked: 380 },
  { month: 'Nov', sent: 1950, opened: 860, clicked: 340 },
  { month: 'Dec', sent: 2400, opened: 1100, clicked: 450 },
  { month: 'Jan', sent: 2800, opened: 1320, clicked: 540 },
]

const leadData = [
  { week: 'W1', generated: 45, converted: 8 },
  { week: 'W2', generated: 62, converted: 14 },
  { week: 'W3', generated: 38, converted: 6 },
  { week: 'W4', generated: 71, converted: 18 },
  { week: 'W5', generated: 85, converted: 22 },
  { week: 'W6', generated: 94, converted: 27 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card-bright px-3 py-2.5 text-xs shadow-glass">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  change: string
  positive?: boolean
  color: string
}) {
  return (
    <div className="glass-card stat-card-hover p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            positive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('6M')

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance insights across all your outreach channels
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
          {['7D', '1M', '3M', '6M'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                period === p
                  ? 'aurora-gradient text-white shadow-aurora-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={Mail}
          label="Emails Sent"
          value="12,340"
          change="45%"
          positive
          color="bg-blue-500/10 text-blue-400"
        />
        <KpiCard
          icon={Eye}
          label="Open Rate"
          value="47.2%"
          change="8%"
          positive
          color="bg-violet-500/10 text-violet-400"
        />
        <KpiCard
          icon={MousePointerClick}
          label="Click Rate"
          value="18.4%"
          change="3%"
          positive
          color="bg-rose-500/10 text-rose-400"
        />
        <KpiCard
          icon={Users}
          label="Leads Generated"
          value="395"
          change="12%"
          positive
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Email performance */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Email Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Sent, opened, and clicked over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={emailData}>
              <defs>
                <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sent" stroke="#7C3AED" strokeWidth={2} fill="url(#sent)" name="Sent" />
              <Area type="monotone" dataKey="opened" stroke="#EC4899" strokeWidth={2} fill="url(#opened)" name="Opened" />
              <Area type="monotone" dataKey="clicked" stroke="#10B981" strokeWidth={2} fill="url(#clicked)" name="Clicked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead generation */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">Lead Generation</h3>
          <p className="text-xs text-muted-foreground mb-4">Generated vs converted weekly</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="generated" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Generated" />
              <Bar dataKey="converted" fill="#10B981" radius={[4, 4, 0, 0]} name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel breakdown */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Channel Performance Breakdown</h3>
        <div className="space-y-3">
          {[
            { channel: 'Email', icon: Mail, color: '#7C3AED', sent: 8240, rate: 47, pct: 82 },
            { channel: 'SMS', icon: MessageSquare, color: '#10B981', sent: 2100, rate: 68, pct: 55 },
            { channel: 'Voice Call', icon: Phone, color: '#F59E0B', sent: 540, rate: 34, pct: 25 },
          ].map((ch) => {
            const Icon = ch.icon
            return (
              <div key={ch.channel} className="flex items-center gap-4">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${ch.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: ch.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{ch.channel}</span>
                    <span className="text-xs text-muted-foreground">{ch.sent.toLocaleString()} sent · {ch.rate}% response</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ch.pct}%`, background: ch.color }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
