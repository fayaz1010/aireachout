'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  MessageSquare, Send, Search, RefreshCw, User,
  Briefcase, ChevronRight, Facebook, Phone, Mail,
  MessageCircle, Instagram, Twitter, Linkedin, Globe,
  Bot, Star, CheckCheck, Clock, ArrowLeft, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  id: string; name: string; campaignType: string; status: string; subject?: string
}
interface Lead {
  id: string; firstName: string | null; lastName: string | null; email: string
  phone: string | null; companyName: string | null; jobTitle: string | null
  leadScore: number | null; status: string; tags: string[]
}
interface Customer {
  id: string; name: string; email: string | null; phone: string | null
}
interface Conversation {
  id: string; channel: string; status: string; subject: string | null
  externalId: string | null; createdAt: string; updatedAt: string
  customer: Customer | null; messages: Message[]
  campaign: Campaign | null; lead: Lead | null
  campaignId: string | null; leadId: string | null
}

// ── Channel meta ───────────────────────────────────────────────────────────────

const CH: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  FACEBOOK:   { label: 'Messenger',  icon: Facebook,      color: 'text-blue-600',   bg: 'bg-blue-50'   },
  INSTAGRAM:  { label: 'Instagram',  icon: Instagram,     color: 'text-pink-600',   bg: 'bg-pink-50'   },
  WHATSAPP:   { label: 'WhatsApp',   icon: MessageCircle, color: 'text-green-600',  bg: 'bg-green-50'  },
  TELEGRAM:   { label: 'Telegram',   icon: MessageCircle, color: 'text-sky-500',    bg: 'bg-sky-50'    },
  TWITTER:    { label: 'Twitter/X',  icon: Twitter,       color: 'text-black',      bg: 'bg-gray-50'   },
  LINKEDIN:   { label: 'LinkedIn',   icon: Linkedin,      color: 'text-blue-700',   bg: 'bg-blue-50'   },
  EMAIL:      { label: 'Email',      icon: Mail,          color: 'text-orange-600', bg: 'bg-orange-50' },
  SMS:        { label: 'SMS',        icon: Phone,         color: 'text-purple-600', bg: 'bg-purple-50' },
  LIVE_CHAT:  { label: 'Live Chat',  icon: Globe,         color: 'text-teal-600',   bg: 'bg-teal-50'   },
  VOICE_CALL: { label: 'Voice',      icon: Phone,         color: 'text-red-600',    bg: 'bg-red-50'    },
}

const STATUS_COLORS: Record<string, string> = {
  OPEN:        'bg-green-100 text-green-700',
  PENDING:     'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED:    'bg-gray-100 text-gray-600',
  CLOSED:      'bg-gray-100 text-gray-500',
}

