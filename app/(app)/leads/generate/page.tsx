'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Target,
  Users,
  Zap,
  CheckCircle,
  Globe,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Project {
  id: string
  name: string
  industry?: string
  keywords: string[]
}

interface CampaignAngle {
  angle: string
  description: string
  searchQuery: string
  source?: string
}

interface WebsiteAnalysis {
  businessName: string
  businessType: string
  industry: string
  services: string[]
  targetAudience: string
  location: string
  socialPresence?: {
    twitter?: string | null
    facebook?: string | null
    linkedin?: string | null
    other?: string[]
  }
  suggestedSearchQueries: string[]
  suggestedIndustry: string
  suggestedLocation: string
  campaignAngles: CampaignAngle[]
  competitorKeywords: string[]
  summary: string
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  web: { label: 'Web', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  x_twitter: { label: 'X / Twitter', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  facebook: { label: 'Facebook', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
  linkedin: { label: 'LinkedIn', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' },
}

export default function GenerateLeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [generatedLeads, setGeneratedLeads] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  // AI Assist state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null)
  
  const [formData, setFormData] = useState({
    projectId: '',
    searchQuery: '',
    targetLocation: '',
    companySize: '',
    industry: '',
    leadSource: 'GOOGLE_SEARCH',
    maxResults: '25',
    websiteContext: '',
  })

  useEffect(() => {
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
    fetchProjects()
  }, [])

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login')
    }
  }, [status, session, router])

