'use client'

import { useState } from 'react'
import StrategyBuilder from '@/components/marketing/StrategyBuilder'
import MarketingInsights from '@/components/marketing/MarketingInsights'
import CampaignIntegration from '@/components/marketing/CampaignIntegration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  Zap,
  Trophy,
  Plus,
  ArrowRight,
  PieChart,
  LineChart
} from 'lucide-react'

// Top SaaS Marketing Strategies for Subscription Sales
const topStrategies = [
  {
    id: 'freemium',
    name: 'Freemium + Product-Led Growth',
    description: 'Let users experience value before paying - the #1 SaaS growth strategy',
    impact: 'High',
    difficulty: 'Medium',
    timeframe: '3-6 months',
    roi: '300-500%',
    tactics: ['Free trial optimization', 'In-app upgrade prompts', 'Usage-based triggers', 'Onboarding excellence']
  },
  {
    id: 'content',
    name: 'Content Marketing + SEO',
    description: 'Dominate search results with valuable content that converts',
    impact: 'High',
    difficulty: 'High',
    timeframe: '6-12 months',
    roi: '400-600%',
    tactics: ['Bottom-funnel keywords', 'Comparison pages', 'Case studies', 'Tool pages']
  },
  {
    id: 'referral',
    name: 'Customer Referral Program',
    description: 'Turn customers into growth engines with incentivized referrals',
    impact: 'Very High',
    difficulty: 'Low',
    timeframe: '1-2 months',
    roi: '500-800%',
    tactics: ['Double-sided incentives', 'Easy sharing tools', 'Gamification', 'Success tracking']
  },
  {
    id: 'partnership',
    name: 'Strategic Partnerships',
    description: 'Leverage other platforms and integrations for exponential growth',
    impact: 'Very High',
    difficulty: 'Medium',
    timeframe: '2-4 months',
    roi: '200-400%',
    tactics: ['App marketplace listings', 'Integration partnerships', 'Co-marketing', 'Channel partnerships']
  }
]

const marketingMetrics = {
  totalStrategies: 4,
  activeStrategies: 2,
  avgConversionRate: 3.2,
  monthlyGrowth: 15.8,
  cac: 89,
  ltv: 1250,
  ltvCacRatio: 14.0
}

