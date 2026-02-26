'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Zap,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  mrr: number
  mrrGrowth: number
  arr: number
  totalUsers: number
  newUsersThisMonth: number
  churnedThisMonth: number
  churnRate: number
  activeUsers: number
  trialUsers: number
  conversionRate: number
  totalEmailsSent: number
  totalCallsMade: number
  totalLeadsGenerated: number
  planBreakdown: { plan: string; count: number; revenue: number }[]
  monthlySignups: { month: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}

function StatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  color = 'violet',
}: {
  label: string
  value: string
  sub?: string
  trend?: number
  icon: React.ComponentType<{ className?: string }>
  color?: 'violet' | 'rose' | 'emerald' | 'amber' | 'blue'
}) {
  const colorMap = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }
  const isPositive = trend !== undefined && trend >= 0
  return (
    <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', colorMap[color])}>
          <Icon className="h-4 w-4" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-aurora-text3 mt-1">{sub}</div>}
    </div>
  )
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL: 'bg-amber-500',
  STARTER: 'bg-blue-500',
  PROFESSIONAL: 'bg-violet-500',
  ENTERPRISE: 'bg-rose-500',
  CUSTOM: 'bg-emerald-500',
}

export default function SuperAdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/super-admin/analytics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const d = data || {
    mrr: 0, mrrGrowth: 0, arr: 0, totalUsers: 0, newUsersThisMonth: 0,
    churnedThisMonth: 0, churnRate: 0, activeUsers: 0, trialUsers: 0,
    conversionRate: 0, totalEmailsSent: 0, totalCallsMade: 0, totalLeadsGenerated: 0,
    planBreakdown: [], monthlySignups: [], revenueByMonth: [],
  }

  const totalPlanUsers = d.planBreakdown.reduce((s, p) => s + p.count, 0) || 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Platform Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time SaaS metrics and growth indicators</p>
      </div>

      {/* Revenue KPIs */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Revenue</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Recurring Revenue" value={`$${d.mrr.toLocaleString()}`} trend={d.mrrGrowth} icon={DollarSign} color="emerald" sub="vs last month" />
          <StatCard label="Annual Recurring Revenue" value={`$${d.arr.toLocaleString()}`} icon={TrendingUp} color="violet" sub="MRR × 12" />
          <StatCard label="Avg Revenue Per User" value={d.activeUsers > 0 ? `$${(d.mrr / d.activeUsers).toFixed(0)}` : '$0'} icon={BarChart3} color="blue" />
          <StatCard label="Churn Rate" value={`${d.churnRate.toFixed(1)}%`} trend={-d.churnRate} icon={TrendingDown} color="rose" sub={`${d.churnedThisMonth} churned this month`} />
        </div>
      </div>

      {/* User KPIs */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Users</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={d.totalUsers.toLocaleString()} icon={Users} color="violet" />
          <StatCard label="Active Paying" value={d.activeUsers.toLocaleString()} icon={UserCheck} color="emerald" />
          <StatCard label="In Trial" value={d.trialUsers.toLocaleString()} icon={Activity} color="amber" />
          <StatCard label="Trial→Paid Conversion" value={`${d.conversionRate.toFixed(1)}%`} icon={TrendingUp} color="blue" sub={`${d.newUsersThisMonth} new this month`} />
        </div>
      </div>

      {/* Usage KPIs */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Platform Usage</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Emails Sent" value={d.totalEmailsSent.toLocaleString()} icon={Mail} color="blue" />
          <StatCard label="Total Calls Made" value={d.totalCallsMade.toLocaleString()} icon={Phone} color="violet" />
          <StatCard label="Total Leads Generated" value={d.totalLeadsGenerated.toLocaleString()} icon={Zap} color="rose" />
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-foreground mb-4">Users by Plan</h3>
          <div className="space-y-3">
            {d.planBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              d.planBreakdown.map((p) => {
                const pct = Math.round((p.count / totalPlanUsers) * 100)
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{p.plan}</span>
                      <span className="text-xs text-muted-foreground">{p.count} users ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                      <div
                        className={cn('h-1.5 rounded-full', PLAN_COLORS[p.plan] || 'bg-violet-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Plan</h3>
          <div className="space-y-3">
            {d.planBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No billing data yet</p>
            ) : (
              d.planBreakdown.map((p) => {
                const totalRev = d.planBreakdown.reduce((s, x) => s + x.revenue, 0) || 1
                const pct = Math.round((p.revenue / totalRev) * 100)
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{p.plan}</span>
                      <span className="text-xs text-muted-foreground">${p.revenue.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                      <div
                        className={cn('h-1.5 rounded-full', PLAN_COLORS[p.plan] || 'bg-violet-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Monthly Signups */}
      {d.monthlySignups.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Signups (last 6 months)</h3>
          <div className="flex items-end gap-3 h-24">
            {d.monthlySignups.map((m) => {
              const max = Math.max(...d.monthlySignups.map((x) => x.count)) || 1
              const height = Math.max(8, (m.count / max) * 100)
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{m.count}</span>
                  <div
                    className="w-full rounded-t aurora-gradient opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
