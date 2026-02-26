'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ArrowLeft, Loader2, Target, Search, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Project {
  id: string
  name: string
  industry?: string
  keywords: string[]
}

export default function GenerateLeadsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Initialize all hooks before any conditional returns
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [generatedLeads, setGeneratedLeads] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  
  const [formData, setFormData] = useState({
    projectId: '',
    searchQuery: '',
    targetLocation: '',
    companySize: '',
    industry: '',
    leadSource: 'GOOGLE_SEARCH',
    maxResults: '50'
  })

  // Load projects on component mount - this hook must always run
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

  // Handle authentication redirect with useEffect
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login')
    }
  }, [status, session, router])

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="space-y-6">        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!session) {
    return (
      <div className="space-y-6">        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate leads')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const result = await reader?.read()
        if (!result || result.done) break

        partialRead += decoder.decode(result.value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setCurrentStep(4)
              setProgress(100)
              toast.success('Lead generation completed!')
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 10, 90))
              } else if (parsed.status === 'completed') {
                setGeneratedLeads(parsed.leads || [])
                setCurrentStep(3)
                setProgress(95)
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Generation failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Lead generation error:', error)
      toast.error('Failed to generate leads. Please try again.')
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          leads: generatedLeads
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
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span>Setup</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span>Generating</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span>Review</span>
              </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Lead Generation Setup
              </CardTitle>
              <CardDescription>
                Configure your lead generation parameters. Our AI will search across multiple sources to find qualified prospects.
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
                      <SelectItem value="GOOGLE_SEARCH">Google Search</SelectItem>
                      <SelectItem value="LINKEDIN_SCRAPER">LinkedIn (Coming Soon)</SelectItem>
                      <SelectItem value="APIFY_SCRAPER">Directory Scraping (Coming Soon)</SelectItem>
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
                <p className="text-sm text-gray-500">
                  Describe your ideal prospects. Be specific about job titles, companies, or industries.
                </p>
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
                      <SelectItem value="25">25 leads</SelectItem>
                      <SelectItem value="50">50 leads</SelectItem>
                      <SelectItem value="100">100 leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* API Integration Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">API Integration Required</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This demo uses placeholder AI-generated leads. In production, connect your Google Custom Search API and Apify API keys in Settings to access real prospect data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={!formData.projectId || !formData.searchQuery}>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h3 className="mt-4 text-lg font-semibold">Generating Leads...</h3>
              <p className="text-gray-600 mt-2">
                AI is searching for qualified prospects based on your criteria
              </p>
              <Progress value={progress} className="w-full mt-4" />
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
                  Review the AI-generated leads before saving to your database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedLeads.slice(0, 5).map((lead, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{lead.name}</h4>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        <p className="text-sm text-gray-500">{lead.company} • {lead.title}</p>
                      </div>
                      <Badge variant="outline">Score: {lead.score}/100</Badge>
                    </div>
                  ))}
                  {generatedLeads.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      And {generatedLeads.length - 5} more leads...
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Generate More
                  </Button>
                  <Button onClick={handleSaveLeads}>
                    Save All Leads
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
              <p className="text-gray-600 mt-2">
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
