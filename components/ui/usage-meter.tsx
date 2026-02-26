'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageCircle, Phone, Users, Zap } from 'lucide-react'

interface UsageMeterProps {
  title: string
  current: number
  limit: number | null
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  suffix?: string
}

export function UsageMeter({ 
  title, 
  current, 
  limit, 
  icon, 
  color = 'blue',
  suffix = ''
}: UsageMeterProps) {
  const percentage = limit ? Math.min((current / limit) * 100, 100) : 0
  const isUnlimited = limit === null
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-50'
      case 'purple':
        return 'text-purple-600 bg-purple-50'
      case 'orange':
        return 'text-orange-600 bg-orange-50'
      case 'red':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {current.toLocaleString()}
              {suffix && <span className="text-sm font-normal text-gray-500"> {suffix}</span>}
            </span>
            {isUnlimited ? (
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Unlimited
              </Badge>
            ) : (
              <span className="text-sm text-gray-500">
                / {limit?.toLocaleString()}
              </span>
            )}
          </div>
          
          {!isUnlimited && limit && (
            <>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-background': getProgressColor(percentage)
                } as any}
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{percentage.toFixed(1)}% used</span>
                <span>{((limit - current)).toLocaleString()} remaining</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface UsageDashboardProps {
  usage: {
    emails: { current: number; limit: number | null }
    sms: { current: number; limit: number | null }
    voiceCalls: { current: number; limit: number | null }
    leads: { current: number; limit: number | null }
    apiCalls?: { current: number; limit: number | null }
  }
}

export function UsageDashboard({ usage }: UsageDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UsageMeter
        title="Emails Sent"
        current={usage.emails.current}
        limit={usage.emails.limit}
        icon={<Mail className="w-4 h-4" />}
        color="blue"
        suffix="this month"
      />
      
      <UsageMeter
        title="SMS Sent"
        current={usage.sms.current}
        limit={usage.sms.limit}
        icon={<MessageCircle className="w-4 h-4" />}
        color="green"
        suffix="this month"
      />
      
      <UsageMeter
        title="Voice Calls"
        current={usage.voiceCalls.current}
        limit={usage.voiceCalls.limit}
        icon={<Phone className="w-4 h-4" />}
        color="purple"
        suffix="this month"
      />
      
      <UsageMeter
        title="Leads Generated"
        current={usage.leads.current}
        limit={usage.leads.limit}
        icon={<Users className="w-4 h-4" />}
        color="orange"
        suffix="this month"
      />
      
      {usage.apiCalls && (
        <UsageMeter
          title="API Calls"
          current={usage.apiCalls.current}
          limit={usage.apiCalls.limit}
          icon={<Zap className="w-4 h-4" />}
          color="red"
          suffix="this month"
        />
      )}
    </div>
  )
}
