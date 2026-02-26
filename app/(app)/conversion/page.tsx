'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConversionDashboard from '@/components/conversion/ConversionDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function ConversionPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="space-y-6">      
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Conversion Management"
          description="Track and optimize post-outreach conversion with AI-powered follow-up sequences"
          action={
            <Button>
              <Zap className="mr-2 h-4 w-4" />
              Create Follow-up Sequence
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="sequences">
              <Calendar className="mr-2 h-4 w-4" />
              Active Sequences
            </TabsTrigger>
            <TabsTrigger value="responses">
              <Users className="mr-2 h-4 w-4" />
              Lead Responses
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Target className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <ConversionDashboard />
          </TabsContent>

          <TabsContent value="sequences" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Follow-up Sequences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        leadName: 'John Smith',
                        company: 'TechCorp',
                        sequenceType: 'Trial Nurture',
                        currentStep: '3/5',
                        nextAction: 'Strategy Session Email',
                        scheduledFor: 'Today, 2:00 PM',
                        probability: 78
                      },
                      {
                        id: 2,
                        leadName: 'Sarah Johnson', 
                        company: 'InnovateLabs',
                        sequenceType: 'Demo Follow-up',
                        currentStep: '2/3',
                        nextAction: 'Implementation Timeline',
                        scheduledFor: 'Tomorrow, 10:30 AM',
                        probability: 92
                      }
                    ].map((sequence) => (
                      <div key={sequence.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{sequence.leadName}</h4>
                              <Badge variant="outline">{sequence.company}</Badge>
                              <Badge className="bg-green-50 text-green-700">
                                {sequence.probability}% likely
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{sequence.sequenceType}</p>
                            <p className="text-xs text-gray-500">
                              Next: {sequence.nextAction} • {sequence.scheduledFor}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{sequence.currentStep}</Badge>
                            <Button size="sm">
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lead Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      leadName: 'Mike Chen',
                      company: 'GrowthCo',
                      responseType: 'Email Reply',
                      sentiment: 'Positive',
                      intent: 'Schedule Demo',
                      timestamp: '2 hours ago'
                    },
                    {
                      leadName: 'Lisa Wang',
                      company: 'StartupXYZ',
                      responseType: 'LinkedIn Message',
                      sentiment: 'Interested',
                      intent: 'Request Info',
                      timestamp: '4 hours ago'
                    }
                  ].map((response, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{response.leadName}</h4>
                            <Badge variant="outline">{response.company}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{response.responseType}</span>
                            <Badge className="bg-green-50 text-green-700">
                              {response.sentiment}
                            </Badge>
                            <span>{response.intent}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{response.timestamp}</p>
                          <Button size="sm" variant="outline">
                            View Response
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: 'Initial Outreach', count: 1247, rate: '100%' },
                      { stage: 'Opened/Engaged', count: 623, rate: '50%' },
                      { stage: 'Responded', count: 293, rate: '23.5%' },
                      { stage: 'Follow-up Sequence', count: 156, rate: '12.5%' },
                      { stage: 'Demo/Trial', count: 89, rate: '7.1%' },
                      { stage: 'Converted', count: 102, rate: '8.2%' }
                    ].map((stage) => (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{stage.count}</span>
                          <Badge variant="outline">{stage.rate}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Conversion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { strategy: 'Freemium', rate: 12.3, conversions: 45 },
                      { strategy: 'Content Marketing', rate: 8.7, conversions: 32 },
                      { strategy: 'Referral Program', rate: 15.2, conversions: 18 },
                      { strategy: 'Partnership', rate: 22.1, conversions: 7 }
                    ].map((strategy) => (
                      <div key={strategy.strategy} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{strategy.strategy}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700">
                            {strategy.rate}%
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {strategy.conversions} conversions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
