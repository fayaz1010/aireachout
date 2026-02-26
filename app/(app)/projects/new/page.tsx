'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'

const industries = [
  'Software', 'E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance',
  'Marketing', 'Real Estate', 'Consulting', 'Manufacturing', 'Retail',
  'Entertainment', 'Travel', 'Fitness', 'Food & Beverage', 'Other'
]

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    targetAudience: '',
    keywords: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Project created successfully!')
        router.push(`/projects/${data.project.id}`)
      } else {
        toast.error(data.error || 'Failed to create project')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div className="space-y-6">      
      <main className="max-w-4xl mx-auto py-6 px-4">
        <PageHeader
          title="Create New Project"
          description="Add a new app or project that you want to market with AI-powered lead generation and email outreach."
          action={
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          }
        />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., My SaaS Analytics Tool"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your app does and its key benefits..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => setFormData(prev => ({...prev, industry: value}))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    name="targetAudience"
                    type="text"
                    placeholder="e.g., SaaS founders, product managers, growth teams"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>Keywords for Lead Generation</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Add keywords that describe your app or target audience. These will be used for AI-powered lead generation.
                </p>
                
                <div className="flex space-x-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    placeholder="e.g., saas analytics, dashboard, metrics"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button" 
                    onClick={addKeyword}
                    variant="outline"
                    disabled={isLoading || !newKeyword.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-sm">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-red-600"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/projects">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
