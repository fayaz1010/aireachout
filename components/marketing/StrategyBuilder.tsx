'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Lightbulb,
  Rocket,
  Brain,
  CheckCircle
} from 'lucide-react'

// Top SaaS Marketing Strategies with detailed implementation guides
const strategyTemplates = {
  freemium: {
    name: 'Freemium + Product-Led Growth',
    objective: 'TRIAL_CONVERSION',
    description: 'Convert free users to paid subscribers through value demonstration',
    channels: ['CONTENT_MARKETING', 'EMAIL_MARKETING', 'REFERRAL_PROGRAM'],
    tactics: [
      'Implement usage-based upgrade triggers',
      'Create compelling in-app upgrade prompts',
      'Optimize onboarding for quick value realization',
      'Use behavioral email sequences for conversion',
      'Add social proof and testimonials',
      'Implement freemium feature limitations strategically'
    ],
    contentThemes: ['Product tutorials', 'Success stories', 'Feature comparisons', 'ROI calculators'],
    kpis: {
      targetConversion: 3.5, // 3.5% free to paid conversion
      targetCAC: 75,
      targetLTV: 1200,
      targetChurnRate: 5.0
    }
  },
  content: {
    name: 'Content Marketing + SEO Dominance',
    objective: 'LEAD_GENERATION',
    description: 'Dominate search results with high-converting content',
    channels: ['CONTENT_MARKETING', 'SEO', 'EMAIL_MARKETING'],
    tactics: [
      'Target bottom-funnel keywords with buying intent',
      'Create comprehensive comparison pages',
      'Develop tool pages and calculators',
      'Publish detailed case studies with metrics',
      'Build topic clusters for authority',
      'Optimize for featured snippets'
    ],
    contentThemes: ['How-to guides', 'Industry reports', 'Tool comparisons', 'Best practices'],
    kpis: {
      targetConversion: 2.8,
      targetCAC: 45,
      targetLTV: 1500,
      targetChurnRate: 4.2
    }
  },
  referral: {
    name: 'Customer Referral Program',
    objective: 'CUSTOMER_ACQUISITION',
    description: 'Turn customers into growth engines with incentivized referrals',
    channels: ['REFERRAL_PROGRAM', 'EMAIL_MARKETING', 'SOCIAL_MEDIA'],
    tactics: [
      'Implement double-sided incentives (referrer + referee)',
      'Create easy sharing tools and templates',
      'Add gamification elements and leaderboards',
      'Use automated referral tracking and payouts',
      'Promote referral program in onboarding',
      'Send referral reminders at key moments'
    ],
    contentThemes: ['Success stories', 'Referral benefits', 'How-to-refer guides', 'Reward announcements'],
    kpis: {
      targetConversion: 15.0, // 15% referral rate
      targetCAC: 25,
      targetLTV: 1800,
      targetChurnRate: 3.5
    }
  },
  partnership: {
    name: 'Strategic Partnership Marketing',
    objective: 'MARKET_PENETRATION',
    description: 'Leverage partnerships for exponential growth',
    channels: ['PARTNERSHIP_MARKETING', 'CONTENT_MARKETING', 'EVENTS_WEBINARS'],
    tactics: [
      'List on major app marketplaces',
      'Build native integrations with popular tools',
      'Create co-marketing campaigns with partners',
      'Develop channel partner programs',
      'Host joint webinars and events',
      'Cross-promote with complementary services'
    ],
    contentThemes: ['Integration guides', 'Partnership announcements', 'Joint case studies', 'Ecosystem content'],
    kpis: {
      targetConversion: 4.2,
      targetCAC: 65,
      targetLTV: 2200,
      targetChurnRate: 3.8
    }
  }
}

