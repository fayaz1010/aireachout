'use client'

import { useState, useEffect } from 'react'
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Bot,
  Zap,
  MoreHorizontal,
  Play,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
  Plus,
  PhoneCall,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CallRecord {
  id: string
  contactName: string
  contactPhone: string
  direction: 'INBOUND' | 'OUTBOUND'
  status: 'COMPLETED' | 'MISSED' | 'IN_PROGRESS' | 'QUEUED'
  duration?: number
  startedAt: string
  outcome?: string
  voiceType?: 'AI' | 'HUMAN'
  agent?: string
  campaignName?: string
}

const MOCK_CALLS: CallRecord[] = [
  { id: '1', contactName: 'Sarah Johnson', contactPhone: '+1 (555) 0123', direction: 'INBOUND', status: 'COMPLETED', duration: 342, startedAt: '10:05 AM', outcome: 'DEMO_SCHEDULED', voiceType: 'HUMAN', agent: 'You' },
  { id: '2', contactName: 'Mike Chen', contactPhone: '+1 (555) 0456', direction: 'OUTBOUND', status: 'COMPLETED', duration: 185, startedAt: '9:42 AM', outcome: 'INTERESTED', voiceType: 'AI', campaignName: 'Q4 Outreach' },
  { id: '3', contactName: 'Lisa Wang', contactPhone: '+1 (555) 0789', direction: 'INBOUND', status: 'MISSED', startedAt: '9:15 AM' },
  { id: '4', contactName: 'Alex Rivera', contactPhone: '+1 (555) 0321', direction: 'OUTBOUND', status: 'IN_PROGRESS', startedAt: '10:22 AM', voiceType: 'AI', campaignName: 'Enterprise Leads' },
  { id: '5', contactName: 'Emma Davis', contactPhone: '+1 (555) 0654', direction: 'INBOUND', status: 'QUEUED', startedAt: '10:28 AM' },
  { id: '6', contactName: 'James Wilson', contactPhone: '+1 (555) 0987', direction: 'OUTBOUND', status: 'COMPLETED', duration: 520, startedAt: 'Yesterday', outcome: 'CALLBACK_REQUESTED', voiceType: 'AI' },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  COMPLETED: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  MISSED: { label: 'Missed', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: PhoneMissed },
  IN_PROGRESS: { label: 'Live', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 pulse-dot', icon: PhoneCall },
  QUEUED: { label: 'Queued', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
}

const outcomeLabels: Record<string, string> = {
  DEMO_SCHEDULED: 'Demo scheduled',
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not interested',
  CALLBACK_REQUESTED: 'Callback requested',
  MEETING_SCHEDULED: 'Meeting scheduled',
  VOICEMAIL: 'Voicemail',
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function ActiveCallBanner({ call }: { call: CallRecord }) {
  const [muted, setMuted] = useState(false)
  const [speakerOff, setSpeakerOff] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="glass-card border border-violet-500/30 p-4 aurora-gradient-subtle">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full aurora-gradient text-sm font-bold text-white">
            {call.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500">
              <span className="h-2 w-2 rounded-full bg-white pulse-dot" />
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{call.contactName}</p>
            <p className="text-xs text-muted-foreground">{call.contactPhone}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-violet-300">
            <PhoneCall className="h-3.5 w-3.5" />
            {formatDuration(elapsed)}
          </div>
          {call.voiceType === 'AI' && (
            <Badge className="text-[10px] bg-violet-500/20 text-violet-300 border-violet-500/30 gap-1">
              <Bot className="h-2.5 w-2.5" /> AI Voice
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
              muted
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
            )}
          >
            {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setSpeakerOff(!speakerOff)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border transition-all',
              speakerOff
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:text-foreground'
            )}
          >
            {speakerOff ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
            <PhoneOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

const TABS = ['All', 'Inbound', 'Outbound', 'Missed']

export default function CallsPage() {
  const [calls] = useState<CallRecord[]>(MOCK_CALLS)
  const [tab, setTab] = useState('All')

  const activeCall = calls.find((c) => c.status === 'IN_PROGRESS')
  const queuedCalls = calls.filter((c) => c.status === 'QUEUED')

  const filtered = calls.filter((c) => {
    if (tab === 'Inbound') return c.direction === 'INBOUND'
    if (tab === 'Outbound') return c.direction === 'OUTBOUND'
    if (tab === 'Missed') return c.status === 'MISSED'
    return true
  })

  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.status === 'COMPLETED').length,
    missed: calls.filter((c) => c.status === 'MISSED').length,
    avgDuration: Math.round(
      calls.filter((c) => c.duration).reduce((s, c) => s + (c.duration || 0), 0) /
        (calls.filter((c) => c.duration).length || 1)
    ),
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Calls</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage inbound and outbound voice communications
          </p>
        </div>
        <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
          <PhoneOutgoing className="h-3.5 w-3.5" /> New Call
        </Button>
      </div>

      {/* Active call */}
      {activeCall && <ActiveCallBanner call={activeCall} />}

      {/* Queue */}
      {queuedCalls.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">Queue ({queuedCalls.length})</h3>
          </div>
          <div className="space-y-2">
            {queuedCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white">
                    {call.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{call.contactName}</p>
                    <p className="text-xs text-muted-foreground">{call.contactPhone} · waiting since {call.startedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-2.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Answer
                  </button>
                  <button className="h-7 px-2.5 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Calls', value: stats.total, color: 'text-foreground' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
          { label: 'Missed', value: stats.missed, color: 'text-red-400' },
          { label: 'Avg Duration', value: formatDuration(stats.avgDuration), color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3">
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === t
                ? 'aurora-gradient text-white shadow-aurora-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Call list */}
      <div className="glass-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          <span>Contact</span>
          <span>Direction</span>
          <span>Status</span>
          <span>Duration</span>
          <span>Outcome</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {filtered.map((call) => {
            const s = statusConfig[call.status] || statusConfig.COMPLETED
            const StatusIcon = s.icon
            return (
              <div key={call.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-x-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white">
                      {call.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{call.contactName}</p>
                      <p className="text-xs text-muted-foreground">{call.contactPhone}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                    {call.direction === 'INBOUND' ? (
                      <><ArrowDownLeft className="h-3 w-3 text-emerald-400" /> Inbound</>
                    ) : (
                      <><ArrowUpRight className="h-3 w-3 text-blue-400" /> Outbound</>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border', s.color)}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {s.label}
                    </span>
                  </div>
                  <div className="hidden sm:block text-xs text-muted-foreground">
                    {call.duration ? formatDuration(call.duration) : '—'}
                  </div>
                  <div className="hidden sm:block">
                    {call.outcome ? (
                      <span className="text-xs text-emerald-400">{outcomeLabels[call.outcome] || call.outcome}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10">
                    <PhoneOutgoing className="h-3 w-3" />
                  </button>
                  <button className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-white/5">
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
