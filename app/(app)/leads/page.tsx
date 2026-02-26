'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Upload,
  Filter,
  Mail,
  Phone,
  ArrowRight,
  Star,
  MapPin,
  Building2,
  Briefcase,
  ChevronDown,
  Zap,
  Flame,
  SlidersHorizontal,
  Eye,
  UserPlus,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  companyName?: string
  jobTitle?: string
  location?: string
  phone?: string
  leadScore?: number
  status: string
  source: string
  tags: string[]
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  lastContacted?: string
  projectId: string
  project?: { name: string }
  aiInsights?: any
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'New', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONTACTED: { label: 'Contacted', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  RESPONDED: { label: 'Responded', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  QUALIFIED: { label: 'Qualified', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  CONVERTED: { label: 'Converted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  UNSUBSCRIBED: { label: 'Unsub', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  BOUNCED: { label: 'Bounced', color: 'bg-white/5 text-muted-foreground border-white/10' },
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-violet-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span
        className={cn(
          'text-xs font-semibold',
          pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : pct >= 40 ? 'text-violet-400' : 'text-red-400'
        )}
      >
        {score}
      </span>
    </div>
  )
}

function LeadRow({ lead }: { lead: Lead }) {
  const name = lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const openRate = lead.emailsSent > 0 ? Math.round((lead.emailsOpened / lead.emailsSent) * 100) : 0

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-3 hover:bg-white/[0.02] hover:border-white/[0.06] transition-all">
      {/* Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white shadow-aurora-sm">
        {initials}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 gap-y-1 items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
        </div>

        <div className="min-w-0 hidden sm:block">
          {lead.companyName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.companyName}</span>
            </div>
          )}
          {lead.jobTitle && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.jobTitle}</span>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="hidden sm:block">
          {lead.leadScore ? (
            <ScoreBar score={lead.leadScore} />
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </div>

        {/* Status */}
        <div className="hidden sm:block">
          <span
            className={cn(
              'inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border',
              statusConfig[lead.status]?.color || statusConfig.NEW.color
            )}
          >
            {statusConfig[lead.status]?.label || lead.status}
          </span>
        </div>

        {/* Engagement */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{lead.emailsSent}</span>
          {openRate > 0 && (
            <span className="text-emerald-400 ml-1">{openRate}% open</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link href={`/leads/${lead.id}`}>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <Eye className="h-3.5 w-3.5" />
          </button>
        </Link>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
          <Mail className="h-3.5 w-3.5" />
        </button>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

const STATUS_FILTERS = ['All', 'New', 'Contacted', 'Responded', 'Qualified', 'Converted']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((data) => {
        setLeads(Array.isArray(data) ? data : data.leads || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = leads.filter((lead) => {
    const name = lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' ') || ''
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      lead.jobTitle?.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      statusFilter === 'All' || lead.status === statusFilter.toUpperCase()

    return matchSearch && matchStatus
  })

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'NEW').length,
    qualified: leads.filter((l) => l.status === 'QUALIFIED').length,
    converted: leads.filter((l) => l.status === 'CONVERTED').length,
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total.toLocaleString()} prospects in your database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leads/import">
            <Button variant="outline" size="sm" className="border-white/10 hover:border-white/20 gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </Button>
          </Link>
          <Link href="/leads/generate">
            <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
              <Zap className="h-3.5 w-3.5" />
              Generate Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-foreground', bg: 'bg-white/[0.03]' },
          { label: 'New', value: stats.new, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Qualified', value: stats.qualified, color: 'text-purple-400', bg: 'bg-purple-500/5' },
          { label: 'Converted', value: stats.converted, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
        ].map((s) => (
          <div key={s.label} className={cn('glass-card p-3 flex flex-col', s.bg)}>
            <span className={cn('text-xl font-bold', s.color)}>{s.value.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="glass-card p-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-[200px] rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
            placeholder="Search leads, companies, titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                statusFilter === s
                  ? 'aurora-gradient text-white shadow-aurora-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Lead table */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.06] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          <span>Lead</span>
          <span>Company</span>
          <span>Score</span>
          <span>Status</span>
          <span>Engagement</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.03] px-0">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="h-9 w-9 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded shimmer" />
                  <div className="h-2.5 w-24 rounded shimmer" />
                </div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          ) : (
            <div className="py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl aurora-gradient-subtle mx-auto mb-4">
                <Users className="h-7 w-7 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {search || statusFilter !== 'All' ? 'No leads found' : 'No leads yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {search
                  ? 'Try adjusting your search'
                  : 'Generate AI-powered leads or import a CSV'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link href="/leads/generate">
                  <Button size="sm" className="aurora-gradient text-white gap-1.5 text-xs">
                    <Zap className="h-3.5 w-3.5" /> Generate
                  </Button>
                </Link>
                <Link href="/leads/import">
                  <Button variant="outline" size="sm" className="border-white/10 gap-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" /> Import
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {leads.length} leads
            </span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-white/5 disabled:opacity-30">
                ← Prev
              </button>
              <button className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-white/5">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
