
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoiceCallManager } from '@/components/ui/voice-call-manager'
import { Loader2, Mail, Users, TrendingUp, Calendar, ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  emailsSent: number
  emailsDelivered: number
  emailsOpened: number
  emailsClicked: number
  createdAt: string
  project: {
    id: string
    name: string
  }
}

export default function CampaignDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user && params.id) {
      fetchCampaign()
    }
  }, [session, status, params.id, router])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
      } else {
        router.push('/campaigns')
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      router.push('/campaigns')
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

  if (!campaign) {
    return (
      <div className="space-y-6 pb-8">
          <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
            <Link href="/campaigns">
              <Button>Return to Campaigns</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <PageHeader
          title={campaign.name}
          description={`Campaign for ${campaign.project.name}`}
          action={
            <Link href="/campaigns">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          }
        />

        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="voice-calls">Voice Calls</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge variant={campaign.status === 'SENT' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaign.emailsSent}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.emailsSent > 0 
                        ? `${Math.round((campaign.emailsOpened / campaign.emailsSent) * 100)}%`
                        : '0%'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaign.emailsSent > 0 
                        ? `${Math.round((campaign.emailsClicked / campaign.emailsSent) * 100)}%`
                        : '0%'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="voice-calls" className="space-y-6">
              <VoiceCallManager campaignId={campaign.id} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Detailed performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600">Detailed analytics and reporting will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>
                    Created on {new Date(campaign.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Subject Line</h3>
                      <p className="text-gray-600">{campaign.subject}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Project</h3>
                      <Link 
                        href={`/projects/${campaign.project.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {campaign.project.name}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
