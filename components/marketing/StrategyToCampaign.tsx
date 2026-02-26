'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Rocket, 
  Target, 
  Users, 
  Mail, 
  MessageSquare, 
  Phone, 
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Activity,
  Loader2,
  CheckCircle,
  ArrowRight,
  Zap,
  Search
} from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface MarketingStrategy {
  id: string
  name: string
  objective: string
  targetAudience: string
  primaryGoal: string
  industry: string
  channels: string[]
  status: string
}

interface StrategyToCampaignProps {
  strategy: MarketingStrategy
  onCampaignCreated?: (campaign: any) => void
}

const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email', icon: Mail, color: 'text-blue-600' },
  { value: 'SMS', label: 'SMS', icon: MessageSquare, color: 'text-green-600' },
  { value: 'VOICE_CALL', label: 'Voice Call', icon: Phone, color: 'text-purple-600' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-800' },
  { value: 'TWITTER', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { value: 'FACEBOOK', label: 'Facebook', icon: Facebook, color: 'text-blue-700' },
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { value: 'YOUTUBE', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { value: 'TIKTOK', label: 'TikTok', icon: Activity, color: 'text-black' }
]

export function StrategyToCampaign({ strategy, onCampaignCreated }: StrategyToCampaignProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [createdCampaign, setCreatedCampaign] = useState<any>(null)

  const [formData, setFormData] = useState({
    projectId: '',
    campaignName: `${strategy.name} Campaign`,
    channels: strategy.channels || ['EMAIL'],
    targetAudience: {
      demographics: [] as string[],
      interests: [] as string[],
      companySize: '',
      industry: strategy.industry || '',
      location: ''
    },
    leadGeneration: {
      enabled: true,
      searchQueries: [] as string[],
      maxLeads: 100,
      sources: ['GOOGLE_SEARCH', 'LINKEDIN', 'COMPANY_WEBSITES']
    }
  })

  useEffect(() => {
    fetchProjects()
    generateSearchQueries()
  }, [strategy])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const generateSearchQueries = () => {
    // AI-generated search queries based on strategy
    const baseQueries = [
      `${strategy.targetAudience} ${strategy.industry}`,
      `${strategy.primaryGoal} companies`,
      `${strategy.industry} decision makers`,
      `${strategy.objective.toLowerCase().replace('_', ' ')} prospects`
    ].filter(Boolean)

    setFormData(prev => ({
      ...prev,
      leadGeneration: {
        ...prev.leadGeneration,
        searchQueries: baseQueries
      }
    }))
  }

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const handleCreateCampaign = async () => {
    if (!formData.projectId) {
      toast.error('Please select a project')
      return
    }

    if (formData.channels.length === 0) {
      toast.error('Please select at least one communication channel')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/marketing/strategy-to-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: strategy.id,
          projectId: formData.projectId,
          campaignName: formData.campaignName,
          channels: formData.channels,
          targetAudience: formData.targetAudience,
          leadGenerationConfig: formData.leadGeneration.enabled ? {
            searchQueries: formData.leadGeneration.searchQueries,
            maxLeads: formData.leadGeneration.maxLeads,
            sources: formData.leadGeneration.sources
          } : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setCreatedCampaign(data.campaign)
        setCurrentStep(3)
        toast.success('Campaign created successfully!')
        onCampaignCreated?.(data.campaign)
      } else {
        toast.error(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Campaign creation error:', error)
      toast.error('Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="project">Select Project</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={formData.campaignName}
                onChange={(e) => setFormData(prev => ({ ...prev, campaignName: e.target.value }))}
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <Label>Communication Channels</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {CHANNEL_OPTIONS.map((channel) => {
                  const Icon = channel.icon
                  const isSelected = formData.channels.includes(channel.value)
                  
                  return (
                    <div
                      key={channel.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelToggle(channel.value)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleChannelToggle(channel.value)}
                      />
                      <Icon className={`h-4 w-4 ${channel.color}`} />
                      <span className="text-sm font-medium">{channel.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Target Audience Configuration</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select 
                    value={formData.targetAudience.companySize} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, companySize: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.targetAudience.location}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      targetAudience: { ...prev.targetAudience, location: e.target.value }
                    }))}
                    placeholder="e.g., United States, California"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  checked={formData.leadGeneration.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    leadGeneration: { ...prev.leadGeneration, enabled: !!checked }
                  }))}
                />
                <Label>Enable Automatic Lead Generation</Label>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>

              {formData.leadGeneration.enabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label>Search Queries (AI-Generated)</Label>
                    <div className="space-y-2 mt-2">
                      {formData.leadGeneration.searchQueries.map((query, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            value={query}
                            onChange={(e) => {
                              const newQueries = [...formData.leadGeneration.searchQueries]
                              newQueries[index] = e.target.value
                              setFormData(prev => ({
                                ...prev,
                                leadGeneration: { ...prev.leadGeneration, searchQueries: newQueries }
                              }))
                            }}
                            placeholder="Search query"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxLeads">Maximum Leads to Generate</Label>
                    <Input
                      id="maxLeads"
                      type="number"
                      value={formData.leadGeneration.maxLeads}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        leadGeneration: { ...prev.leadGeneration, maxLeads: parseInt(e.target.value) || 100 }
                      }))}
                      min="10"
                      max="1000"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Campaign Created Successfully!</h3>
              <p className="text-gray-600 mt-2">
                Your AI-powered campaign "{createdCampaign?.name}" is ready to launch.
              </p>
            </div>

            {createdCampaign && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Campaign:</span> {createdCampaign.name}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge className="ml-2">{createdCampaign.status}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Channels:</span> {createdCampaign.channels.length}
                    </div>
                    <div>
                      <span className="font-medium">Strategy-Based:</span> 
                      <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700">
                        AI Generated
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.location.href = `/campaigns/${createdCampaign?.id}`}>
                View Campaign
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/campaigns'}>
                All Campaigns
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          <span>Convert Strategy to Campaign</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {strategy.objective}
          </Badge>
        </CardTitle>
        <p className="text-gray-600">
          Transform your "{strategy.name}" marketing strategy into a multi-channel outreach campaign with AI-powered lead generation.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: 1, title: 'Campaign Setup', icon: Target },
            { step: 2, title: 'Audience & Leads', icon: Users },
            { step: 3, title: 'Launch Ready', icon: Rocket }
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {title}
              </span>
              {step < 3 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep === 2 ? (
              <Button onClick={handleCreateCampaign} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Create Campaign
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && !formData.projectId}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
