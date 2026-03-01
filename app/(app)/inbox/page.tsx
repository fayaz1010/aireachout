'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  MessageSquare, Send, Search, RefreshCw, User, Tag,
  Briefcase, ChevronRight, Facebook, Phone, Mail,
  MessageCircle, Instagram, Twitter, Linkedin, Globe,
  Bot, Star, AlertCircle, CheckCheck, Clock, Filter,
  SlidersHorizontal, X, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  content: string
  direction: 'INBOUND' | 'OUTBOUND'
  channel: string
  senderType: string
  senderName: string | null
  status: string
  createdAt: string
  isAiGenerated: boolean
}

interface Campaign {
  id: string
  name: string
  campaignType: string
  status: string
  subject?: string
}

interface Lead {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  companyName: string | null
  jobTitle: string | null
  leadScore: number | null
  status: string
  tags: string[]
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
}

interface Conversation {
  id: string
  channel: string
  status: string
  subject: string | null
  externalId: string | null
  createdAt: string
  updatedAt: string
  customer: Customer | null
  messages: Message[]
  campaign: Campaign | null
  lead: Lead | null
  campaignId: string | null
  leadId: string | null
}

// ── Channel helpers ───────────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  FACEBOOK:   { label: 'Messenger',  icon: Facebook,       color: 'text-blue-600',  bg: 'bg-blue-50'   },
  INSTAGRAM:  { label: 'Instagram',  icon: Instagram,      color: 'text-pink-600',  bg: 'bg-pink-50'   },
  WHATSAPP:   { label: 'WhatsApp',   icon: MessageCircle,  color: 'text-green-600', bg: 'bg-green-50'  },
  TELEGRAM:   { label: 'Telegram',   icon: MessageCircle,  color: 'text-sky-500',   bg: 'bg-sky-50'    },
  TWITTER:    { label: 'Twitter/X',  icon: Twitter,        color: 'text-black',     bg: 'bg-gray-50'   },
  LINKEDIN:   { label: 'LinkedIn',   icon: Linkedin,       color: 'text-blue-700',  bg: 'bg-blue-50'   },
  EMAIL:      { label: 'Email',      icon: Mail,           color: 'text-orange-600',bg: 'bg-orange-50' },
  SMS:        { label: 'SMS',        icon: Phone,          color: 'text-purple-600',bg: 'bg-purple-50' },
  LIVE_CHAT:  { label: 'Live Chat',  icon: Globe,          color: 'text-teal-600',  bg: 'bg-teal-50'   },
  VOICE_CALL: { label: 'Voice',      icon: Phone,          color: 'text-red-600',   bg: 'bg-red-50'    },
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:        'bg-green-100 text-green-700',
  PENDING:     'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-gray-100 text-gray-600',
  CLOSED:      'bg-gray-100 text-gray-500',
}

