'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  Zap,
  TrendingUp,
  Crown,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Mail,
  MessageSquare,
  Phone,
  Users,
  Bot,
  RefreshCw,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const usageItems = [
  { label: 'Emails Sent', used: 4250, limit: 10000, icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500', pct: 43 },
  { label: 'SMS Sent', used: 280, limit: 500, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500', pct: 56 },
  { label: 'Voice Calls', used: 48, limit: 100, icon: Phone, color: 'text-amber-400', bg: 'bg-amber-500', pct: 48 },
  { label: 'Leads Generated', used: 890, limit: 1000, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500', pct: 89 },
  { label: 'AI API Calls', used: 2100, limit: 5000, icon: Bot, color: 'text-rose-400', bg: 'bg-rose-500', pct: 42 },
]

const invoices = [
  { id: 'INV-001', date: 'Jan 1, 2026', amount: '$149.00', status: 'PAID' },
  { id: 'INV-002', date: 'Dec 1, 2025', amount: '$149.00', status: 'PAID' },
  { id: 'INV-003', date: 'Nov 1, 2025', amount: '$49.00', status: 'PAID' },
]

export default function BillingPage() {
  const [plan] = useState('PROFESSIONAL')
  const [status] = useState('ACTIVE')
  const [renewDate] = useState('Feb 1, 2027')

  return (
    <div className="space-y-5 fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Usage</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your subscription and monitor usage</p>
      </div>

      {/* Current plan */}
      <div className="glass-card p-5 aurora-gradient-subtle border-violet-500/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-foreground">Professional Plan</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">$149<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <p className="text-xs text-muted-foreground mt-1">Next renewal: {renewDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-xs gap-1.5">
              <RefreshCw className="h-3 w-3" /> Manage Subscription
            </Button>
            <Link href="/pricing">
              <Button size="sm" className="aurora-gradient text-white hover:opacity-90 text-xs gap-1.5 shadow-aurora-sm">
                <Zap className="h-3 w-3" /> Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Monthly Usage</h3>
          <span className="text-xs text-muted-foreground">Resets Feb 1, 2026</span>
        </div>
        <div className="space-y-4">
          {usageItems.map((item) => {
            const Icon = item.icon
            const isHigh = item.pct >= 80
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', item.color)} />
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                    {isHigh && <AlertCircle className="h-3 w-3 text-amber-400" />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    <span className={cn('font-semibold', isHigh ? 'text-amber-400' : 'text-foreground')}>
                      {item.used.toLocaleString()}
                    </span>
                    {' / '}{item.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', isHigh ? 'bg-amber-500' : item.bg)}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment method */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/27</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-white/10 text-xs">
            Update
          </Button>
        </div>
      </div>

      {/* Invoice history */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Invoice History</h3>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
            <Download className="h-3 w-3" /> Export All
          </Button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground">{inv.id}</span>
                <span className="text-xs text-muted-foreground">{inv.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-foreground">{inv.amount}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {inv.status}
                </span>
                <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