function ChannelIcon({ channel, size = 14 }: { channel: string; size?: number }) {
  const meta = CH[channel] ?? { icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-50' }
  const Icon = meta.icon
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full p-1', meta.bg)}>
      <Icon size={size} className={meta.color} />
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const { data: session, status } = useSession()
  const router       = useRouter()
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

  const messagesEndRef   = useRef<HTMLDivElement>(null)
  const replyRef         = useRef<HTMLTextAreaElement>(null)
  const isSendingRef     = useRef(false)          // blocks poll from clobbering optimistic msg
  const selectedIdRef    = useRef<string | null>(null)
  const urlIdHandled     = useRef(false)
  const prevMsgCount     = useRef(0)
  const knownMsgIds      = useRef<Set<string>>(new Set())

  // ── Fetch conversation list ───────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const p = new URLSearchParams()
      if (search)        p.set('search',  search)
      if (channelFilter) p.set('channel', channelFilter)
      const res = await fetch(`/api/inbox/conversations?${p}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, channelFilter])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (session?.user) fetchConversations()
  }, [session, status, fetchConversations])

  // Refresh list every 10s (silent)
  useEffect(() => {
    const t = setInterval(fetchConversations, 10_000)
    return () => clearInterval(t)
  }, [fetchConversations])

  // Handle URL ?id= on first load only
  useEffect(() => {
    if (urlIdHandled.current || !conversations.length) return
    const id = searchParams.get('id')
    if (id) {
      const conv = conversations.find(c => c.id === id)
      if (conv) { openConversation(conv); urlIdHandled.current = true }
    }
  }, [conversations]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll for new messages in active conversation (2s) ────────────────────

  useEffect(() => {
    selectedIdRef.current = selectedConv?.id ?? null
  }, [selectedConv?.id])

  useEffect(() => {
    const poll = async () => {
      const id = selectedIdRef.current
      if (!id || isSendingRef.current) return
      try {
        const res = await fetch(`/api/inbox/conversations/${id}/messages`)
        if (!res.ok) return
        const data: Conversation = await res.json()

        setSelectedConv(prev => {
          if (!prev || prev.id !== id || isSendingRef.current) return prev

          // Find truly new server messages not yet in our state
          const newMsgs = data.messages.filter(m => !knownMsgIds.current.has(m.id))
          if (newMsgs.length === 0) return prev

          newMsgs.forEach(m => knownMsgIds.current.add(m.id))

          // Append new messages, keeping any optimistic ones at the end
          const optimistic = prev.messages.filter(m => m.id.startsWith('opt-'))
          const confirmed  = prev.messages.filter(m => !m.id.startsWith('opt-'))
          const allConfirmed = [
            ...confirmed.filter(m => knownMsgIds.current.has(m.id) || !m.id.startsWith('opt-')),
            ...newMsgs.filter(m => !confirmed.some(c => c.id === m.id)),
          ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

          return { ...prev, messages: [...allConfirmed, ...optimistic] }
        })
      } catch { /* silent */ }
    }
    const t = setInterval(poll, 2000)
    return () => clearInterval(t)
  }, [])

  // Scroll to bottom only when message count grows
  useEffect(() => {
    const count = selectedConv?.messages?.length ?? 0
    if (count > prevMsgCount.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMsgCount.current = count
  }, [selectedConv?.messages?.length])

  // ── Open conversation ─────────────────────────────────────────────────────

  const openConversation = async (conv: Conversation) => {
    if (selectedConv?.id === conv.id) return
    setLoadingConv(true)
    setShowMobileChat(true)
    knownMsgIds.current = new Set()
    prevMsgCount.current = 0
    try {
      const res = await fetch(`/api/inbox/conversations/${conv.id}/messages`)
      if (res.ok) {
        const data: Conversation = await res.json()
        data.messages.forEach(m => knownMsgIds.current.add(m.id))
        prevMsgCount.current = data.messages.length
        setSelectedConv(data)
        router.replace(`/inbox?id=${conv.id}`, { scroll: false })
      }
    } catch { toast.error('Failed to load conversation') }
    finally { setLoadingConv(false) }
  }

  // ── Send reply ────────────────────────────────────────────────────────────

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConv || sending) return
    const text = replyText.trim()
    const optId = `opt-${Date.now()}`

    isSendingRef.current = true
    setSending(true)
    setReplyText('')

    const optimistic: Message = {
      id:            optId,
      content:       text,
      direction:     'OUTBOUND',
      channel:       selectedConv.channel,
      senderType:    'AGENT',
      senderName:    session?.user?.name ?? 'You',
      status:        'SENDING',
      createdAt:     new Date().toISOString(),
      isAiGenerated: false,
    }

    setSelectedConv(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev)

    try {
      const res = await fetch(`/api/inbox/conversations/${selectedConv.id}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const confirmed: Message = { ...data.message, status: 'SENT' }
      knownMsgIds.current.add(confirmed.id)

      // Swap optimistic → confirmed
      setSelectedConv(prev => prev
        ? { ...prev, messages: prev.messages.map(m => m.id === optId ? confirmed : m) }
        : prev
      )
    } catch (err: any) {
      // Remove optimistic, restore text
      setSelectedConv(prev => prev
        ? { ...prev, messages: prev.messages.filter(m => m.id !== optId) }
        : prev
      )
      setReplyText(text)
      toast.error(err.message ?? 'Failed to send')
    } finally {
      setSending(false)
      // Small delay before re-enabling polls so server has time to commit
      setTimeout(() => { isSendingRef.current = false }, 1500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 overflow-hidden bg-background h-full">

      {/* ── LEFT: Conversation list ─────────────────────────────────────── */}
      <aside className={cn(
        'flex flex-col border-r w-full md:w-80 lg:w-96 shrink-0',
        showMobileChat && 'hidden md:flex'
      )}>
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
                {ch ? (CH[ch]?.label ?? ch) : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const lastMsg    = conv.messages?.[0]
              const isSelected = selectedConv?.id === conv.id
              const meta       = CH[conv.channel] ?? CH['EMAIL']
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
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
              <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setShowMobileChat(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ChannelIcon channel={selectedConv.channel} size={18} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {selectedConv.customer?.name ?? selectedConv.subject ?? 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CH[selectedConv.channel]?.label ?? selectedConv.channel}
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
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {loadingConv ? (
                <div className="flex justify-center pt-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : selectedConv.messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground pt-8">No messages yet</p>
              ) : (
                selectedConv.messages.map((msg, i) => {
                  const isOut  = msg.direction === 'OUTBOUND'
                  const isOpt  = msg.id.startsWith('opt-')
                  const prev   = selectedConv.messages[i - 1]
                  const sameSide = prev && prev.direction === msg.direction
                  const showTime = !prev || (
                    new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000
                  )

                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="flex justify-center my-3">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      )}
                      <div className={cn(
                        'flex',
                        isOut ? 'justify-end' : 'justify-start',
                        sameSide && !showTime ? 'mt-0.5' : 'mt-2'
                      )}>
                        <div className={cn(
                          'max-w-[72%] px-3.5 py-2 text-sm shadow-sm',
                          isOut
                            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                            : 'bg-muted text-foreground rounded-2xl rounded-bl-sm',
                          isOpt && 'opacity-70'
                        )}>
                          {msg.senderName && !isOut && (
                            <p className="text-[11px] font-semibold opacity-60 mb-0.5">{msg.senderName}</p>
                          )}
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                          <div className={cn(
                            'flex items-center gap-1 mt-0.5',
                            isOut ? 'justify-end' : 'justify-start'
                          )}>
                            {msg.isAiGenerated && <Bot className="h-2.5 w-2.5 opacity-50" />}
                            <span className="text-[10px] opacity-50">
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </span>
                            {isOut && (
                              isOpt
                                ? <Clock className="h-2.5 w-2.5 opacity-40" />
                                : msg.status === 'SENT'
                                  ? <Check className="h-2.5 w-2.5 opacity-50" />
                                  : <CheckCheck className="h-2.5 w-2.5 opacity-50" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="border-t p-3 bg-background shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={replyRef}
                  className="flex-1 resize-none rounded-2xl border bg-muted/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px] max-h-28"
                  placeholder={`Message via ${CH[selectedConv.channel]?.label ?? selectedConv.channel}…`}
                  rows={1}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  size="icon"
                  className="rounded-2xl h-[42px] w-[42px] shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 px-1 opacity-60">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </main>

      {/* ── RIGHT: Context panel ─────────────────────────────────────────── */}
      {selectedConv && (
        <aside className="hidden lg:flex flex-col w-64 border-l overflow-y-auto bg-muted/20 shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Details</h2>
          </div>

          {selectedConv.customer && (
            <section className="p-4 border-b space-y-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
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

          {selectedConv.lead && (
            <section className="p-4 border-b space-y-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3" /> Lead
              </h3>
              <p className="font-medium text-sm">
                {[selectedConv.lead.firstName, selectedConv.lead.lastName].filter(Boolean).join(' ') || selectedConv.lead.email}
              </p>
              {selectedConv.lead.jobTitle && <p className="text-xs text-muted-foreground">{selectedConv.lead.jobTitle}</p>}
              {selectedConv.lead.companyName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {selectedConv.lead.companyName}
                </p>
              )}
              <div className="flex gap-1.5 flex-wrap">
                {selectedConv.lead.leadScore && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    Score: {selectedConv.lead.leadScore}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  {selectedConv.lead.status}
                </span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs mt-1"
                onClick={() => router.push(`/leads?id=${selectedConv.lead!.id}`)}>
                View Lead <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </section>
          )}

          {selectedConv.campaign && (
            <section className="p-4 border-b space-y-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Campaign
              </h3>
              <p className="font-medium text-sm">{selectedConv.campaign.name}</p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                  {selectedConv.campaign.campaignType}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                  selectedConv.campaign.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                )}>
                  {selectedConv.campaign.status}
                </span>
              </div>
              <Button size="sm" variant="outline" className="w-full text-xs mt-1"
                onClick={() => router.push(`/campaigns/${selectedConv.campaign!.id}`)}>
                View Campaign <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </section>
          )}

          <section className="p-4 space-y-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timeline
            </h3>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p>Started: {format(new Date(selectedConv.createdAt), 'MMM d, HH:mm')}</p>
              <p>Updated: {format(new Date(selectedConv.updatedAt), 'MMM d, HH:mm')}</p>
              <p>{selectedConv.messages.filter(m => !m.id.startsWith('opt-')).length} messages</p>
            </div>
          </section>
        </aside>
      )}
    </div>
  )
}
