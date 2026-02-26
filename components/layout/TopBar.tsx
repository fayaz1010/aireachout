'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  Bell,
  Search,
  LogOut,
  Settings,
  CreditCard,
  Crown,
  Shield,
  User,
  X,
  Flame,
  MessageSquare,
  Phone,
  Mail,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  type: 'hot_lead' | 'message' | 'call' | 'campaign'
  title: string
  body: string
  time: string
  read: boolean
  href?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'hot_lead',
    title: 'Hot Lead Alert',
    body: 'Sarah Johnson just opened your email',
    time: '2m ago',
    read: false,
    href: '/leads',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    body: 'Mike Chen replied in the inbox',
    time: '15m ago',
    read: false,
    href: '/inbox',
  },
  {
    id: '3',
    type: 'campaign',
    title: 'Campaign Complete',
    body: '"Q4 Outreach" sent to 1,240 leads',
    time: '1h ago',
    read: true,
    href: '/campaigns',
  },
]

const notifIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hot_lead: Flame,
  message: MessageSquare,
  call: Phone,
  campaign: Mail,
}

const notifColors: Record<string, string> = {
  hot_lead: 'text-rose-400 bg-rose-500/10',
  message: 'text-violet-400 bg-violet-500/10',
  call: 'text-emerald-400 bg-emerald-500/10',
  campaign: 'text-blue-400 bg-blue-500/10',
}

interface TopBarProps {
  userRole?: string
  subscriptionStatus?: string
}

export function TopBar({ userRole, subscriptionStatus }: TopBarProps) {
  const { data: session } = useSession()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = () =>
    setNotifications((n) => n.map((item) => ({ ...item, read: true })))

  const userName =
    (session?.user as any)?.firstName ||
    session?.user?.name?.split(' ')[0] ||
    'User'

  const userInitials = userName.slice(0, 2).toUpperCase()

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 md:px-6"
      style={{ backgroundColor: 'var(--aurora-bg)' }}
    >
      {/* Left: Search */}
      <div className="flex-1 max-w-sm">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
            <Search className="h-4 w-4 text-aurora-text2 shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-aurora-text3 outline-none"
              placeholder="Search leads, campaigns, conversations..."
              onBlur={() => setSearchOpen(false)}
            />
            <button onClick={() => setSearchOpen(false)} className="text-aurora-text3 hover:text-aurora-text1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm text-aurora-text3 hover:border-white/10 hover:bg-white/5 hover:text-aurora-text2 transition-all w-full max-w-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] font-mono opacity-60 border border-white/10 rounded px-1 py-0.5">
              ⌘K
            </span>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Upgrade CTA */}
        {subscriptionStatus === 'TRIAL' && (
          <Link href="/pricing">
            <Button
              size="sm"
              className="hidden sm:flex items-center gap-1.5 aurora-gradient text-white text-xs h-8 hover:opacity-90 transition-opacity shadow-aurora-sm"
            >
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          </Link>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen)
              setUserOpen(false)
            }}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-lg text-aurora-text2 transition-all',
              'hover:bg-white/5 hover:text-aurora-text1',
              notifOpen && 'bg-white/5 text-aurora-text1'
            )}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="notification-badge">{unread}</span>}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 rounded-xl border border-white/[0.08] bg-aurora-surface shadow-glass z-50 overflow-hidden animate-scale-in">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-white/[0.04]">
                {notifications.map((n) => {
                  const Icon = notifIcons[n.type] || Bell
                  return (
                    <Link
                      key={n.id}
                      href={n.href || '#'}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((item) =>
                            item.id === n.id ? { ...item, read: true } : item
                          )
                        )
                        setNotifOpen(false)
                      }}
                      className={cn(
                        'flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors',
                        !n.read && 'bg-violet-500/[0.04]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          notifColors[n.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-aurora-text2 mt-0.5 truncate">{n.body}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-aurora-text3">{n.time}</span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <Link
                  href="/settings?tab=notifications"
                  className="block text-center text-xs text-aurora-text2 hover:text-aurora-text1 transition-colors"
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setUserOpen(!userOpen)
              setNotifOpen(false)
            }}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1 text-aurora-text2 transition-all',
              'hover:bg-white/5 hover:text-aurora-text1',
              userOpen && 'bg-white/5 text-aurora-text1'
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full aurora-gradient text-xs font-bold text-white shadow-aurora-sm">
              {userInitials}
            </div>
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
            <ChevronDown
              className={cn(
                'hidden sm:block h-3.5 w-3.5 transition-transform',
                userOpen && 'rotate-180'
              )}
            />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-10 w-56 rounded-xl border border-white/[0.08] bg-aurora-surface shadow-glass z-50 overflow-hidden animate-scale-in">
              {/* User info */}
              <div className="border-b border-white/[0.06] px-4 py-3">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-aurora-text2 truncate mt-0.5">
                  {session?.user?.email}
                </p>
                {userRole === 'SUPER_ADMIN' && (
                  <Badge className="mt-1.5 text-[10px] bg-violet-500/20 text-violet-300 border-violet-500/20">
                    Super Admin
                  </Badge>
                )}
              </div>

              <div className="py-1.5">
                <MenuLink href="/settings" icon={Settings} onClick={() => setUserOpen(false)}>
                  Settings
                </MenuLink>
                <MenuLink href="/billing" icon={CreditCard} onClick={() => setUserOpen(false)}>
                  Billing
                </MenuLink>
                <MenuLink href="/pricing" icon={Crown} onClick={() => setUserOpen(false)}>
                  Upgrade Plan
                </MenuLink>
                {userRole === 'SUPER_ADMIN' && (
                  <MenuLink href="/super-admin" icon={Shield} onClick={() => setUserOpen(false)}>
                    Super Admin
                  </MenuLink>
                )}
              </div>

              <div className="border-t border-white/[0.06] py-1.5">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuLink({
  href,
  icon: Icon,
  onClick,
  children,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-aurora-text2 hover:bg-white/[0.03] hover:text-aurora-text1 transition-colors"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}
