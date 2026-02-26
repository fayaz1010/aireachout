'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Github, 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
  BarChart3,
  Eye,
  Clock,
  Star
} from 'lucide-react'

// Mock AI Analysis Results (for demonstration)
const mockAnalysisResult = {
  projectType: {
    type: 'SAAS',
    confidence: 85,
    indicators: ['API service patterns', 'Dashboard components', 'Subscription model']
  },
  targetAudience: {
    primary: 'business_decision_makers',
    characteristics: ['Budget authority', 'Team management', 'ROI focused'],
    painPoints: ['Efficiency', 'Cost reduction', 'Team productivity'],
    channels: ['linkedin', 'content_marketing', 'webinars', 'direct_sales']
  },
  competitivePosition: {
    marketPosition: 'emerging',
    differentiators: ['AI-powered features', 'Open source approach'],
    advantages: ['Growing community', 'Market validation'],
    challenges: ['Building awareness', 'Proving market fit']
  },
  recommendedStrategies: [
    {
      strategy: 'Product-Led Growth',
      priority: 'very_high',
      confidence: 95,
      reasoning: 'SaaS products benefit most from freemium and trial strategies',
      expectedROI: '300-500%',
      timeline: '3-6 months',
      tactics: [
        'Implement 14-day free trial',
        'Add usage-based upgrade prompts',
        'Create onboarding excellence',
        'Build in-app upgrade flows'
      ]
    },
    {
      strategy: 'Content Marketing + SEO',
      priority: 'high',
      confidence: 90,
      reasoning: 'Essential for building authority and organic growth',
      expectedROI: '400-600%',
      timeline: '6-12 months',
      tactics: [
        'Target bottom-funnel keywords',
        'Create comparison pages',
        'Publish detailed case studies',
        'Build topic clusters for authority'
      ]
    },
    {
      strategy: 'Customer Referral Program',
      priority: 'high',
      confidence: 85,
      reasoning: 'High-impact strategy for SaaS with existing users',
      expectedROI: '500-800%',
      timeline: '1-2 months',
      tactics: [
        'Double-sided incentives',
        'Easy sharing tools',
        'Gamification elements',
        'Success tracking dashboard'
      ]
    }
  ],
  implementationPlan: {
    phase1: {
      title: 'Foundation & Quick Wins',
      duration: '30 days',
      tasks: [
        'Set up analytics and tracking',
        'Create compelling landing page',
        'Optimize GitHub repository presentation',
        'Define target customer personas',
        'Create initial content calendar'
      ]
    },
    phase2: {
      title: 'Growth Acceleration',
      duration: '60 days',
      tasks: [
        'Launch content marketing campaign',
        'Implement SEO optimization',
        'Start community engagement',
        'Create lead magnets and resources',
        'Begin outreach campaigns'
      ]
    },
    phase3: {
      title: 'Scale & Optimize',
      duration: 'Ongoing',
      tasks: [
        'Scale successful channels',
        'Implement advanced automation',
        'Launch partnership program',
        'Optimize conversion funnels',
        'Expand to new markets'
      ]
    }
  },
  confidence: 87
}

