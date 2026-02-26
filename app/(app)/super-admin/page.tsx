'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  FolderOpen,
  Mail,
  BarChart3,
  MessageSquare,
  Phone,
  Zap,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DashboardData {
  totalUsers: number
  activeSubscriptions: number
  totalProjects: number
  totalCampaigns: number
  totalLeads: number
  emailUsage: number
  smsUsage: number
  voiceUsage: number
  leadsUsage: number
  recentActivity: Array<{
    id: string
    name: string | null
    email: string
    currentPlan: string
    subscriptionStatus: string
    createdAt: string
  }>
}

const planColors: Record<string, string> = {
  TRIAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  STARTER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROFESSIONAL: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ENTERPRISE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const statusColors: Record<string, string> = {
  TRIAL: 'bg-amber-500/10 text-amber-400',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400',
  PAST_DUE: 'bg-red-500/10 text-red-400',
  CANCELED: 'bg-white/5 text-muted-foreground',
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    recentActivity: [],
    totalProjects: 0,
    totalCampaigns: 0,
    totalLeads: 0,
    emailUsage: 0,
    smsUsage: 0,
    voiceUsage: 0,
    leadsUsage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    setError(null)
    fetch('/api/super-admin/dashboard-stats')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-5 fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-2">
              <div className="h-6 w-20 rounded shimmer" />
              <div className="h-4 w-32 rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 glass-card text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Error loading dashboard</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        <Button size="sm" onClick={fetchData} className="aurora-gradient text-white gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    )
  }

  const kpis = [
    { label: 'Total Users', value: data.totalUsers, sub: `${data.activeSubscriptions} active subs`, icon: Users, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'Projects', value: data.totalProjects, sub: `${data.totalCampaigns} campaigns`, icon: FolderOpen, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Total Leads', value: data.totalLeads.toLocaleString(), sub: 'across all users', icon: TrendingUp, color: 'text-rose-400 bg-rose-500/10' },
    { label: 'Revenue (MRR)', value: `$${(data.activeSubscriptions * 99).toLocaleString()}`, sub: 'estimated', icon: BarChart3, color: 'text-emerald-400 bg-emerald-500/10' },
  ]

  const usage = [
    { label: 'Emails Sent', value: data.emailUsage, icon: Mail, color: 'bg-blue-500' },
    { label: 'SMS Sent', value: data.smsUsage, icon: MessageSquare, color: 'bg-emerald-500' },
    { label: 'Voice Calls', value: data.voiceUsage, icon: Phone, color: 'bg-amber-500' },
    { label: 'Leads Generated', value: data.leadsUsage, icon: Zap, color: 'bg-violet-500' },
  ]

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor all users, usage, and revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            System Online
          </div>
          <Button size="sm" variant="outline" onClick={fetchData} className="border-white/10 text-xs gap-1.5">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="glass-card stat-card-hover p-4">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl mb-3', kpi.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Platform usage */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Platform Usage (All Users)</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {usage.map((u) => {
            const Icon = u.icon
            return (
              <div key={u.label} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', u.color + '/10')}>
                  <Icon className={cn('h-4 w-4', u.color.replace('bg-', 'text-'))} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{u.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{u.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent users */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Users</h3>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white">
                    {(user.name || user.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', planColors[user.currentPlan] || planColors.TRIAL)}>
                    {user.currentPlan}
                  </span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusColors[user.subscriptionStatus] || statusColors.TRIAL)}>
                    {user.subscriptionStatus}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
