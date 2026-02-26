

'use client'

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
  MoreVertical,
  Settings,
  HelpCircle,
  FileText,
  Download,
  Share2,
  Bookmark,
  Flag
} from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  actions?: {
    primary?: {
      text: string
      onClick: () => void
      icon?: React.ComponentType<{ className?: string }>
    }
    secondary?: Array<{
      text: string
      onClick: () => void
      icon?: React.ComponentType<{ className?: string }>
    }>
  }
  // Backward compatibility - deprecated
  action?: React.ReactNode
  breadcrumb?: Array<{
    text: string
    href?: string
  }>
}

export function PageHeader({ 
  title, 
  description, 
  badge,
  actions,
  action, // Legacy support
  breadcrumb 
}: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-6 mb-8">
      {breadcrumb && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                <span className={`text-sm ${
                  index === breadcrumb.length - 1 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || 'default'}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-gray-600 max-w-2xl">{description}</p>
          )}
        </div>
        
        {(actions || action) && (
          <div className="flex items-center gap-3 ml-6">
            {/* Legacy action support */}
            {action && !actions && (
              <div>{action}</div>
            )}
            
            {/* New actions API */}
            {actions && (
              <>
                {/* Secondary actions */}
                {actions.secondary && actions.secondary.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {actions.secondary.map((actionItem, index) => {
                        const Icon = actionItem.icon
                        return (
                          <DropdownMenuItem
                            key={index}
                            onClick={actionItem.onClick}
                            className="flex items-center cursor-pointer"
                          >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            {actionItem.text}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Primary action */}
                {actions.primary && (
                  <Button onClick={actions.primary.onClick}>
                    {actions.primary.icon && (
                      <actions.primary.icon className="mr-2 h-4 w-4" />
                    )}
                    {actions.primary.text}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Preset configurations for common pages
export const pageHeaderConfigs = {
  settings: {
    title: "Settings",
    description: "Manage your account preferences and configuration",
    actions: {
      secondary: [
        {
          text: "Help & Support",
          onClick: () => window.open('/help', '_blank'),
          icon: HelpCircle
        },
        {
          text: "Documentation",
          onClick: () => window.open('/docs', '_blank'),
          icon: FileText
        }
      ]
    }
  },
  
  billing: {
    title: "Billing & Usage",
    description: "Manage your subscription and monitor usage",
    actions: {
      primary: {
        text: "Upgrade Plan",
        onClick: () => window.location.href = '/pricing'
      },
      secondary: [
        {
          text: "Download Invoice",
          onClick: () => console.log('Download invoice'),
          icon: Download
        },
        {
          text: "Billing Support",
          onClick: () => window.open('/support/billing', '_blank'),
          icon: HelpCircle
        }
      ]
    }
  },
  
  superAdmin: {
    title: "Super Admin Dashboard",
    description: "Platform overview and management",
    badge: {
      text: "Admin Access",
      variant: "destructive" as const
    },
    actions: {
      secondary: [
        {
          text: "System Settings",
          onClick: () => window.location.href = '/super-admin/settings',
          icon: Settings
        },
        {
          text: "Export Data",
          onClick: () => console.log('Export data'),
          icon: Download
        },
        {
          text: "View Logs",
          onClick: () => window.location.href = '/super-admin/logs',
          icon: FileText
        }
      ]
    }
  },
  
  pricing: {
    title: "Choose Your Plan",
    description: "Scale your outreach with our powerful AI-driven platform",
    actions: {
      secondary: [
        {
          text: "Compare Features",
          onClick: () => console.log('Compare features'),
          icon: FileText
        },
        {
          text: "Contact Sales",
          onClick: () => window.open('/contact-sales', '_blank'),
          icon: HelpCircle
        }
      ]
    }
  }
}
