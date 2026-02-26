'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  UserCheck,
  Zap
} from 'lucide-react'

interface ConversionMetrics {
  totalLeads: number
  responseRate: number
  conversionRate: number
  revenue: number
  activeSequences: number
  completedConversions: number
}

interface ConversionFunnel {
  stage: string
  count: number
  percentage: number
  dropOff: number
}

const mockMetrics: ConversionMetrics = {
  totalLeads: 1247,
  responseRate: 23.5,
  conversionRate: 8.2,
  revenue: 45600,
  activeSequences: 89,
  completedConversions: 102
}

const mockFunnel: ConversionFunnel[] = [
  { stage: 'Outreach Sent', count: 1247, percentage: 100, dropOff: 0 },
  { stage: 'Opened/Engaged', count: 623, percentage: 50, dropOff: 50 },
  { stage: 'Responded', count: 293, percentage: 23.5, dropOff: 26.5 },
  { stage: 'Interested', count: 156, percentage: 12.5, dropOff: 11 },
  { stage: 'Demo/Trial', count: 89, percentage: 7.1, dropOff: 5.4 },
  { stage: 'Converted', count: 102, percentage: 8.2, dropOff: -1.1 }
]

const mockActiveSequences = [
  {
    id: 1,
    leadName: 'John Smith',
    company: 'TechCorp',
    sequenceType: 'TRIAL_NURTURE',
    currentStep: 3,
    totalSteps: 5,
    nextAction: 'Strategy Session Email',
    scheduledFor: '2024-01-15T10:00:00Z',
    conversionProbability: 78
  },
  {
    id: 2,
    leadName: 'Sarah Johnson',
    company: 'InnovateLabs',
    sequenceType: 'DEMO_FOLLOW_UP',
    currentStep: 2,
    totalSteps: 3,
    nextAction: 'Implementation Timeline',
    scheduledFor: '2024-01-15T14:30:00Z',
    conversionProbability: 92
  },
  {
    id: 3,
    leadName: 'Mike Chen',
    company: 'GrowthCo',
    sequenceType: 'CONTENT_SERIES',
    currentStep: 1,
    totalSteps: 4,
    nextAction: 'Growth Playbook Part 2',
    scheduledFor: '2024-01-16T09:00:00Z',
    conversionProbability: 45
  }
]

export default function ConversionDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics>(mockMetrics)
  const [funnel, setFunnel] = useState<ConversionFunnel[]>(mockFunnel)
  const [activeSequences, setActiveSequences] = useState(mockActiveSequences)

  const getSequenceIcon = (type: string) => {
    switch (type) {
      case 'TRIAL_NURTURE': return <Zap className="h-4 w-4 text-blue-600" />
      case 'DEMO_FOLLOW_UP': return <Eye className="h-4 w-4 text-green-600" />
      case 'CONTENT_SERIES': return <Mail className="h-4 w-4 text-purple-600" />
      default: return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-50'
    if (probability >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Conversion Dashboard</h2>
        <p className="text-gray-600">Track post-outreach conversion and nurturing performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{metrics.totalLeads.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">{metrics.responseRate}%</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${metrics.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sequences</p>
                <p className="text-2xl font-bold">{metrics.activeSequences}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">{metrics.completedConversions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnel.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{stage.count}</span>
                      <span className="text-xs text-gray-500">({stage.percentage}%)</span>
                      {index > 0 && (
                        <div className="flex items-center">
                          {stage.dropOff > 0 ? (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                          )}
                          <span className={`text-xs ${stage.dropOff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {Math.abs(stage.dropOff)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Follow-up Sequences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Active Follow-up Sequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSequences.map((sequence) => (
                <div key={sequence.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{sequence.leadName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {sequence.company}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getSequenceIcon(sequence.sequenceType)}
                        <span>{sequence.sequenceType.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getProbabilityColor(sequence.conversionProbability)}`}>
                      {sequence.conversionProbability}% likely
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{sequence.currentStep}/{sequence.totalSteps} steps</span>
                    </div>
                    <Progress 
                      value={(sequence.currentStep / sequence.totalSteps) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Next: {sequence.nextAction}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sequence.scheduledFor).toLocaleDateString()} at{' '}
                          {new Date(sequence.scheduledFor).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" variant="outline">
                <UserCheck className="mr-2 h-4 w-4" />
                View All Sequences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Strategy Conversion Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { strategy: 'Freemium', conversions: 45, rate: 12.3, revenue: 18500 },
              { strategy: 'Content Marketing', conversions: 32, rate: 8.7, revenue: 12800 },
              { strategy: 'Referral Program', conversions: 18, rate: 15.2, revenue: 9200 },
              { strategy: 'Partnership', conversions: 7, rate: 22.1, revenue: 5100 }
            ].map((strategy) => (
              <div key={strategy.strategy} className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{strategy.strategy}</h4>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">{strategy.conversions}</p>
                  <p className="text-sm text-gray-600">conversions</p>
                  <p className="text-sm">
                    <span className="font-medium">{strategy.rate}%</span> rate
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    ${strategy.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