export default function AIGuidePage() {
  const [activeTab, setActiveTab] = useState('analyze')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [formData, setFormData] = useState({
    githubUrl: '',
    projectName: '',
    description: '',
    targetMarket: '',
    businessModel: ''
  })

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setActiveTab('results')
    }, 3000)
  }

  const handleApproveStrategy = (strategyIndex: number) => {
    console.log('Approved strategy:', mockAnalysisResult.recommendedStrategies[strategyIndex])
    // TODO: Implement strategy approval and campaign creation
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Marketing Strategist</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect your GitHub project and let AI analyze your codebase to build the perfect marketing strategy. 
          Get personalized recommendations based on your product, audience, and market position.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze">🔍 Analyze Project</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisComplete}>🧠 AI Results</TabsTrigger>
          <TabsTrigger value="implement" disabled={!analysisComplete}>🚀 Implementation</TabsTrigger>
        </TabsList>

        {/* Project Analysis Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5 text-gray-700" />
                Connect Your GitHub Project
              </CardTitle>
              <CardDescription>
                Provide your GitHub repository URL and basic project information for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="githubUrl">GitHub Repository URL *</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username/repository"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="My Awesome SaaS"
                      value={formData.projectName}
                      onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessModel">Business Model</Label>
                    <Select value={formData.businessModel} onValueChange={(value) => setFormData({...formData, businessModel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAAS">SaaS Platform</SelectItem>
                        <SelectItem value="MARKETPLACE">Marketplace</SelectItem>
                        <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                        <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                        <SelectItem value="API_SERVICE">API Service</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what your project does and its main value proposition"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetMarket">Target Market</Label>
                    <Textarea
                      id="targetMarket"
                      placeholder="Who is your ideal customer? (e.g., SMB owners, developers, enterprises)"
                      rows={3}
                      value={formData.targetMarket}
                      onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* AI Analysis Process */}
              {isAnalyzing && (
                <div className="border rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    <h4 className="font-semibold text-blue-900">AI Analysis in Progress</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing repository structure...</span>
                      <span>100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Identifying target audience...</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Generating strategy recommendations...</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <p className="text-sm text-blue-700 mt-4">
                    This usually takes 30-60 seconds. We're analyzing your codebase, README, and market positioning.
                  </p>
                </div>
              )}

              <Button 
                onClick={handleAnalyze}
                disabled={!formData.githubUrl || !formData.projectName || isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing Project...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* What AI Analyzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                What Our AI Analyzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Github className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Codebase Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Programming languages, frameworks, architecture patterns, and project complexity
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Audience Identification</h4>
                  <p className="text-sm text-gray-600">
                    Target users, pain points, preferred channels, and decision-making factors
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold">Market Position</h4>
                  <p className="text-sm text-gray-600">
                    Competitive landscape, differentiators, growth stage, and market opportunities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI Analysis Results
                <Badge className="ml-2">{mockAnalysisResult.confidence}% Confidence</Badge>
              </CardTitle>
              <CardDescription>
                Based on your GitHub repository analysis, here are our AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Project Type</h4>
                  <Badge variant="secondary" className="mb-2">{mockAnalysisResult.projectType.type}</Badge>
                  <p className="text-sm text-gray-600">{mockAnalysisResult.projectType.confidence}% confidence</p>
                  <div className="mt-2">
                    {mockAnalysisResult.projectType.indicators.map((indicator, index) => (
                      <p key={index} className="text-xs text-gray-500">• {indicator}</p>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Target Audience</h4>
                  <Badge variant="secondary" className="mb-2">{mockAnalysisResult.targetAudience.primary}</Badge>
                  <div className="mt-2 space-y-1">
                    {mockAnalysisResult.targetAudience.characteristics.slice(0, 3).map((char, index) => (
                      <p key={index} className="text-xs text-gray-500">• {char}</p>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Market Position</h4>
                  <Badge variant="secondary" className="mb-2">{mockAnalysisResult.competitivePosition.marketPosition}</Badge>
                  <div className="mt-2 space-y-1">
                    {mockAnalysisResult.competitivePosition.differentiators.map((diff, index) => (
                      <p key={index} className="text-xs text-gray-500">• {diff}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Strategies */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Recommended Marketing Strategies
                </h4>
                <div className="space-y-4">
                  {mockAnalysisResult.recommendedStrategies.map((strategy, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-lg">{strategy.strategy}</h5>
                            <p className="text-sm text-gray-600 mb-2">{strategy.reasoning}</p>
                          </div>
                          <Badge variant={strategy.priority === 'very_high' ? 'default' : 'secondary'}>
                            {strategy.priority.replace('_', ' ')} priority
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">EXPECTED ROI</p>
                            <p className="text-sm font-semibold text-green-600">{strategy.expectedROI}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">TIMELINE</p>
                            <p className="text-sm font-semibold text-blue-600">{strategy.timeline}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">CONFIDENCE</p>
                            <p className="text-sm font-semibold text-purple-600">{strategy.confidence}%</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Key Tactics:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {strategy.tactics.map((tactic, tacticIndex) => (
                              <p key={tacticIndex} className="text-xs text-gray-600">• {tactic}</p>
                            ))}
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleApproveStrategy(index)}
                          className="w-full"
                          variant={strategy.priority === 'very_high' ? 'default' : 'outline'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Create Campaign
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Implementation Tab */}
        <TabsContent value="implement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-green-600" />
                Implementation Roadmap
              </CardTitle>
              <CardDescription>
                Step-by-step plan to execute your AI-recommended marketing strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(mockAnalysisResult.implementationPlan).map(([phase, details]) => (
                <div key={phase} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{details.title}</h4>
                    <Badge variant="outline">{details.duration}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {details.tasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="text-center pt-6">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Implementation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
