'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import {
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  Key,
  FileText,
  Database,
  Activity,
  Settings,
  BarChart3,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const superAdminNav = [
  { label: 'Overview', href: '/super-admin', icon: LayoutDashboard, exact: true },
  { label: 'Users', href: '/super-admin/users', icon: Users },
  { label: 'Billing', href: '/super-admin/billing', icon: CreditCard },
  { label: 'Plans', href: '/super-admin/plans', icon: Layers },
  { label: 'Analytics', href: '/super-admin/analytics', icon: BarChart3 },
  { label: 'API Keys', href: '/super-admin/api-keys', icon: Key },
  { label: 'Blog', href: '/super-admin/blog', icon: FileText },
  { label: 'Database', href: '/super-admin/database', icon: Database },
  { label: 'Activity', href: '/super-admin/activity', icon: Activity },
  { label: 'Settings', href: '/super-admin/settings', icon: Settings },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?error=authentication_required&callbackUrl=/super-admin')
      return
    }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard?error=access_denied')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="space-y-0">
      {/* Super Admin Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Shield className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">Super Admin</h1>
          <p className="text-xs text-muted-foreground">Platform administration & control panel</p>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="border-b border-white/[0.06] mb-6">
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-hide pb-0 -mb-px">
          {superAdminNav.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px',
                  active
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-white/20'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}