  if (status === 'loading' || !session) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a website URL')
      return
    }

    setIsAnalyzing(true)
    setAnalysis(null)
    setSelectedAngle(null)

    try {
      const response = await fetch('/api/leads/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: websiteUrl.trim(),
          projectId: formData.projectId || undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Analysis failed')
      }

      const { analysis: result } = await response.json()
      setAnalysis(result)

      // Auto-fill the form with the best suggestion
      setFormData(prev => ({
        ...prev,
        searchQuery: result.suggestedSearchQueries?.[0] || prev.searchQuery,
        industry: result.suggestedIndustry || prev.industry,
        targetLocation: result.suggestedLocation || prev.targetLocation,
        websiteContext: result.summary || '',
      }))

      toast.success('Website analyzed! Review the suggestions below.')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze website')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyAngle = (index: number) => {
    if (!analysis) return
    const angle = analysis.campaignAngles[index]
    setSelectedAngle(index)
    setFormData(prev => ({
      ...prev,
      searchQuery: angle.searchQuery,
      websiteContext: `${analysis.summary} | Campaign angle: ${angle.angle} - ${angle.description}`,
    }))
  }

  const handleGenerate = async () => {
    if (!formData.projectId || !formData.searchQuery) {
      toast.error('Please select a project and enter a search query')
      return
    }

    setIsLoading(true)
    setCurrentStep(2)
    setProgress(10)

    try {
      const response = await fetch('/api/leads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate leads')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const result = await reader?.read()
        if (!result || result.done) break

        partialRead += decoder.decode(result.value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              if (generatedLeads.length > 0 || currentStep === 3) {
                setCurrentStep(3)
                setProgress(100)
                toast.success('Lead generation completed!')
              }
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 15, 90))
              } else if (parsed.status === 'completed') {
                setGeneratedLeads(parsed.leads || [])
                setCurrentStep(3)
                setProgress(95)
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Generation failed')
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Generation failed') {
                // Skip JSON parse errors silently
              } else {
                throw e
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Lead generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate leads. Please try again.')
      setCurrentStep(1)
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveLeads = async () => {
    try {
      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: formData.projectId,
          leads: generatedLeads,
        }),
      })

      if (response.ok) {
        toast.success('Leads saved successfully!')
        router.push('/leads')
      } else {
        toast.error('Failed to save leads')
      }
    } catch (error) {
      toast.error('An error occurred while saving leads')
    }
  }

  return (
    <div className="space-y-6">      
      <main className="max-w-4xl mx-auto py-6 px-4">
        <PageHeader
          title="Generate Leads"
          description="Use AI-powered tools to discover and qualify prospects for your projects."
          action={
            <Link href="/leads">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
          }
        />

        {/* Progress Steps */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {[
                { step: 1, label: 'Setup' },
                { step: 2, label: 'Generating' },
                { step: 3, label: 'Review' },
              ].map(({ step, label }) => (
                <div key={step} className={`flex items-center space-x-2 ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {step}
                  </div>
                  <span>{label}</span>
                </div>
              ))}
              <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span>Complete</span>
              </div>
            </div>
          </div>
          {isLoading && <Progress value={progress} className="w-full" />}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            {/* AI Campaign Assist */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                  AI Campaign Assist
                </CardTitle>
                <CardDescription>
                  Paste a target website and let AI analyze it to build your campaign strategy automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="pl-10"
                        disabled={isAnalyzing}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeWebsite()}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAnalyzeWebsite} 
                    disabled={isAnalyzing || !websiteUrl.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {/* Analysis Results */}
                {analysis && (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-lg border bg-white/80 dark:bg-gray-900/80 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-base">{analysis.businessName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {analysis.businessType} &bull; {analysis.industry}
                            {analysis.location && ` &bull; ${analysis.location}`}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          AI Analyzed
                        </Badge>
                      </div>
                      <p className="text-sm">{analysis.summary}</p>
                      {analysis.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.services.slice(0, 6).map((service, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {analysis.socialPresence && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {analysis.socialPresence.twitter && (
                            <a href={analysis.socialPresence.twitter} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              X / Twitter
                            </a>
                          )}
                          {analysis.socialPresence.facebook && (
                            <a href={analysis.socialPresence.facebook} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              Facebook
                            </a>
                          )}
                          {analysis.socialPresence.linkedin && (
                            <a href={analysis.socialPresence.linkedin} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900 transition-colors">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              LinkedIn
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Campaign Angles */}
                    {analysis.campaignAngles?.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Suggested Campaign Angles</Label>
                        <div className="grid gap-2">
                          {analysis.campaignAngles.map((angle, index) => (
                            <button
                              key={index}
                              onClick={() => applyAngle(index)}
                              className={`w-full text-left rounded-lg border p-3 transition-all hover:border-purple-400 hover:shadow-sm ${
                                selectedAngle === index
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-1 ring-purple-500'
                                  : 'bg-white/60 dark:bg-gray-900/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{angle.angle}</span>
                                  {angle.source && SOURCE_LABELS[angle.source] && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${SOURCE_LABELS[angle.source].color}`}>
                                      {SOURCE_LABELS[angle.source].label}
                                    </span>
                                  )}
                                </div>
                                {selectedAngle === index && (
                                  <CheckCircle className="h-4 w-4 text-purple-600" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{angle.description}</p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-mono">
                                &quot;{angle.searchQuery}&quot;
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAnalysis(null)
                        setSelectedAngle(null)
                        setWebsiteUrl('')
                      }}
                      className="text-muted-foreground"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Clear &amp; start over
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Setup Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Lead Generation Setup
                </CardTitle>
                <CardDescription>
                  {analysis
                    ? 'Fields have been pre-filled by AI. Review and adjust before generating.'
                    : 'Configure your lead generation parameters, or use AI Assist above to auto-fill.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="project">Select Project *</Label>
                    <Select 
                      value={formData.projectId} 
                      onValueChange={(value) => setFormData(prev => ({...prev, projectId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose project" />
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

                  <div className="space-y-2">
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select 
                      value={formData.leadSource} 
                      onValueChange={(value) => setFormData(prev => ({...prev, leadSource: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOOGLE_SEARCH">Google Search (AI-powered)</SelectItem>
                        <SelectItem value="LINKEDIN_SCRAPER" disabled>LinkedIn (Coming Soon)</SelectItem>
                        <SelectItem value="APIFY_SCRAPER" disabled>Directory Scraping (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchQuery">Search Query *</Label>
                  <Input
                    id="searchQuery"
                    placeholder="e.g., SaaS founders in San Francisco, product managers at tech companies"
                    value={formData.searchQuery}
                    onChange={(e) => setFormData(prev => ({...prev, searchQuery: e.target.value}))}
                  />
                  {analysis && analysis.suggestedSearchQueries.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-xs text-muted-foreground pt-0.5">Try:</span>
                      {analysis.suggestedSearchQueries.slice(1).map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setFormData(prev => ({ ...prev, searchQuery: q }))}
                          className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                  {!analysis && (
                    <p className="text-sm text-muted-foreground">
                      Describe your ideal prospects. Be specific about job titles, companies, or industries.
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetLocation">Location</Label>
                    <Input
                      id="targetLocation"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.targetLocation}
                      onChange={(e) => setFormData(prev => ({...prev, targetLocation: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Software, Healthcare"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({...prev, industry: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResults">Max Results</Label>
                    <Select 
                      value={formData.maxResults} 
                      onValueChange={(value) => setFormData(prev => ({...prev, maxResults: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 leads</SelectItem>
                        <SelectItem value="25">25 leads</SelectItem>
                        <SelectItem value="50">50 leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!formData.projectId || !formData.searchQuery}
                    size="lg"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Leads
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h3 className="mt-4 text-lg font-semibold">Searching the Web for Leads...</h3>
              <p className="text-muted-foreground mt-2">
                AI is searching the web and building prospect profiles based on your criteria
              </p>
              <Progress value={progress} className="w-full mt-4" />
              <p className="text-xs text-muted-foreground mt-2">
                This may take 15-30 seconds depending on the number of results
              </p>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && generatedLeads.length > 0 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Generated Leads ({generatedLeads.length})
                </CardTitle>
                <CardDescription>
                  Review the leads found through web search before saving to your database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedLeads.map((lead, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{lead.name}</h4>
                          {lead.sourceType && SOURCE_LABELS[lead.sourceType] && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${SOURCE_LABELS[lead.sourceType].color}`}>
                              {SOURCE_LABELS[lead.sourceType].label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                        <p className="text-sm text-muted-foreground/70 truncate">
                          {[lead.company, lead.title, lead.location].filter(Boolean).join(' \u2022 ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-blue-600">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {lead.twitterUrl && (
                            <a href={lead.twitterUrl} target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                          )}
                          {lead.facebookUrl && (
                            <a href={lead.facebookUrl} target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-indigo-600">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                          )}
                          {lead.linkedinUrl && (
                            <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-sky-600">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                          )}
                          {lead.notes && (
                            <span className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">{lead.notes}</span>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          lead.score >= 80 ? 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400' :
                          lead.score >= 60 ? 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400' :
                          'border-gray-300 text-gray-600'
                        }
                      >
                        {lead.score}/100
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => { setCurrentStep(1); setProgress(0) }}>
                    Generate More
                  </Button>
                  <Button onClick={handleSaveLeads}>
                    Save All Leads ({generatedLeads.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 4 && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-semibold">Leads Generated Successfully!</h3>
              <p className="text-muted-foreground mt-2">
                Your leads have been saved and are ready for outreach campaigns
              </p>
              <div className="flex justify-center space-x-4 mt-6">
                <Link href="/leads">
                  <Button variant="outline">View All Leads</Button>
                </Link>
                <Link href="/campaigns/new">
                  <Button>Create Campaign</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