const marketingChannels = [
  { id: 'CONTENT_MARKETING', label: 'Content Marketing', description: 'Blog, guides, resources' },
  { id: 'SEO', label: 'Search Engine Optimization', description: 'Organic search traffic' },
  { id: 'PAID_SEARCH', label: 'Paid Search', description: 'Google Ads, Bing Ads' },
  { id: 'SOCIAL_MEDIA', label: 'Social Media', description: 'LinkedIn, Twitter, Facebook' },
  { id: 'EMAIL_MARKETING', label: 'Email Marketing', description: 'Newsletters, sequences' },
  { id: 'INFLUENCER_MARKETING', label: 'Influencer Marketing', description: 'Industry thought leaders' },
  { id: 'AFFILIATE_MARKETING', label: 'Affiliate Marketing', description: 'Commission-based promotion' },
  { id: 'PR_OUTREACH', label: 'PR & Outreach', description: 'Media coverage, press releases' },
  { id: 'EVENTS_WEBINARS', label: 'Events & Webinars', description: 'Virtual and in-person events' },
  { id: 'DIRECT_SALES', label: 'Direct Sales', description: 'Outbound sales efforts' },
  { id: 'REFERRAL_PROGRAM', label: 'Referral Program', description: 'Customer referrals' },
  { id: 'PARTNERSHIP_MARKETING', label: 'Partnership Marketing', description: 'Strategic partnerships' }
]

interface StrategyBuilderProps {
  onSave: (strategy: any) => void
  onCancel: () => void
}

