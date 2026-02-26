
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  targetAudience?: string
  keywords: string[]
}

export default function EditProjectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user && params.id) {
      fetchProject()
    }
  }, [session, status, params.id, router])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      } else {
        router.push('/projects')
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    setSaving(true)
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      })

      if (response.ok) {
        toast.success('Project updated successfully')
        router.push(`/projects/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update project')
      }
    } catch (error) {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Project, value: string | string[]) => {
    if (!project) return
    setProject({ ...project, [field]: value })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 pb-8">
          <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6 pb-8">
          <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <Link href="/projects">
              <Button>Return to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      
      <main className="max-w-4xl mx-auto py-6 px-4">
        <PageHeader
          title="Edit Project"
          description={`Updating ${project.name}`}
          action={
            <Link href={`/projects/${params.id}`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
          }
        />

        <form onSubmit={handleSubmit} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={project.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={project.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={project.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={project.industry || ''}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    placeholder="e.g., SaaS, E-commerce, Healthcare"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  value={project.targetAudience || ''}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  placeholder="Describe your ideal customers..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={project.keywords.join(', ')}
                  onChange={(e) => handleChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate keywords with commas. Used for lead generation.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href={`/projects/${params.id}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
