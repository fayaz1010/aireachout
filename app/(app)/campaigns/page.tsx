'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Mail,
  Phone,
  MessageSquare,
  Share2,
  BarChart3,
  Zap,
  Play,
  Pause,
  Eye,
  ArrowRight,
  Calendar,
  Users,
  TrendingUp,
  Layers,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  campaignType: string
  communicationChannels: string[]
  status: string
  totalRecipients: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  smsSent: number
  voiceCallsMade: number
  scheduledAt?: string
  sentAt?: string
  useAiPersonalization: boolean
  project: { name: string }
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
  DRAFT: {
    label: 'Draft',
    dot: 'bg-white/30',
    badge: 'bg-white/5 text-muted-foreground border-white/10',
  },
  SCHEDULED: {
    label: 'Scheduled',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  SENDING: {
    label: 'Sending',
    dot: 'bg-violet-400 pulse-dot',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  SENT: {
    label: 'Sent',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  PAUSED: {
    label: 'Paused',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
}

const channelIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  EMAIL: { icon: Mail, color: 'text-blue-400' },
  SMS: { icon: MessageSquare, color: 'text-emerald-400' },
  VOICE_CALL: { icon: Phone, color: 'text-amber-400' },
  FACEBOOK: { icon: Share2, color: 'text-blue-500' },
  INSTAGRAM: { icon: Share2, color: 'text-rose-400' },
  LINKEDIN: { icon: Share2, color: 'text-blue-300' },
  TWITTER: { icon: Share2, color: 'text-sky-400' },
}

function ChannelBadges({ channels }: { channels: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {channels.slice(0, 4).map((ch) => {
        const cfg = channelIcons[ch]
        if (!cfg) return null
        const Icon = cfg.icon
        return (
          <span
            key={ch}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded bg-white/[0.04] border border-white/[0.06]',
              cfg.color
            )}
            title={ch}
          >
            <Icon className="h-2.5 w-2.5" />
          </span>
        )
      })}
      {channels.length > 4 && (
        <span className="text-[10px] text-muted-foreground">+{channels.length - 4}</span>
      )}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-foreground">{value.toLocaleString()}</p>
      {sub && <p className="text-[10px] text-emerald-400">{sub}</p>}
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const status = statusConfig[campaign.status] || statusConfig.DRAFT
  const openRate =
    campaign.emailsSent > 0
      ? Math.round((campaign.emailsOpened / campaign.emailsSent) * 100)
      : 0
  const clickRate =
    campaign.emailsOpened > 0
      ? Math.round((campaign.emailsClicked / campaign.emailsOpened) * 100)
      : 0

  return (
    <div className="glass-card stat-card-hover p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
                status.badge
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
              {status.label}
            </span>
            {campaign.useAiPersonalization && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Zap className="h-2.5 w-2.5" /> AI
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground truncate">{campaign.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{campaign.project.name}</p>
        </div>
        <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Channels */}
      <ChannelBadges channels={campaign.communicationChannels} />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5">
        <Metric label="Sent" value={campaign.emailsSent} />
        <Metric
          label="Opened"
          value={campaign.emailsOpened}
          sub={openRate > 0 ? `${openRate}%` : undefined}
        />
        <Metric
          label="Clicked"
          value={campaign.emailsClicked}
          sub={clickRate > 0 ? `${clickRate}%` : undefined}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{campaign.totalRecipients.toLocaleString()} recipients</span>
          {campaign.scheduledAt && (
            <>
              <span>·</span>
              <Calendar className="h-3 w-3" />
              <span>{new Date(campaign.scheduledAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {campaign.status === 'SENDING' && (
            <button className="h-6 px-2 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1">
              <Pause className="h-2.5 w-2.5" /> Pause
            </button>
          )}
          {campaign.status === 'PAUSED' && (
            <button className="h-6 px-2 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
              <Play className="h-2.5 w-2.5" /> Resume
            </button>
          )}
          <Link href={`/campaigns/${campaign.id}`}>
            <button className="h-6 px-2 text-[10px] rounded bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground hover:bg-white/10 transition-colors flex items-center gap-1">
              <Eye className="h-2.5 w-2.5" /> View
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const STATUS_TABS = ['All', 'Draft', 'Scheduled', 'Sending', 'Sent', 'Paused']

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(Array.isArray(data) ? data : data.campaigns || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered =
    tab === 'All'
      ? campaigns
      : campaigns.filter((c) => c.status === tab.toUpperCase())

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => ['SENDING', 'SCHEDULED'].includes(c.status)).length,
    sent: campaigns.filter((c) => c.status === 'SENT').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.emailsSent, 0),
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Multi-channel outreach campaigns with AI personalization
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="sm" className="aurora-gradient text-white hover:opacity-90 shadow-aurora-sm gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Active', value: stats.active, color: 'text-violet-400' },
          { label: 'Sent', value: stats.sent, color: 'text-emerald-400' },
          { label: 'Emails Sent', value: stats.totalSent, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3">
            <span className={cn('text-xl font-bold', s.color)}>{s.value.toLocaleString()}</span>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUS_TABS.map((t) => {
          const count =
            t === 'All' ? campaigns.length : campaigns.filter((c) => c.status === t.toUpperCase()).length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === t
                  ? 'aurora-gradient text-white shadow-aurora-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {t}
              {count > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    tab === t
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Campaign grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="h-4 w-24 rounded shimmer" />
              <div className="h-3 w-40 rounded shimmer" />
              <div className="h-12 rounded shimmer" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      ) : (
        <div className="glass-card py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl aurora-gradient-subtle mx-auto mb-4">
            <Layers className="h-7 w-7 text-violet-400" />
          </div>
          <p className="text-sm font-medium text-foreground">No campaigns yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create a multi-channel campaign to start reaching your leads
          </p>
          <Link href="/campaigns/new">
            <Button size="sm" className="aurora-gradient text-white gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
