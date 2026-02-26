'use client'

import { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Edit2,
  Check,
  X,
  Zap,
  Users,
  Mail,
  Phone,
  Star,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface PricingTier {
  id: string
  name: string
  plan: string
  monthlyPrice: number
  yearlyPrice: number | null
  emailLimit: number
  smsLimit: number
  voiceCallLimit: number
  leadsLimit: number
  projectLimit: number
  campaignLimit: number
  features: string[]
  aiPersonalization: boolean
  multiChannel: boolean
  analytics: boolean
  apiAccess: boolean
  prioritySupport: boolean
  description: string | null
  isPopular: boolean
  isActive: boolean
  userCount?: number
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL: 'border-amber-500/30 bg-amber-500/5',
  STARTER: 'border-blue-500/30 bg-blue-500/5',
  PROFESSIONAL: 'border-violet-500/30 bg-violet-500/5',
  ENTERPRISE: 'border-rose-500/30 bg-rose-500/5',
  CUSTOM: 'border-emerald-500/30 bg-emerald-500/5',
}

const PLAN_BADGE: Record<string, string> = {
  TRIAL: 'bg-amber-500/10 text-amber-400',
  STARTER: 'bg-blue-500/10 text-blue-400',
  PROFESSIONAL: 'bg-violet-500/10 text-violet-400',
  ENTERPRISE: 'bg-rose-500/10 text-rose-400',
  CUSTOM: 'bg-emerald-500/10 text-emerald-400',
}

function EditableField({
  label,
  value,
  type = 'text',
  onChange,
  prefix,
}: {
  label: string
  value: string | number
  type?: string
  onChange: (v: string) => void
  prefix?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs bg-white/[0.03] border-white/10 focus:border-violet-500/50"
        />
      </div>
    </div>
  )
}

function FeatureToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all border',
        value
          ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
          : 'bg-white/[0.03] border-white/10 text-muted-foreground'
      )}
    >
      {value ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

export default function SuperAdminPlans() {
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<PricingTier>>({})
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/super-admin/plans')
      if (res.ok) {
        const json = await res.json()
        setTiers(json.tiers || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (tier: PricingTier) => {
    setEditing(tier.id)
    setEditData({ ...tier })
    setMsg(null)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditData({})
  }

  const saveEdit = async (id: string) => {
    setSaving(id)
    try {
      const res = await fetch(`/api/super-admin/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        setMsg({ type: 'success', text: 'Plan updated successfully' })
        setEditing(null)
        fetchTiers()
      } else {
        const err = await res.json()
        setMsg({ type: 'error', text: err.error || 'Failed to update plan' })
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(null)
    }
  }

  const toggleActive = async (tier: PricingTier) => {
    setSaving(tier.id)
    try {
      const res = await fetch(`/api/super-admin/plans/${tier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tier.isActive }),
      })
      if (res.ok) {
        fetchTiers()
      }
    } finally {
      setSaving(null)
    }
  }

  const upd = (key: keyof PricingTier, value: any) =>
    setEditData((prev) => ({ ...prev, [key]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Subscription Plans</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage pricing tiers, limits, and features</p>
        </div>
        <Button size="sm" className="aurora-gradient text-white text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Plan
        </Button>
      </div>

      {msg && (
        <div className={cn('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm border', msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400')}>
          {msg.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      {tiers.length === 0 ? (
        <div className="glass-card rounded-xl p-10 border border-white/[0.06] text-center">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No pricing tiers found.</p>
          <p className="text-xs text-muted-foreground mt-1">Run the seed script to create default plans.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
            onClick={async () => {
              await fetch('/api/pricing-plans', { method: 'POST' })
              fetchTiers()
            }}
          >
            Seed Default Plans
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {tiers.map((tier) => {
            const isEditing = editing === tier.id
            const d = isEditing ? editData : tier
            return (
              <div
                key={tier.id}
                className={cn(
                  'rounded-xl border p-5 transition-all',
                  PLAN_COLORS[tier.plan] || 'border-white/[0.06] bg-white/[0.02]',
                  !tier.isActive && 'opacity-50'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', PLAN_BADGE[tier.plan])}>
                      {tier.plan}
                    </span>
                    {tier.isPopular && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <Star className="h-3 w-3 fill-amber-400" /> Popular
                      </span>
                    )}
                    {!tier.isActive && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/10">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(tier)}
                      disabled={saving === tier.id}
                      className="p-1.5 rounded-md hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors text-xs"
                      title={tier.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {tier.isActive ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(tier)}
                        className="p-1.5 rounded-md hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveEdit(tier.id)}
                          disabled={saving === tier.id}
                          className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          {saving === tier.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name & Price */}
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <EditableField label="Plan Name" value={d.name || ''} onChange={(v) => upd('name', v)} />
                    <EditableField label="Monthly Price" value={d.monthlyPrice || 0} type="number" prefix="$" onChange={(v) => upd('monthlyPrice', parseFloat(v))} />
                    <EditableField label="Yearly Price" value={d.yearlyPrice || ''} type="number" prefix="$" onChange={(v) => upd('yearlyPrice', v ? parseFloat(v) : null)} />
                    <EditableField label="Description" value={d.description || ''} onChange={(v) => upd('description', v)} />
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-lg font-bold text-foreground">{tier.name}</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-foreground">${typeof tier.monthlyPrice === 'object' ? Number(tier.monthlyPrice) : tier.monthlyPrice}</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                      {tier.yearlyPrice && (
                        <span className="text-xs text-emerald-400">${typeof tier.yearlyPrice === 'object' ? Number(tier.yearlyPrice) : tier.yearlyPrice}/yr</span>
                      )}
                    </div>
                    {tier.description && <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>}
                    {tier.userCount !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Users className="inline h-3 w-3 mr-1" />{tier.userCount} active users
                      </p>
                    )}
                  </div>
                )}

                {/* Limits */}
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <EditableField label="Emails/mo" value={d.emailLimit || 0} type="number" onChange={(v) => upd('emailLimit', parseInt(v))} />
                    <EditableField label="SMS/mo" value={d.smsLimit || 0} type="number" onChange={(v) => upd('smsLimit', parseInt(v))} />
                    <EditableField label="Calls/mo" value={d.voiceCallLimit || 0} type="number" onChange={(v) => upd('voiceCallLimit', parseInt(v))} />
                    <EditableField label="Leads/mo" value={d.leadsLimit || 0} type="number" onChange={(v) => upd('leadsLimit', parseInt(v))} />
                    <EditableField label="Projects" value={d.projectLimit || 0} type="number" onChange={(v) => upd('projectLimit', parseInt(v))} />
                    <EditableField label="Campaigns" value={d.campaignLimit || 0} type="number" onChange={(v) => upd('campaignLimit', parseInt(v))} />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Mail, label: 'Emails', value: tier.emailLimit.toLocaleString() },
                      { icon: Phone, label: 'Calls', value: tier.voiceCallLimit.toLocaleString() },
                      { icon: Zap, label: 'Leads', value: tier.leadsLimit.toLocaleString() },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-lg bg-black/10 px-3 py-2 text-center">
                        <Icon className="h-3 w-3 text-muted-foreground mx-auto mb-1" />
                        <div className="text-sm font-semibold text-foreground">{value}</div>
                        <div className="text-[10px] text-muted-foreground">{label}/mo</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature toggles */}
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    <FeatureToggle label="AI Personalization" value={!!d.aiPersonalization} onChange={(v) => upd('aiPersonalization', v)} />
                    <FeatureToggle label="Multi-Channel" value={!!d.multiChannel} onChange={(v) => upd('multiChannel', v)} />
                    <FeatureToggle label="Analytics" value={!!d.analytics} onChange={(v) => upd('analytics', v)} />
                    <FeatureToggle label="API Access" value={!!d.apiAccess} onChange={(v) => upd('apiAccess', v)} />
                    <FeatureToggle label="Priority Support" value={!!d.prioritySupport} onChange={(v) => upd('prioritySupport', v)} />
                    <FeatureToggle label="Popular" value={!!d.isPopular} onChange={(v) => upd('isPopular', v)} />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'AI', active: tier.aiPersonalization },
                      { label: 'Multi-Ch', active: tier.multiChannel },
                      { label: 'Analytics', active: tier.analytics },
                      { label: 'API', active: tier.apiAccess },
                      { label: 'Priority', active: tier.prioritySupport },
                    ].map(({ label, active }) => (
                      <span
                        key={label}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border',
                          active
                            ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                            : 'bg-white/[0.03] border-white/10 text-white/20 line-through'
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
