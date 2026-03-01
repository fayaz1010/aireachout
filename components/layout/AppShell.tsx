'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

// Pages that manage their own full-height layout (no padding wrapper, no scroll on main)
const FULL_HEIGHT_ROUTES = ['/inbox']

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>('USER')
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('TRIAL')
  const [inboxUnread, setInboxUnread] = useState(0)
  const isFullHeight = FULL_HEIGHT_ROUTES.some(r => pathname?.startsWith(r))

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          setUserRole(data.role || 'USER')
          setSubscriptionStatus(data.subscriptionStatus || 'TRIAL')
        })
        .catch(console.error)
    }
  }, [session?.user?.email])

  // Poll unread inbox count every 30 seconds
  useEffect(() => {
    if (!session?.user?.email) return
    const fetchUnread = () =>
      fetch('/api/inbox/unread')
        .then(r => r.json())
        .then(d => setInboxUnread(d.count ?? 0))
        .catch(() => {})
    fetchUnread()
    const t = setInterval(fetchUnread, 30_000)
    return () => clearInterval(t)
  }, [session?.user?.email])

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--aurora-bg)' }}>
      {/* Sidebar */}
      <Sidebar userRole={userRole} inboxUnread={inboxUnread} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar userRole={userRole} subscriptionStatus={subscriptionStatus} />

        {/* Page content */}
        <main className={cn(
          'flex-1 min-h-0',
          isFullHeight
            ? 'overflow-hidden flex flex-col'
            : 'overflow-y-auto scrollbar-thin'
        )}>
          {isFullHeight ? children : (
            <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
