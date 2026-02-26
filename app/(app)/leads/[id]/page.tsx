
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Mail, Phone, Globe, ArrowLeft, Building } from 'lucide-react'
import Link from 'next/link'

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  email: string
  companyName?: string
  jobTitle?: string
  phone?: string
  website?: string
  linkedinUrl?: string
  location?: string
  industry?: string
  leadScore?: number
  status: string
  source: string
  createdAt: string
  project: {
    id: string
    name: string
  }
}

export default function LeadDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  
  const handleSendEmail = () => {
    if (lead) {
      router.push(`/campaigns/new?leadId=${lead.id}`)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user && params.id) {
      fetchLead()
    }
  }, [session, status, params.id, router])

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setLead(data.lead)
      } else {
        router.push('/leads')
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error)
      router.push('/leads')
    } finally {
      setLoading(false)
    }
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

  if (!lead) {
    return (
      <div className="space-y-6 pb-8">
          <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lead Not Found</h1>
            <Link href="/leads">
              <Button>Return to Leads</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayName = lead.fullName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Contact'

  return (
    <div className="space-y-6 pb-8">
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <PageHeader
          title={displayName}
          description={`Lead from ${lead.project.name}`}
          action={
            <Link href="/leads">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{lead.email}</span>
                    </div>
                  </div>
                  
                  {lead.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{lead.phone}</span>
                      </div>
                    </div>
                  )}

                  {lead.jobTitle && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Job Title</label>
                      <p className="text-gray-900 mt-1">{lead.jobTitle}</p>
                    </div>
                  )}

                  {lead.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900 mt-1">{lead.location}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {(lead.companyName || lead.website) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.companyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <p className="text-gray-900 mt-1">{lead.companyName}</p>
                    </div>
                  )}

                  {lead.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <div className="flex items-center mt-1">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <a 
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {lead.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.industry && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry</label>
                      <p className="text-gray-900 mt-1">{lead.industry}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {lead.leadScore || 'N/A'}
                </div>
                {lead.leadScore && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${lead.leadScore}%` }}
                    ></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant="outline">{lead.status}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{lead.source}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Added</label>
                  <p className="text-gray-900 text-sm mt-1">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" onClick={handleSendEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                
                {lead.linkedinUrl && (
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      View LinkedIn
                    </a>
                  </Button>
                )}
                
                <Link href={`/projects/${lead.project.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    View Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
