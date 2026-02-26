'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  MessageSquare,
  Target,
  Share2,
  Key,
  CreditCard,
  Crown,
  Shield,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [userRole, setUserRole] = useState<string>('')
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('')
  
  useEffect(() => {
    if (session?.user?.email) {
      // Fetch user role and subscription status
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setUserRole(data.role || 'USER')
          setSubscriptionStatus(data.subscriptionStatus || 'TRIAL')
        })
        .catch(console.error)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Reach Out</span>
          </div>
        </div>
      </nav>
    )
  }

  if (!session) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Reach Out</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AI Reach Out</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'flex items-center space-x-2',
                      isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Billing/Pricing Button */}
          <Link href="/billing">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Billing</span>
              {subscriptionStatus === 'TRIAL' && (
                <Badge variant="secondary" className="text-xs">
                  Trial
                </Badge>
              )}
            </Button>
          </Link>

          {/* Upgrade Button for trial users */}
          {subscriptionStatus === 'TRIAL' && (
            <Link href="/pricing">
              <Button size="sm" className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Crown className="h-4 w-4" />
                <span className="hidden md:inline">Upgrade</span>
              </Button>
            </Link>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{session.user?.firstName || session.user?.name}</span>
                {userRole === 'SUPER_ADMIN' && (
                  <Badge variant="destructive" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                  {session.user?.companyName && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.companyName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Billing & Subscription */}
              <DropdownMenuItem asChild>
                <Link href="/billing" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing & Usage</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="flex items-center">
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Upgrade Plan</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/social-media" className="flex items-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Social Media</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings?tab=api-keys" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </Link>
              </DropdownMenuItem>
              
              {/* Super Admin Access */}
              {userRole === 'SUPER_ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/super-admin" className="flex items-center text-purple-600">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Super Admin</span>
                      <Badge variant="secondary" className="ml-auto">
                        Admin
                      </Badge>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden mt-3 flex items-center space-x-1 overflow-x-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'flex items-center space-x-2 whitespace-nowrap',
                  isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
