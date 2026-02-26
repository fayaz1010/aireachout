'use client'

import { useState } from 'react'
import {
  Ticket,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  Tag,
  MoreHorizontal,
  Flame,
  MessageSquare,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TicketItem {
  id: string
  number: string
  title: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  contactName: string
  assignee?: string
  category: string
  createdAt: string
  lastActivity: string
  commentsCount: number
}

const MOCK_TICKETS: TicketItem[] = [
  { id: '1', number: '#1042', title: 'Cannot access my account after upgrade', status: 'OPEN', priority: 'HIGH', contactName: 'Sarah Johnson', category: 'Billing', createdAt: '2h ago', lastActivity: '30m ago', commentsCount: 3 },
  { id: '2', number: '#1041', title: 'API rate limit questions for enterprise plan', status: 'IN_PROGRESS', priority: 'MEDIUM', contactName: 'Mike Chen', assignee: 'You', category: 'Technical', createdAt: '4h ago', lastActivity: '1h ago', commentsCount: 5 },
  { id: '3', number: '#1040', title: 'Feature request: bulk lead export to CSV', status: 'OPEN', priority: 'LOW', contactName: 'Lisa Wang', category: 'Feature Request', createdAt: 'Yesterday', lastActivity: '5h ago', commentsCount: 1 },
  { id: '4', number: '#1039', title: 'Email campaign not delivering to Gmail', status: 'IN_PROGRESS', priority: 'URGENT', contactName: 'Alex Rivera', assignee: 'You', category: 'Technical', createdAt: 'Yesterday', lastActivity: '2h ago', commentsCount: 8 },
  { id: '5', number: '#1038', title: 'How to integrate with Salesforce CRM', status: 'RESOLVED', priority: 'MEDIUM', contactName: 'Emma Davis', category: 'Integration', createdAt: '3 days ago', lastActivity: 'Yesterday', commentsCount: 6 },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  OPEN: { label: 'Open', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: Clock },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', color: 'bg-white/5 text-muted-foreground border-white/10', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  HIGH: { label: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  LOW: { label: 'Low', color: 'bg-white/5 text-muted-foreground border-white/10' },
}

const COLUMNS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const

export default function TicketsPage() {
  const [tickets] = useState<TicketItem[]>(MOCK_TICKETS)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [search, setSearch] = useState('')

  const filtered = tickets.filter(
    (t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.contactName.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    urgent: tickets.filter((t) => t.priority === 'URGENT').length,
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Customer support tickets and issue tracking</p>
        </div>
        <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: stats.open, color: 'text-blue-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-violet-400' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400' },
          { label: 'Urgent', value: stats.urgent, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3">
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.06] p-0.5">
          {(['board', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                view === v ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'board' ? (
        /* Kanban board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
          {COLUMNS.map((col) => {
            const colTickets = filtered.filter((t) => t.status === col)
            const cfg = statusConfig[col]
            const ColIcon = cfg.icon
            return (
              <div key={col} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <ColIcon className={cn('h-3.5 w-3.5', cfg.color.split(' ').find((c) => c.startsWith('text-')))} />
                  <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                  <span className="ml-auto text-xs font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                    {colTickets.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-32">
                  {colTickets.map((ticket) => {
                    const pCfg = priorityConfig[ticket.priority]
                    return (
                      <div key={ticket.id} className="glass-card stat-card-hover p-3 cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[10px] text-muted-foreground font-mono">{ticket.number}</span>
                          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', pCfg.color)}>
                            {pCfg.label}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed mb-2">
                          {ticket.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full aurora-gradient text-[9px] font-bold text-white">
                              {ticket.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{ticket.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" />{ticket.commentsCount}</span>
                            <span>{ticket.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List view */
        <div className="glass-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            <span>Ticket</span><span>Priority</span><span>Status</span><span>Contact</span><span>Activity</span>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {filtered.map((ticket) => {
              const pCfg = priorityConfig[ticket.priority]
              const sCfg = statusConfig[ticket.status]
              const SIcon = sCfg.icon
              return (
                <div key={ticket.id} className="group grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono">{ticket.number}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', pCfg.color)}>{pCfg.label}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">{ticket.category}</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1', pCfg.color)}>
                      {pCfg.label}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1', sCfg.color)}>
                      <SIcon className="h-2.5 w-2.5" /> {sCfg.label}
                    </span>
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">{ticket.contactName}</div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{ticket.lastActivity}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
