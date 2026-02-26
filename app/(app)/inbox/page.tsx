'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Bot,
  Sparkles,
  Flame,
  Mail,
  MessageCircle,
  Hash,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  CheckCheck,
  Clock,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Conversation {
  id: string
  contactName: string
  contactEmail?: string
  contactPhone?: string
  channel: string
  status: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  sentiment?: string
  isHotLead?: boolean
  campaignName?: string
  avatar?: string
}

interface Message {
  id: string
  content: string
  direction: 'INBOUND' | 'OUTBOUND'
  createdAt: string
  senderName?: string
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@techcorp.com',
    channel: 'EMAIL',
    status: 'OPEN',
    lastMessage: "I'm interested in learning more about your platform...",
    lastMessageTime: '2m ago',
    unreadCount: 2,
    sentiment: 'POSITIVE',
    isHotLead: true,
    campaignName: 'Q4 Outreach',
  },
  {
    id: '2',
    contactName: 'Mike Chen',
    contactEmail: 'mike@growthco.com',
    channel: 'WHATSAPP',
    status: 'OPEN',
    lastMessage: 'Can we schedule a demo call?',
    lastMessageTime: '15m ago',
    unreadCount: 1,
    sentiment: 'POSITIVE',
  },
  {
    id: '3',
    contactName: 'Lisa Wang',
    contactEmail: 'lisa@startup.io',
    channel: 'SMS',
    status: 'OPEN',
    lastMessage: 'Thanks for reaching out!',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    sentiment: 'NEUTRAL',
  },
  {
    id: '4',
    contactName: 'Alex Rivera',
    contactEmail: 'alex@salespro.com',
    channel: 'LINKEDIN',
    status: 'PENDING',
    lastMessage: 'Interesting proposal, let me think about it.',
    lastMessageTime: '3h ago',
    unreadCount: 0,
    sentiment: 'NEUTRAL',
  },
  {
    id: '5',
    contactName: 'Emma Davis',
    contactEmail: 'emma@company.com',
    channel: 'EMAIL',
    status: 'RESOLVED',
    lastMessage: 'Great, I signed up for the trial.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    sentiment: 'POSITIVE',
    campaignName: 'Enterprise Outreach',
  },
]

const MOCK_MESSAGES: Message[] = [
  { id: '1', content: 'Hi, I saw your outreach email about your AI platform.', direction: 'INBOUND', createdAt: '10:00 AM', senderName: 'Sarah Johnson' },
  { id: '2', content: "Hi Sarah! Thanks for reaching out. I'd love to tell you more about how ReachOut AI can help your business.", direction: 'OUTBOUND', createdAt: '10:02 AM', senderName: 'You' },
  { id: '3', content: "That sounds interesting! We're looking for a solution to automate our lead generation. What makes your platform different?", direction: 'INBOUND', createdAt: '10:05 AM', senderName: 'Sarah Johnson' },
  { id: '4', content: "Great question! Our platform combines AI-powered lead generation with a unified contact center. You can find leads, send personalized outreach, and manage all your conversations in one place.", direction: 'OUTBOUND', createdAt: '10:07 AM', senderName: 'You' },
  { id: '5', content: "I'm interested in learning more about your platform. Can we schedule a demo?", direction: 'INBOUND', createdAt: '10:15 AM', senderName: 'Sarah Johnson' },
]

const channelIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  EMAIL: { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  WHATSAPP: { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  SMS: { icon: Hash, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  TELEGRAM: { icon: Send, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  LINKEDIN: { icon: Linkedin, color: 'text-blue-300', bg: 'bg-blue-500/10' },
  TWITTER: { icon: Twitter, color: 'text-sky-300', bg: 'bg-sky-500/10' },
  INSTAGRAM: { icon: Instagram, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  FACEBOOK: { icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  VOICE_CALL: { icon: Phone, color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

const sentimentColors: Record<string, string> = {
  POSITIVE: 'text-emerald-400',
  NEUTRAL: 'text-amber-400',
  NEGATIVE: 'text-red-400',
}

function ConversationItem({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation
  selected: boolean
  onClick: () => void
}) {
  const ch = channelIcons[conv.channel] || channelIcons.EMAIL
  const Icon = ch.icon
  const initials = conv.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-start gap-3 px-3 py-3 transition-all',
        selected
          ? 'bg-violet-500/10 border-r-2 border-violet-500'
          : 'hover:bg-white/[0.02] border-r-2 border-transparent'
      )}
    >
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white">
          {initials}
        </div>
        <div className={cn('absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-aurora-bg', ch.bg)}>
          <Icon className={cn('h-2 w-2', ch.color)} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn('text-xs font-semibold truncate', selected ? 'text-white' : 'text-foreground')}>
              {conv.contactName}
            </span>
            {conv.isHotLead && <Flame className="h-3 w-3 text-rose-400 shrink-0" />}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{conv.lastMessageTime}</span>
        </div>
        <p className={cn('text-[11px] truncate', conv.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground')}>
          {conv.lastMessage}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {conv.campaignName && (
            <span className="text-[10px] text-violet-400 truncate">via {conv.campaignName}</span>
          )}
          {conv.unreadCount > 0 && (
            <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white px-1">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

const STATUS_TABS = ['All', 'Open', 'Pending', 'Resolved']

export default function InboxPage() {
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [selected, setSelected] = useState<Conversation | null>(MOCK_CONVERSATIONS[0])
  const [messages] = useState<Message[]>(MOCK_MESSAGES)
  const [messageInput, setMessageInput] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All')
  const [showAI, setShowAI] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selected])

  const filtered = conversations.filter((c) => {
    const matchTab = tab === 'All' || c.status === tab.toUpperCase()
    const matchSearch = !search || c.contactName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div className="fade-in -m-4 md:-m-6 lg:-m-8 h-[calc(100vh-56px)] flex overflow-hidden">
      {/* Conversation list */}
      <div
        className={cn(
          'flex flex-col border-r border-white/[0.06]',
          selected ? 'hidden md:flex w-72 lg:w-80 shrink-0' : 'flex w-full md:w-72 lg:w-80 shrink-0'
        )}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-3">
          <h2 className="text-sm font-semibold text-foreground">Inbox</h2>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
              <Filter className="h-3.5 w-3.5" />
            </button>
            <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5">
            <Search className="h-3 w-3 text-muted-foreground shrink-0" />
            <input
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/[0.06]">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-1 rounded-md text-[11px] font-medium transition-all',
                tab === t
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-white/[0.03]">
          {filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              selected={selected?.id === conv.id}
              onClick={() => setSelected(conv)}
            />
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {selected ? (
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* Chat header */}
          <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4 shrink-0" style={{ backgroundColor: 'var(--aurora-bg)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white">
                {selected.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {selected.contactName}
                  {selected.isHotLead && <Flame className="h-3.5 w-3.5 text-rose-400" />}
                </p>
                <p className="text-xs text-muted-foreground">{selected.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
                <Phone className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowAI(!showAI)}
                className={cn(
                  'h-7 px-2 flex items-center gap-1 rounded-md text-xs transition-colors',
                  showAI
                    ? 'text-violet-300 bg-violet-500/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <Bot className="h-3.5 w-3.5" /> AI Assist
              </button>
              <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Messages */}
            <div className="flex flex-1 flex-col min-w-0">
              {/* Campaign source badge */}
              {selected.campaignName && (
                <div className="flex items-center justify-center px-4 py-2 border-b border-white/[0.04]">
                  <span className="text-[11px] text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                    Conversation started via campaign: {selected.campaignName}
                  </span>
                </div>
              )}

              {/* Message list */}
              <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2.5', msg.direction === 'OUTBOUND' && 'flex-row-reverse')}
                  >
                    {msg.direction === 'INBOUND' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full aurora-gradient text-[10px] font-bold text-white mt-0.5">
                        {selected.contactName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div className={cn('max-w-[65%]', msg.direction === 'OUTBOUND' && 'items-end flex flex-col')}>
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.direction === 'OUTBOUND'
                            ? 'aurora-gradient text-white rounded-tr-sm'
                            : 'bg-white/[0.05] border border-white/[0.06] text-foreground rounded-tl-sm'
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-muted-foreground">{msg.createdAt}</span>
                        {msg.direction === 'OUTBOUND' && <CheckCheck className="h-3 w-3 text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* AI quick suggestions */}
              <div className="border-t border-white/[0.04] px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {[
                  'Happy to schedule a demo! When works for you?',
                  'Could you share more about your use case?',
                  "I'll send over our pricing shortly.",
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setMessageInput(s)}
                    className="shrink-0 text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1.5 rounded-full hover:bg-violet-500/20 transition-colors whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-white/[0.06] px-4 py-3" style={{ backgroundColor: 'var(--aurora-bg)' }}>
                <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                  <textarea
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none min-h-[20px] max-h-24 py-0.5 leading-5"
                    placeholder="Type a message..."
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        setMessageInput('')
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                      <Paperclip className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className={cn(
                        'h-7 w-7 flex items-center justify-center rounded-lg transition-all',
                        messageInput
                          ? 'aurora-gradient text-white shadow-aurora-sm'
                          : 'bg-white/5 text-muted-foreground cursor-not-allowed'
                      )}
                      disabled={!messageInput}
                      onClick={() => setMessageInput('')}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI assist sidebar */}
            {showAI && (
              <div className="hidden lg:flex w-64 shrink-0 flex-col border-l border-white/[0.06] overflow-y-auto scrollbar-thin" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-semibold text-foreground">AI Insights</span>
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  {/* Sentiment */}
                  <div className="glass-card p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Sentiment</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full w-4/5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 shrink-0">Positive</span>
                    </div>
                  </div>

                  {/* Intent */}
                  <div className="glass-card p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Detected Intent</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Schedule Demo', confidence: 92 },
                        { label: 'Request Pricing', confidence: 67 },
                      ].map((intent) => (
                        <div key={intent.label} className="flex items-center justify-between">
                          <span className="text-xs text-foreground">{intent.label}</span>
                          <span className="text-xs font-semibold text-violet-400">{intent.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="glass-card p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Contact Info</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="text-foreground font-medium">{selected.contactName}</p>
                      {selected.contactEmail && <p>{selected.contactEmail}</p>}
                      {selected.campaignName && (
                        <p className="text-violet-400">via {selected.campaignName}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1.5">
                    <Button size="sm" className="w-full aurora-gradient text-white text-xs gap-1.5 hover:opacity-90">
                      <Sparkles className="h-3 w-3" /> Generate Reply
                    </Button>
                    <Button variant="outline" size="sm" className="w-full text-xs border-white/10 gap-1.5">
                      <Phone className="h-3 w-3" /> Schedule Call
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl aurora-gradient-subtle mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-foreground">Select a conversation</p>
            <p className="text-xs text-muted-foreground mt-1">Choose from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
