
import { getServerSession } from 'next-auth/next'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  ArrowLeft,
  Globe,
  Calendar,
  Target,
  Users,
  Mail,
  Settings,
  Plus
} from 'lucide-react'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      _count: {
        select: {
          leads: true,
          campaigns: true
        }
      }
    }
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6 pb-8">
      
      <main className="max-w-6xl mx-auto py-6 px-4">
        <PageHeader
          title={project.name}
          description={project.description || 'Project details and management'}
          action={
            <div className="flex items-center space-x-3">
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
            </div>
          }
        />

        <div className="mt-8 space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {project.industry && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Industry</Label>
                      <p className="mt-1 text-gray-900">{project.industry}</p>
                    </div>
                  )}

                  {project.targetAudience && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Target Audience</Label>
                      <p className="mt-1 text-gray-900">{project.targetAudience}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {project.website && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Website</Label>
                      <div className="mt-1 flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-gray-400" />
                        <a 
                          href={project.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          {project.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <div className="mt-1 flex items-center text-gray-900">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {project.keywords.length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-500">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold">{project._count.leads}</h3>
                      <p className="text-sm text-gray-500">Total Leads</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`/leads?project=${project.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Leads
                    </Button>
                  </Link>
                  <Link href="/leads/generate">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Generate More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Mail className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold">{project._count.campaigns}</h3>
                      <p className="text-sm text-gray-500">Campaigns</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href={`/campaigns?project=${project.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Campaigns
                    </Button>
                  </Link>
                  <Link href={`/campaigns/new?project=${project.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold">Active</h3>
                      <p className="text-sm text-gray-500">Project Status</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href="/analytics">
                    <Button variant="outline" size="sm" className="w-full">
                      View Analytics
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
