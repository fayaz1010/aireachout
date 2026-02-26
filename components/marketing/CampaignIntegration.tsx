'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Users, 
  TrendingUp,
  Target,
  ArrowRight,
  Play,
  Pause,
  BarChart3,
  Zap,
  Rocket,
  Linkedin
} from 'lucide-react'

const strategicCampaigns = [
  {
    id: 'freemium-nurture',
    strategyName: 'Freemium + Product-Led Growth',
    campaignName: 'Free Trial Conversion Sequence',
    type: 'EMAIL',
    status: 'ACTIVE',
    objective: 'Convert free users to paid subscribers',
    progress: 75,
    metrics: { sent: 2450, opened: 1225, clicked: 367, converted: 89, revenue: 111250 },
    channels: ['email', 'in-app'],
    nextAction: 'Add usage-based triggers',
    roi: 485
  },
  {
    id: 'content-lead-gen',
    strategyName: 'Content Marketing + SEO',
    campaignName: 'Bottom-Funnel Content Leads',
    type: 'MULTI_CHANNEL',
    status: 'ACTIVE',
    objective: 'Convert content readers to trials',
    progress: 60,
    metrics: { sent: 1890, opened: 1134, clicked: 227, converted: 34, revenue: 42500 },
    channels: ['email', 'linkedin'],
    nextAction: 'Create comparison landing pages',
    roi: 312
  },
  {
    id: 'referral-outreach',
    strategyName: 'Customer Referral Program',
    campaignName: 'Customer Referral Activation',
    type: 'EMAIL',
    status: 'PLANNING',
    objective: 'Activate existing customers as referrers',
    progress: 25,
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
    channels: ['email', 'sms'],
    nextAction: 'Launch double-sided incentive program',
    roi: 0
  },
  {
    id: 'partnership-warm',
    strategyName: 'Strategic Partnership Marketing',
    campaignName: 'Partner Channel Warm Outreach',
    type: 'LINKEDIN',
    status: 'DRAFT',
    objective: 'Build strategic partnerships',
    progress: 10,
    metrics: { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
    channels: ['linkedin', 'email'],
    nextAction: 'Identify integration partners',
    roi: 0
  }
]

const campaignTemplates = [
  {
    strategy: 'Freemium + Product-Led Growth',
    templates: ['Free Trial Onboarding Sequence', 'Usage Limit Reached Notifications', 'Feature Upgrade Prompts', 'Success Story Social Proof']
  },
  {
    strategy: 'Content Marketing + SEO',
    templates: ['Content Download Follow-up', 'Webinar Registration Sequence', 'Case Study Promotion', 'Tool/Calculator Lead Nurture']
  },
  {
    strategy: 'Customer Referral Program',
    templates: ['Referral Program Introduction', 'Referral Reward Notifications', 'Referral Success Celebrations', 'Referral Reminder Campaigns']
  },
  {
    strategy: 'Strategic Partnership Marketing',
    templates: ['Partnership Proposal Outreach', 'Integration Announcement', 'Co-marketing Campaign', 'Partner Success Stories']
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'PLANNING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'DRAFT': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
  }
}

export default function CampaignIntegration() {
  return (
    <div className="space-y-6">
      {/* Strategy-Powered Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 text-violet-500" />
            Strategy-Powered Campaigns
          </CardTitle>
          <CardDescription>
            Multi-channel campaigns generated from your AI marketing strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategicCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{campaign.campaignName}</h4>
                      <Badge variant="outline" className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{campaign.strategyName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{campaign.objective}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="text-sm font-semibold text-violet-400">{campaign.roi > 0 ? `${campaign.roi}%` : '—'}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-1.5" />
                </div>

                {/* Metrics */}
                {campaign.metrics.sent > 0 && (
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { label: 'Sent', value: campaign.metrics.sent.toLocaleString() },
                      { label: 'Opened', value: campaign.metrics.opened.toLocaleString() },
                      { label: 'Clicked', value: campaign.metrics.clicked.toLocaleString() },
                      { label: 'Converted', value: campaign.metrics.converted },
                      { label: 'Revenue', value: `$${(campaign.metrics.revenue / 1000).toFixed(0)}k` },
                    ].map((m) => (
                      <div key={m.label}>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-sm font-semibold">{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Channels + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {campaign.channels.map((ch) => (
                      <div key={ch} className="flex items-center gap-1 text-xs text-muted-foreground">
                        {ch === 'email' && <Mail className="w-3 h-3" />}
                        {ch === 'linkedin' && <Linkedin className="w-3 h-3" />}
                        {ch === 'sms' && <Phone className="w-3 h-3" />}
                        {ch === 'in-app' && <Zap className="w-3 h-3" />}
                        <span className="capitalize">{ch}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'ACTIVE' ? (
                      <Button size="sm" variant="outline">
                        <Pause className="w-3 h-3 mr-1" />Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                        <Play className="w-3 h-3 mr-1" />Launch
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-3 h-3 mr-1" />Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-500" />
            Strategic Campaign Templates
          </CardTitle>
          <CardDescription>
            Pre-built campaign templates aligned with your marketing strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaignTemplates.map((category, index) => (
              <div key={index} className="border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-violet-400 text-sm">{category.strategy}</h4>
                <div className="space-y-2">
                  {category.templates.map((template, templateIndex) => (
                    <div key={templateIndex} className="flex items-center justify-between p-2 hover:bg-white/5 rounded">
                      <span className="text-sm">{template}</span>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>
            Next steps to optimize your marketing-driven outreach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-l-green-500 pl-4">
              <h4 className="font-semibold text-green-400">High Priority</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Launch the Customer Referral Program campaign — potential 50% CAC reduction
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Create Referral Campaign
              </Button>
            </div>
            <div className="border-l-4 border-l-blue-500 pl-4">
              <h4 className="font-semibold text-blue-400">Medium Priority</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Add usage-based triggers to your freemium conversion sequence
              </p>
              <Button size="sm" variant="outline">
                Optimize Freemium Flow
              </Button>
            </div>
            <div className="border-l-4 border-l-orange-500 pl-4">
              <h4 className="font-semibold text-orange-400">Strategic Initiative</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Begin partnership outreach to build integration ecosystem
              </p>
              <Button size="sm" variant="outline">
                Start Partnership Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
