'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  Square,
  Mail,
  MessageSquare,
  Phone,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  status: string
  campaignType: string
  communicationChannels: string[]
  totalRecipients: number
  emailsSent: number
  emailsDelivered: number
  emailsOpened: number
  emailsClicked: number
  smsSent: number
  smsDelivered: number
  socialPostsCreated: number
  socialPostsPublished: number
  voiceCallsMade: number
  voiceCallsConnected: number
}

interface CampaignExecutionProps {
  campaign: Campaign
  onRefresh: () => void
}

export function CampaignExecution({ campaign, onRefresh }: CampaignExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleStartCampaign = async () => {
    setIsExecuting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      if (response.ok) {
        toast.success('Campaign started successfully!')
        onRefresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to start campaign')
      }
    } catch (error) {
      toast.error('An error occurred while starting the campaign')
    } finally {
      setIsExecuting(false)
    }
  }

  const handlePauseCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' })
      })

      if (response.ok) {
        toast.success('Campaign paused')
        onRefresh()
      } else {
        toast.error('Failed to pause campaign')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleStopCampaign = async () => {
    if (!confirm('Are you sure you want to stop this campaign? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })

      if (response.ok) {
        toast.success('Campaign stopped')
        onRefresh()
      } else {
        toast.error('Failed to stop campaign')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getChannelStats = () => {
    const stats = []
    
    if (campaign.communicationChannels.includes('EMAIL')) {
      const deliveryRate = campaign.emailsSent > 0 ? Math.round((campaign.emailsDelivered / campaign.emailsSent) * 100) : 0
      const openRate = campaign.emailsDelivered > 0 ? Math.round((campaign.emailsOpened / campaign.emailsDelivered) * 100) : 0
      
      stats.push({
        channel: 'Email',
        icon: Mail,
        sent: campaign.emailsSent,
        delivered: campaign.emailsDelivered,
        engagement: campaign.emailsOpened,
        deliveryRate,
        engagementRate: openRate,
        color: 'text-blue-600'
      })
    }

    if (campaign.communicationChannels.includes('SMS')) {
      const deliveryRate = campaign.smsSent > 0 ? Math.round((campaign.smsDelivered / campaign.smsSent) * 100) : 0
      
      stats.push({
        channel: 'SMS',
        icon: MessageSquare,
        sent: campaign.smsSent,
        delivered: campaign.smsDelivered,
        engagement: 0, // SMS replies would be tracked separately
        deliveryRate,
        engagementRate: 0,
        color: 'text-green-600'
      })
    }

    if (campaign.communicationChannels.some(ch => ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'].includes(ch))) {
      stats.push({
        channel: 'Social Media',
        icon: Share2,
        sent: campaign.socialPostsCreated,
        delivered: campaign.socialPostsPublished,
        engagement: 0, // Social engagement would be tracked separately
        deliveryRate: campaign.socialPostsCreated > 0 ? Math.round((campaign.socialPostsPublished / campaign.socialPostsCreated) * 100) : 0,
        engagementRate: 0,
        color: 'text-orange-600'
      })
    }

    if (campaign.communicationChannels.includes('VOICE_CALL')) {
      const connectionRate = campaign.voiceCallsMade > 0 ? Math.round((campaign.voiceCallsConnected / campaign.voiceCallsMade) * 100) : 0
      
      stats.push({
        channel: 'Voice Calls',
        icon: Phone,
        sent: campaign.voiceCallsMade,
        delivered: campaign.voiceCallsConnected,
        engagement: 0, // Call outcomes would be tracked separately
        deliveryRate: connectionRate,
        engagementRate: 0,
        color: 'text-purple-600'
      })
    }

    return stats
  }

  const getStatusBadge = () => {
    const statusStyles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      SENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-green-100 text-green-800',
      PAUSED: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return statusStyles[campaign.status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
  }

  const canStart = ['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)
  const canPause = campaign.status === 'SENDING'
  const canStop = ['SENDING', 'PAUSED'].includes(campaign.status)

  return (
    <div className="space-y-6">
      {/* Campaign Status & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-xl">{campaign.name}</CardTitle>
              <Badge className={getStatusBadge()}>
                {campaign.status}
              </Badge>
              <Badge variant="outline">
                {campaign.communicationChannels.length} Channel{campaign.communicationChannels.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {canStart && (
                <Button 
                  onClick={handleStartCampaign}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {campaign.status === 'DRAFT' ? 'Launch Campaign' : 'Resume'}
                </Button>
              )}
              
              {canPause && (
                <Button 
                  onClick={handlePauseCampaign}
                  variant="outline"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              
              {canStop && (
                <Button 
                  onClick={handleStopCampaign}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Multi-channel campaign targeting {campaign.totalRecipients} recipients across {campaign.communicationChannels.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="mx-auto h-8 w-8 text-gray-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{campaign.totalRecipients}</div>
              <div className="text-sm text-gray-500">Total Recipients</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {campaign.emailsSent + campaign.smsSent + campaign.socialPostsCreated + campaign.voiceCallsMade}
              </div>
              <div className="text-sm text-gray-500">Total Sent</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {campaign.emailsDelivered + campaign.smsDelivered + campaign.socialPostsPublished + campaign.voiceCallsConnected}
              </div>
              <div className="text-sm text-gray-500">Delivered/Connected</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {campaign.emailsOpened + campaign.emailsClicked}
              </div>
              <div className="text-sm text-gray-500">Total Engagement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel-Specific Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {getChannelStats().map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Icon className={`mr-2 h-4 w-4 ${stat.color}`} />
                  {stat.channel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sent:</span>
                    <span className="font-medium">{stat.sent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivered:</span>
                    <span className="font-medium">{stat.delivered}</span>
                  </div>
                  {stat.deliveryRate > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Rate:</span>
                        <span className="font-medium">{stat.deliveryRate}%</span>
                      </div>
                      <Progress value={stat.deliveryRate} className="h-2" />
                    </>
                  )}
                  {stat.engagementRate > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Engagement:</span>
                        <span className="font-medium">{stat.engagementRate}%</span>
                      </div>
                      <Progress value={stat.engagementRate} className="h-2" />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {campaign.status === 'SENDING' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Campaign in Progress</p>
                <p className="text-sm text-yellow-700">
                  Your multi-channel campaign is currently running. Messages are being sent across all selected channels.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
