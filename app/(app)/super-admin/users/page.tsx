'use client'

import { useState, useEffect } from 'react'
import {
  Users, Search, UserPlus, Crown, Shield, Mail,
  Calendar, Activity, MoreHorizontal, ChevronDown,
  Trash2, Ban, CheckCircle, Edit2, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  currentPlan: string
  subscriptionStatus: string
  monthlyEmailsSent: number
  monthlyVoiceCallsMade: number
  monthlyLeadsGenerated: number
  emailLimit: number | null
  voiceCallLimit: number | null
  leadsLimit: number | null
  createdAt: string
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  STARTER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PROFESSIONAL: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ENTERPRISE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  CUSTOM: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const STATUS_COLORS: Record<string, string> = {
  TRIAL: 'bg-amber-500/10 text-amber-400',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400',
  PAST_DUE: 'bg-red-500/10 text-red-400',
  CANCELED: 'bg-white/5 text-muted-foreground',
  UNPAID: 'bg-red-500/10 text-red-400',
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-rose-500/10 text-rose-400',
  ADMIN: 'bg-violet-500/10 text-violet-400',
  USER: 'bg-white/5 text-muted-foreground',
}

function UsageMini({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const danger = pct > 85
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={cn('text-[10px] font-medium', danger ? 'text-red-400' : 'text-muted-foreground')}>
          {used.toLocaleString()}{limit ? `/${limit.toLocaleString()}` : ''}
        </span>
      </div>
      {limit && (
        <div className="h-1 w-full rounded-full bg-white/[0.05]">
          <div
            className={cn('h-1 rounded-full', danger ? 'bg-red-500' : 'bg-violet-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/super-admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (id: string, data: Record<string, any>, msg: string) => {
    try {
      const res = await fetch(`/api/super-admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setActionMsg(msg)
        fetchUsers()
        setTimeout(() => setActionMsg(null), 3000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.currentPlan === planFilter
    const matchStatus = statusFilter === 'all' || u.subscriptionStatus === statusFilter
    return matchSearch && matchPlan && matchStatus
  })

  const stats = {
    total: users.length,
    active: users.filter((u) => u.subscriptionStatus === 'ACTIVE').length,
    trial: users.filter((u) => u.subscriptionStatus === 'TRIAL').length,
    enterprise: users.filter((u) => u.currentPlan === 'ENTERPRISE').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} total users across all plans</p>
        </div>
        <Button size="sm" className="aurora-gradient text-white text-xs gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-violet-400' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'In Trial', value: stats.trial, icon: Activity, color: 'text-amber-400' },
          { label: 'Enterprise', value: stats.enterprise, icon: Crown, color: 'text-rose-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
          </div>
        ))}
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle className="h-4 w-4" /> {actionMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/10"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs text-foreground"
        >
          <option value="all">All Plans</option>
          <option value="TRIAL">Trial</option>
          <option value="STARTER">Starter</option>
          <option value="PROFESSIONAL">Professional</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs text-foreground"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="CANCELED">Canceled</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['User', 'Plan', 'Status', 'Usage', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full aurora-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.name || '(no name)'}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" /> {user.email}
                          </div>
                          {user.role !== 'USER' && (
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-flex items-center gap-1', ROLE_COLORS[user.role])}>
                              {user.role === 'SUPER_ADMIN' ? <Shield className="h-2.5 w-2.5" /> : <Crown className="h-2.5 w-2.5" />}
                              {user.role.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border', PLAN_COLORS[user.currentPlan] || 'bg-white/5 text-muted-foreground border-white/10')}>
                        {user.currentPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[user.subscriptionStatus] || 'bg-white/5 text-muted-foreground')}>
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="space-y-1.5">
                        <UsageMini used={user.monthlyEmailsSent} limit={user.emailLimit} label="Emails" />
                        <UsageMini used={user.monthlyLeadsGenerated} limit={user.leadsLimit} label="Leads" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-aurora-surface border-white/10 text-sm w-44">
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer"
                            onClick={() => updateUser(user.id, { currentPlan: 'ENTERPRISE', subscriptionStatus: 'ACTIVE' }, `${user.name || user.email} upgraded to Enterprise`)}
                          >
                            <Crown className="h-3.5 w-3.5 text-rose-400" /> Upgrade to Enterprise
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer"
                            onClick={() => updateUser(user.id, { currentPlan: 'TRIAL', subscriptionStatus: 'TRIAL' }, `${user.name || user.email} moved to Trial`)}
                          >
                            <Activity className="h-3.5 w-3.5 text-amber-400" /> Move to Trial
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer"
                            onClick={() => updateUser(user.id, { role: 'ADMIN' }, `${user.name || user.email} made Admin`)}
                          >
                            <Shield className="h-3.5 w-3.5 text-violet-400" /> Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer"
                            onClick={() => updateUser(user.id, { role: 'USER' }, `${user.name || user.email} set to User`)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Set as User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/[0.06]" />
                          <DropdownMenuItem
                            className="text-xs gap-2 cursor-pointer text-red-400 focus:text-red-400"
                            onClick={() => updateUser(user.id, { subscriptionStatus: 'CANCELED' }, `${user.name || user.email} subscription canceled`)}
                          >
                            <Ban className="h-3.5 w-3.5" /> Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
