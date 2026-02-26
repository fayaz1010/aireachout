'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Mail,
  FolderOpen,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Phone,
  Ticket,
  BookOpen,
  Settings,
  CreditCard,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeVariant?: 'default' | 'violet' | 'rose' | 'success' | 'warning'
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: 'Outreach',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Leads', href: '/leads', icon: Users },
      { name: 'Campaigns', href: '/campaigns', icon: Mail },
      { name: 'Projects', href: '/projects', icon: FolderOpen },
      { name: 'Marketing', href: '/marketing', icon: TrendingUp },
    ],
  },
  {
    label: 'Contact Center',
    items: [
      { name: 'Inbox', href: '/inbox', icon: MessageSquare },
      { name: 'Calls', href: '/calls', icon: Phone },
      { name: 'Tickets', href: '/tickets', icon: Ticket },
      { name: 'Knowledge', href: '/knowledge', icon: BookOpen },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/analytics', icon: BarChart3 },
    ],
  },
]

const bottomItems: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'nav-item group relative',
        isActive && 'active',
        collapsed && 'justify-center px-0 py-2'
      )}
      title={collapsed ? item.name : undefined}
    >
      <Icon
        className={cn(
          'nav-icon h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-violet-400' : 'text-aurora-text3 group-hover:text-aurora-text1'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          {item.badge !== undefined && (
            <span
              className={cn(
                'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                item.badgeVariant === 'rose'
                  ? 'bg-rose-500/20 text-rose-400'
                  : item.badgeVariant === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : item.badgeVariant === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-violet-500/20 text-violet-400'
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge !== undefined && (
        <span className="notification-badge">{item.badge}</span>
      )}
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-aurora-surface px-2 py-1 text-xs text-aurora-text1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 border border-white/10">
          {item.name}
        </span>
      )}
    </Link>
  )
}

interface SidebarProps {
  userRole?: string
  inboxUnread?: number
}

export function Sidebar({ userRole, inboxUnread = 0 }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(href + '/') && href !== '/')

  // Inject live badges
  const sectionsWithBadges = navSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.href === '/inbox' && inboxUnread > 0) {
        return { ...item, badge: inboxUnread > 99 ? '99+' : inboxUnread, badgeVariant: 'rose' as const }
      }
      return item
    }),
  }))

  return (
    <aside
      className={cn(
        'app-sidebar flex flex-col transition-all duration-200 overflow-hidden z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b px-3',
          'border-white/[0.06]',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <Link
          href="/dashboard"
          className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg aurora-gradient shadow-aurora-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-white">ReachOut</span>
              <span className="text-[10px] text-aurora-text2 leading-none">AI Platform</span>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-md p-1 text-aurora-text3 hover:bg-white/5 hover:text-aurora-text1 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-md text-aurora-text3 hover:bg-white/5 hover:text-aurora-text1 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2">
        {sectionsWithBadges.map((section) => (
          <div key={section.label} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-aurora-text3">
                {section.label}
              </p>
            )}
            {collapsed && <div className="mb-1 h-px bg-white/[0.04] mx-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.href)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="shrink-0 border-t border-white/[0.06] px-2 py-3 space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={isActive(item.href)}
          />
        ))}
        {userRole === 'SUPER_ADMIN' && (
          <NavLink
            item={{ name: 'Super Admin', href: '/super-admin', icon: Shield }}
            collapsed={collapsed}
            isActive={isActive('/super-admin')}
          />
        )}
      </div>
    </aside>
  )
}