export default function MarketingPlanningPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false)

  const handleCreateStrategy = (strategyData: any) => {
    // TODO: API call to create strategy
    console.log('Creating strategy:', strategyData)
    setShowStrategyBuilder(false)
    // Refresh strategies list
  }

  if (showStrategyBuilder) {
    return (
      <StrategyBuilder
        onSave={handleCreateStrategy}
        onCancel={() => setShowStrategyBuilder(false)}
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strategic Marketing Planning</h1>
          <p className="text-gray-600 mt-2">
            Data-driven strategies to dominate SaaS subscription sales
          </p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowStrategyBuilder(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Strategy
        </Button>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LTV:CAC Ratio</p>
                <p className="text-2xl font-bold text-green-600">{marketingMetrics.ltvCacRatio}:1</p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Target: 3:1 minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-blue-600">{marketingMetrics.monthlyGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">MoM subscriber growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CAC</p>
                <p className="text-2xl font-bold text-orange-600">${marketingMetrics.cac}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Customer acquisition cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{marketingMetrics.avgConversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Trial to paid conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Strategy Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Integration</TabsTrigger>
          <TabsTrigger value="funnels">Marketing Funnels</TabsTrigger>
          <TabsTrigger value="experiments">A/B Experiments</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Intel</TabsTrigger>
        </TabsList>

        {/* Strategy Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Top SaaS Subscription Strategies
              </CardTitle>
              <CardDescription>
                Proven strategies used by unicorn SaaS companies to achieve explosive growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topStrategies.map((strategy) => (
                  <Card key={strategy.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{strategy.name}</CardTitle>
                        <Badge variant={strategy.impact === 'Very High' ? 'default' : 'secondary'}>
                          {strategy.impact} Impact
                        </Badge>
                      </div>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">ROI</p>
                          <p className="text-green-600 font-semibold">{strategy.roi}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Timeline</p>
                          <p className="text-blue-600 font-semibold">{strategy.timeframe}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Difficulty</p>
                          <p className="text-orange-600 font-semibold">{strategy.difficulty}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-600 mb-2">Key Tactics:</p>
                        <div className="flex flex-wrap gap-2">
                          {strategy.tactics.map((tactic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tactic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        Implement Strategy
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <MarketingInsights />
        </TabsContent>

        {/* Campaign Integration Tab */}
        <TabsContent value="campaigns">
          <CampaignIntegration />
        </TabsContent>

        {/* Marketing Funnels Tab */}
        <TabsContent value="funnels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  Subscription Funnel Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Visitors → Leads</span>
                    <span className="text-sm text-gray-600">2.8%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Leads → Trials</span>
                    <span className="text-sm text-gray-600">15.2%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Trials → Customers</span>
                    <span className="text-sm text-gray-600">3.2%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Conversion</span>
                    <span className="font-bold text-green-600">1.37%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-500" />
                  Revenue Funnel Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">12,450</p>
                    <p className="text-sm text-gray-600">Monthly Visitors</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">348</p>
                    <p className="text-sm text-gray-600">Monthly Leads</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">53</p>
                    <p className="text-sm text-gray-600">Trial Signups</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">17</p>
                    <p className="text-sm text-gray-600">New Customers</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Monthly Revenue</span>
                    <span className="font-bold text-green-600">$21,250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Average Deal Size</span>
                    <span className="font-bold text-blue-600">$1,250</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* A/B Experiments Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Active Growth Experiments
              </CardTitle>
              <CardDescription>
                Data-driven tests to optimize conversion and reduce churn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">Pricing Page CTA Optimization</h4>
                      <p className="text-sm text-gray-600">Testing "Start Free Trial" vs "Get Started Free"</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Control CTR</p>
                      <p className="font-semibold">2.8%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Variant CTR</p>
                      <p className="font-semibold text-green-600">3.4% (+21%)</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Confidence</p>
                      <p className="font-semibold">87%</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">Onboarding Flow Simplification</h4>
                      <p className="text-sm text-gray-600">Reducing signup steps from 4 to 2</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Planning</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Hypothesis</p>
                      <p className="font-semibold">+25% completion</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sample Size</p>
                      <p className="font-semibold">2,000 users</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-semibold">14 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitor Intelligence Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Competitive Intelligence
              </CardTitle>
              <CardDescription>
                Monitor competitor strategies and identify market opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">HubSpot</h4>
                      <p className="text-sm text-gray-600">Market Leader - Inbound Marketing</p>
                    </div>
                    <Badge variant="destructive">High Threat</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2 text-green-600">Strengths</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Comprehensive platform</li>
                        <li>• Strong brand recognition</li>
                        <li>• Excellent content marketing</li>
                        <li>• Large partner ecosystem</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2 text-red-600">Weaknesses</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Complex pricing structure</li>
                        <li>• Steep learning curve</li>
                        <li>• Expensive for SMBs</li>
                        <li>• Feature bloat</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Our Opportunity</h5>
                    <p className="text-sm text-gray-600">
                      Position as the simple, affordable alternative with AI-powered automation
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">Mailchimp</h4>
                      <p className="text-sm text-gray-600">Email Marketing Specialist</p>
                    </div>
                    <Badge variant="secondary">Medium Threat</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2 text-green-600">Strengths</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• User-friendly interface</li>
                        <li>• Strong email deliverability</li>
                        <li>• Good automation features</li>
                        <li>• Freemium model</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2 text-red-600">Weaknesses</h5>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Limited CRM features</li>
                        <li>• No social media integration</li>
                        <li>• Basic lead generation</li>
                        <li>• Limited customization</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Our Opportunity</h5>
                    <p className="text-sm text-gray-600">
                      Offer multi-channel outreach with advanced lead generation capabilities
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