function ChannelIcon({ channel, size = 14 }: { channel: string; size?: number }) {
  const meta = CHANNEL_META[channel] ?? { icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-50' }
  const Icon = meta.icon
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full p-1', meta.bg)}>
      <Icon size={size} className={meta.color} />
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InboxPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv]   = useState<Conversation | null>(null)
  const [loading, setLoading]             = useState(true)
  const [loadingConv, setLoadingConv]     = useState(false)
  const [sending, setSending]             = useState(false)
  const [replyText, setReplyText]         = useState('')
  const [search, setSearch]               = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyRef       = useRef<HTMLTextAreaElement>(null)

  // ── Fetch conversations ──────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search)        params.set('search',  search)
      if (channelFilter) params.set('channel', channelFilter)
      const res = await fetch(`/api/inbox/conversations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations)
      }
    } catch { toast.error('Failed to load conversations') }
    finally { setLoading(false) }
  }, [search, channelFilter])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user) fetchConversations()
  }, [session, status, fetchConversations])

  // Auto-refresh every 15s
  useEffect(() => {
    const t = setInterval(fetchConversations, 15000)
    return () => clearInterval(t)
  }, [fetchConversations])

  // Open conversation from URL param
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && conversations.length) {
      const conv = conversations.find(c => c.id === id)
      if (conv) openConversation(conv)
    }
  }, [conversations, searchParams])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConv?.messages])

  // ── Open conversation ────────────────────────────────────────────────────

  const openConversation = async (conv: Conversation) => {
    setLoadingConv(true)
    setShowMobileChat(true)
    try {
      const res = await fetch(`/api/inbox/conversations/${conv.id}/messages`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConv(data)
        router.replace(`/inbox?id=${conv.id}`, { scroll: false })
      }
    } catch { toast.error('Failed to load conversation') }
    finally { setLoadingConv(false) }
  }

  // ── Send reply ───────────────────────────────────────────────────────────

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConv || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/inbox/conversations/${selectedConv.id}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: replyText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReplyText('')
      // Re-fetch conversation to show new message
      await openConversation(selectedConv)
      toast.success('Message sent')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden bg-background h-full">

      {/* ── LEFT: Conversation list ─────────────────────────────────────── */}
      <aside className={cn(
        'flex flex-col border-r w-full md:w-80 lg:w-96 shrink-0',
        showMobileChat && 'hidden md:flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Inbox</h1>
            <Button size="sm" variant="ghost" onClick={fetchConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Channel filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {['', 'FACEBOOK', 'WHATSAPP', 'TELEGRAM', 'INSTAGRAM', 'EMAIL'].map(ch => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
                  channelFilter === ch
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary'
                )}
              >
                {ch ? (CHANNEL_META[ch]?.label ?? ch) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const lastMsg   = conv.messages?.[0]
              const isSelected = selectedConv?.id === conv.id
              const meta      = CHANNEL_META[conv.channel] ?? CHANNEL_META['EMAIL']
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                    isSelected && 'bg-muted'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <ChannelIcon channel={conv.channel} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {conv.customer?.name ?? conv.subject ?? `${meta.label} User`}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lastMsg
                          ? (lastMsg.direction === 'OUTBOUND' ? '↳ ' : '') + lastMsg.content
                          : 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', STATUS_COLORS[conv.status])}>
                          {conv.status}
                        </span>
                        {conv.campaign && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium truncate max-w-[100px]">
                            {conv.campaign.name}
                          </span>
                        )}
                        {conv.lead?.leadScore && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            ★ {conv.lead.leadScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* ── CENTER: Chat thread ──────────────────────────────────────────── */}
      <main className={cn(
        'flex flex-col flex-1 min-w-0',
        !showMobileChat && 'hidden md:flex'
      )}>
        {!selectedConv ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <MessageSquare className="h-16 w-16 opacity-20" />
            <p className="text-sm">Select a conversation to start</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
              <Button
                size="sm" variant="ghost"
                className="md:hidden"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ChannelIcon channel={selectedConv.channel} size={18} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {selectedConv.customer?.name ?? selectedConv.subject ?? 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CHANNEL_META[selectedConv.channel]?.label ?? selectedConv.channel}
                  {selectedConv.customer?.email && ` · ${selectedConv.customer.email}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium', STATUS_COLORS[selectedConv.status])}>
                  {selectedConv.status}
                </span>
                {selectedConv.campaign && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
                    <Briefcase className="h-3 w-3" />
                    {selectedConv.campaign.name}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loadingConv ? (
                <div className="flex justify-center pt-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : selectedConv.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground pt-8">No messages yet</p>
              ) : (
                selectedConv.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn('flex', msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                      msg.direction === 'OUTBOUND'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    )}>
                      {msg.senderName && msg.direction === 'INBOUND' && (
                        <p className="text-xs font-medium opacity-70 mb-1">{msg.senderName}</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className={cn(
                        'flex items-center gap-1 mt-1 text-xs opacity-60',
                        msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                      )}>
                        {msg.isAiGenerated && <Bot className="h-3 w-3" />}
                        <span>{format(new Date(msg.createdAt), 'HH:mm')}</span>
                        {msg.direction === 'OUTBOUND' && (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="border-t p-4 bg-background">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={replyRef}
                  className="flex-1 resize-none rounded-xl border bg-muted/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] max-h-32"
                  placeholder={`Reply via ${CHANNEL_META[selectedConv.channel]?.label ?? selectedConv.channel}… (Enter to send)`}
                  rows={1}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  size="icon"
                  className="rounded-xl h-11 w-11 shrink-0"
                >
                  {sending
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 px-1">
                Shift+Enter for new line · Enter to send
              </p>
            </div>
          </>
        )}
      </main>

      {/* ── RIGHT: Context panel (lead / campaign info) ──────────────────── */}
      {selectedConv && (
        <aside className="hidden lg:flex flex-col w-72 border-l overflow-y-auto bg-muted/20">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Conversation Details</h2>
          </div>

          {/* Customer */}
          {selectedConv.customer && (
            <section className="p-4 border-b space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Customer
              </h3>
              <p className="font-medium text-sm">{selectedConv.customer.name}</p>
              {selectedConv.customer.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {selectedConv.customer.email}
                </p>
              )}
              {selectedConv.customer.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {selectedConv.customer.phone}
                </p>
              )}
            </section>
          )}

          {/* Lead info */}
          {selectedConv.lead && (
            <section className="p-4 border-b space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3" /> Lead
              </h3>
              <p className="font-medium text-sm">
                {[selectedConv.lead.firstName, selectedConv.lead.lastName].filter(Boolean).join(' ') || selectedConv.lead.email}
              </p>
              {selectedConv.lead.jobTitle && (
                <p className="text-xs text-muted-foreground">{selectedConv.lead.jobTitle}</p>
              )}
              {selectedConv.lead.companyName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {selectedConv.lead.companyName}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedConv.lead.leadScore && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    Score: {selectedConv.lead.leadScore}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {selectedConv.lead.status}
                </span>
              </div>
              {selectedConv.lead.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedConv.lead.tags.map(tag => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Button
                size="sm" variant="outline" className="w-full mt-1 text-xs"
                onClick={() => router.push(`/leads?id=${selectedConv.lead!.id}`)}
              >
                View Lead Profile <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </section>
          )}

          {/* Campaign info */}
          {selectedConv.campaign && (
            <section className="p-4 border-b space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Campaign
              </h3>
              <p className="font-medium text-sm">{selectedConv.campaign.name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                  {selectedConv.campaign.campaignType}
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  selectedConv.campaign.status === 'SENT'   ? 'bg-green-100 text-green-700' :
                  selectedConv.campaign.status === 'DRAFT'  ? 'bg-gray-100 text-gray-600'   :
                  'bg-blue-100 text-blue-700'
                )}>
                  {selectedConv.campaign.status}
                </span>
              </div>
              {selectedConv.campaign.subject && (
                <p className="text-xs text-muted-foreground">
                  Subject: {selectedConv.campaign.subject}
                </p>
              )}
              <Button
                size="sm" variant="outline" className="w-full mt-1 text-xs"
                onClick={() => router.push(`/campaigns/${selectedConv.campaign!.id}`)}
              >
                View Campaign <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </section>
          )}

          {/* Conversation metadata */}
          <section className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timeline
            </h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Created: {format(new Date(selectedConv.createdAt), 'MMM d, yyyy HH:mm')}</p>
              <p>Updated: {format(new Date(selectedConv.updatedAt), 'MMM d, yyyy HH:mm')}</p>
              <p>Messages: {selectedConv.messages.length}</p>
              <p>Channel: {CHANNEL_META[selectedConv.channel]?.label ?? selectedConv.channel}</p>
            </div>
          </section>
        </aside>
      )}
    </div>
  )
}
