'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  DollarSign,
  Users,
  Zap,
  ArrowRight,
  Lightbulb
} from 'lucide-react'

// Strategic insights based on SaaS best practices
const strategicInsights = [
  {
    id: 'ltv-cac-optimization',
    type: 'opportunity',
    priority: 'high',
    title: 'Optimize LTV:CAC Ratio',
    description: 'Your current LTV:CAC ratio of 14:1 is excellent. Focus on scaling successful channels.',
    impact: 'High Revenue Growth',
    action: 'Increase budget allocation to top-performing channels by 40%',
    metrics: {
      current: '14:1',
      target: '15:1',
      improvement: '+7% revenue'
    }
  },
  {
    id: 'trial-conversion',
    type: 'critical',
    priority: 'urgent',
    title: 'Improve Trial-to-Paid Conversion',
    description: 'Industry average is 15-20%. Your 3.2% suggests onboarding issues.',
    impact: 'Immediate Revenue Impact',
    action: 'Implement product-led growth tactics and improve onboarding flow',
    metrics: {
      current: '3.2%',
      target: '8%',
      improvement: '+150% conversions'
    }
  },
  {
    id: 'referral-program',
    type: 'opportunity',
    priority: 'high',
    title: 'Launch Customer Referral Program',
    description: 'Referral programs can reduce CAC by 50% and increase LTV by 25%.',
    impact: 'Exponential Growth',
    action: 'Implement double-sided incentive referral system',
    metrics: {
      current: '0%',
      target: '20%',
      improvement: '50% CAC reduction'
    }
  },
  {
    id: 'content-seo',
    type: 'opportunity',
    priority: 'medium',
    title: 'Scale Content Marketing',
    description: 'Content marketing generates 3x more leads than paid search at 62% lower cost.',
    impact: 'Sustainable Growth',
    action: 'Create bottom-funnel content targeting buyer keywords',
    metrics: {
      current: '15%',
      target: '35%',
      improvement: '133% lead increase'
    }
  }
]

const channelPerformance = [
  {
    channel: 'Email Marketing',
    performance: 85,
    cac: 45,
    conversion: 4.2,
    trend: 'up',
    recommendation: 'Scale up - excellent performance'
  },
  {
    channel: 'Content Marketing',
    performance: 72,
    cac: 38,
    conversion: 2.8,
    trend: 'up',
    recommendation: 'Increase content production'
  },
  {
    channel: 'Paid Search',
    performance: 58,
    cac: 125,
    conversion: 1.9,
    trend: 'down',
    recommendation: 'Optimize keywords and landing pages'
  },
  {
    channel: 'Social Media',
    performance: 45,
    cac: 89,
    conversion: 1.2,
    trend: 'flat',
    recommendation: 'Test different platforms and content'
  }
]

const competitiveIntel = [
  {
    competitor: 'HubSpot',
    strategy: 'Freemium + Content',
    threat: 'High',
    opportunity: 'Position as simpler alternative',
    action: 'Emphasize ease-of-use in messaging'
  },
  {
    competitor: 'Mailchimp',
    strategy: 'Email-first approach',
    threat: 'Medium',
    opportunity: 'Multi-channel advantage',
    action: 'Highlight integrated outreach capabilities'
  }
]

export default function MarketingInsights() {
  return (
    <div className="space-y-6">
      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Strategic Growth Insights
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on SaaS best practices and your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategicInsights.map((insight) => (
              <div 
                key={insight.id} 
                className={`border rounded-lg p-4 ${
                  insight.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                  insight.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {insight.type === 'critical' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : insight.type === 'opportunity' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                    <h4 className="font-semibold">{insight.title}</h4>
                  </div>
                  <Badge 
                    variant={
                      insight.priority === 'urgent' ? 'destructive' :
                      insight.priority === 'high' ? 'default' : 'secondary'
                    }
                  >
                    {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">CURRENT</p>
                    <p className="text-lg font-semibold">{insight.metrics.current}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">TARGET</p>
                    <p className="text-lg font-semibold text-green-600">{insight.metrics.target}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">IMPACT</p>
                    <p className="text-lg font-semibold text-blue-600">{insight.metrics.improvement}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{insight.impact}</p>
                    <p className="text-xs text-gray-500">{insight.action}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Implement
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Channel Performance Analysis
          </CardTitle>
          <CardDescription>
            Optimize your marketing mix based on performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelPerformance.map((channel, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{channel.channel}</h4>
                  <div className="flex items-center gap-2">
                    <TrendingUp 
                      className={`w-4 h-4 ${
                        channel.trend === 'up' ? 'text-green-500' :
                        channel.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`} 
                    />
                    <Badge variant={channel.performance > 70 ? 'default' : 'secondary'}>
                      {channel.performance}% Score
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance Score</span>
                    <span>{channel.performance}%</span>
                  </div>
                  <Progress value={channel.performance} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">CAC</p>
                    <p className="font-semibold">${channel.cac}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversion</p>
                    <p className="font-semibold">{channel.conversion}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trend</p>
                    <p className={`font-semibold ${
                      channel.trend === 'up' ? 'text-green-600' :
                      channel.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {channel.trend === 'up' ? '↗ Growing' :
                       channel.trend === 'down' ? '↘ Declining' : '→ Stable'}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{channel.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Competitive Positioning
          </CardTitle>
          <CardDescription>
            Strategic opportunities based on competitor analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitiveIntel.map((comp, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{comp.competitor}</h4>
                  <Badge variant={comp.threat === 'High' ? 'destructive' : 'secondary'}>
                    {comp.threat} Threat
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Their Strategy</p>
                    <p>{comp.strategy}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Our Opportunity</p>
                    <p className="text-green-600">{comp.opportunity}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-blue-600">Recommended Action:</p>
                  <p className="text-sm text-gray-600">{comp.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Wins
          </CardTitle>
          <CardDescription>
            Immediate actions you can take to improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <h4 className="font-semibold mb-1">Optimize Email Subject Lines</h4>
                <p className="text-sm text-gray-600">A/B test subject lines to improve open rates by 15-25%</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <h4 className="font-semibold mb-1">Create Comparison Landing Pages</h4>
                <p className="text-sm text-gray-600">Target competitor keywords with comparison content</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <h4 className="font-semibold mb-1">Implement Exit-Intent Popups</h4>
                <p className="text-sm text-gray-600">Capture abandoning visitors with compelling offers</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <h4 className="font-semibold mb-1">Add Social Proof</h4>
                <p className="text-sm text-gray-600">Display customer logos and testimonials prominently</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
