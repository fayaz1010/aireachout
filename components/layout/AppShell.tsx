'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<string>('USER')
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('TRIAL')
  const [inboxUnread, setInboxUnread] = useState(0)

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--aurora-bg)' }}>
      {/* Sidebar */}
      <Sidebar userRole={userRole} inboxUnread={inboxUnread} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar userRole={userRole} subscriptionStatus={subscriptionStatus} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