export default function StrategyBuilder({ onSave, onCancel }: StrategyBuilderProps) {
  const [activeTab, setActiveTab] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: '',
    targetAudience: '',
    budget: '',
    timeline: '',
    targetCAC: '',
    targetLTV: '',
    targetConversion: '',
    targetMRR: '',
    targetChurnRate: '',
    channels: [] as string[],
    tactics: [] as string[],
    contentThemes: [] as string[],
    startDate: '',
    endDate: ''
  })

  const handleTemplateSelect = (templateKey: string) => {
    const template = strategyTemplates[templateKey as keyof typeof strategyTemplates]
    setSelectedTemplate(templateKey)
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      objective: template.objective,
      channels: template.channels,
      tactics: template.tactics,
      contentThemes: template.contentThemes,
      targetCAC: template.kpis.targetCAC.toString(),
      targetLTV: template.kpis.targetLTV.toString(),
      targetConversion: template.kpis.targetConversion.toString(),
      targetChurnRate: template.kpis.targetChurnRate.toString()
    })
    setActiveTab('details')
  }

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }))
  }

  const handleTacticToggle = (tactic: string) => {
    setFormData(prev => ({
      ...prev,
      tactics: prev.tactics.includes(tactic)
        ? prev.tactics.filter(t => t !== tactic)
        : [...prev.tactics, tactic]
    }))
  }

  const handleSave = () => {
    const strategyData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      targetCAC: formData.targetCAC ? parseFloat(formData.targetCAC) : undefined,
      targetLTV: formData.targetLTV ? parseFloat(formData.targetLTV) : undefined,
      targetConversion: formData.targetConversion ? parseFloat(formData.targetConversion) : undefined,
      targetMRR: formData.targetMRR ? parseFloat(formData.targetMRR) : undefined,
      targetChurnRate: formData.targetChurnRate ? parseFloat(formData.targetChurnRate) : undefined,
    }
    onSave(strategyData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Marketing Strategy</h2>
        <p className="text-gray-600 mt-1">
          Build a data-driven strategy to dominate SaaS subscription sales
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Choose Template</TabsTrigger>
          <TabsTrigger value="details">Strategy Details</TabsTrigger>
          <TabsTrigger value="review">Review & Launch</TabsTrigger>
        </TabsList>

        {/* Template Selection */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-500" />
                Top SaaS Growth Strategies
              </CardTitle>
              <CardDescription>
                Choose from proven strategies used by unicorn SaaS companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(strategyTemplates).map(([key, template]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === key ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleTemplateSelect(key)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {template.name}
                        {selectedTemplate === key && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Target CAC</p>
                          <p className="text-green-600 font-semibold">${template.kpis.targetCAC}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Target LTV</p>
                          <p className="text-blue-600 font-semibold">${template.kpis.targetLTV}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-600 mb-2">Key Tactics:</p>
                        <div className="space-y-1">
                          {template.tactics.slice(0, 3).map((tactic, index) => (
                            <p key={index} className="text-xs text-gray-600">• {tactic}</p>
                          ))}
                          {template.tactics.length > 3 && (
                            <p className="text-xs text-blue-600">+{template.tactics.length - 3} more tactics</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Details */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Strategy Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Strategy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Q1 2024 Growth Strategy"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your strategy objectives and approach"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="objective">Primary Objective</Label>
                  <Select value={formData.objective} onValueChange={(value) => setFormData({...formData, objective: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                      <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                      <SelectItem value="CUSTOMER_ACQUISITION">Customer Acquisition</SelectItem>
                      <SelectItem value="CUSTOMER_RETENTION">Customer Retention</SelectItem>
                      <SelectItem value="REVENUE_GROWTH">Revenue Growth</SelectItem>
                      <SelectItem value="TRIAL_CONVERSION">Trial Conversion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="Describe your ideal customer profile"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Budget & KPIs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                      placeholder="Q1 2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetCAC">Target CAC ($)</Label>
                    <Input
                      id="targetCAC"
                      type="number"
                      value={formData.targetCAC}
                      onChange={(e) => setFormData({...formData, targetCAC: e.target.value})}
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetLTV">Target LTV ($)</Label>
                    <Input
                      id="targetLTV"
                      type="number"
                      value={formData.targetLTV}
                      onChange={(e) => setFormData({...formData, targetLTV: e.target.value})}
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetConversion">Conversion Rate (%)</Label>
                    <Input
                      id="targetConversion"
                      type="number"
                      step="0.1"
                      value={formData.targetConversion}
                      onChange={(e) => setFormData({...formData, targetConversion: e.target.value})}
                      placeholder="3.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetChurnRate">Churn Rate (%)</Label>
                    <Input
                      id="targetChurnRate"
                      type="number"
                      step="0.1"
                      value={formData.targetChurnRate}
                      onChange={(e) => setFormData({...formData, targetChurnRate: e.target.value})}
                      placeholder="5.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetMRR">Target MRR ($)</Label>
                  <Input
                    id="targetMRR"
                    type="number"
                    value={formData.targetMRR}
                    onChange={(e) => setFormData({...formData, targetMRR: e.target.value})}
                    placeholder="50000"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Marketing Channels
              </CardTitle>
              <CardDescription>
                Select the channels you'll use to reach your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketingChannels.map((channel) => (
                  <div key={channel.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={channel.id}
                      checked={formData.channels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={channel.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {channel.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                  Recommended Tactics
                </CardTitle>
                <CardDescription>
                  Select the tactics you want to implement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strategyTemplates[selectedTemplate as keyof typeof strategyTemplates].tactics.map((tactic, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Checkbox
                        id={`tactic-${index}`}
                        checked={formData.tactics.includes(tactic)}
                        onCheckedChange={() => handleTacticToggle(tactic)}
                      />
                      <label
                        htmlFor={`tactic-${index}`}
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        {tactic}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Review & Launch */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Strategy Review
              </CardTitle>
              <CardDescription>
                Review your strategy before launching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Strategy Overview</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {formData.name}</p>
                    <p><span className="font-medium">Objective:</span> {formData.objective}</p>
                    <p><span className="font-medium">Timeline:</span> {formData.timeline}</p>
                    <p><span className="font-medium">Budget:</span> ${formData.budget}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Target KPIs</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">CAC:</span> ${formData.targetCAC}</p>
                    <p><span className="font-medium">LTV:</span> ${formData.targetLTV}</p>
                    <p><span className="font-medium">Conversion:</span> {formData.targetConversion}%</p>
                    <p><span className="font-medium">Churn:</span> {formData.targetChurnRate}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Selected Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.channels.map((channelId) => {
                    const channel = marketingChannels.find(c => c.id === channelId)
                    return (
                      <Badge key={channelId} variant="secondary">
                        {channel?.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Implementation Tactics</h4>
                <div className="space-y-1">
                  {formData.tactics.map((tactic, index) => (
                    <p key={index} className="text-sm text-gray-600">• {tactic}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="space-x-3">
          {activeTab !== 'template' && (
            <Button 
              variant="outline" 
              onClick={() => {
                const tabs = ['template', 'details', 'review']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1])
                }
              }}
            >
              Previous
            </Button>
          )}
          {activeTab !== 'review' ? (
            <Button 
              onClick={() => {
                const tabs = ['template', 'details', 'review']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1])
                }
              }}
              disabled={activeTab === 'template' && !selectedTemplate}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Rocket className="w-4 h-4 mr-2" />
              Launch Strategy
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
