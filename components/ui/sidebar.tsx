'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { ScrollArea } from './scroll-area'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  navItems: {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
  }[]
  title?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Sidebar({ navItems, title = "Navigation", icon: Icon, className, ...props }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("w-64 bg-white border-r border-gray-200 flex flex-col", className)} {...props}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-blue-600" />}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const ItemIcon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-10',
                    isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  <ItemIcon className="w-4 h-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
