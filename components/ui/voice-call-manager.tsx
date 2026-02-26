'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Play,
  Pause,
  Settings
} from 'lucide-react'

interface VoiceCall {
  id: string
  recipientPhone: string
  recipientName?: string
  status: 'INITIATED' | 'CONNECTED' | 'COMPLETED' | 'FAILED'
  voiceType: 'AI' | 'HUMAN'
  duration?: number
  initiatedAt: string
  connectedAt?: string
  endedAt?: string
  externalCallId?: string
  serviceProvider?: string
}

interface VoiceCallManagerProps {
  campaignId?: string
  leadId?: string
  onCallUpdate?: (call: VoiceCall) => void
}

export function VoiceCallManager({ campaignId, leadId, onCallUpdate }: VoiceCallManagerProps) {
  const [calls, setCalls] = useState<VoiceCall[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCall, setActiveCall] = useState<string | null>(null)

  useEffect(() => {
    if (campaignId) {
      fetchVoiceCalls()
    }
  }, [campaignId])

  const fetchVoiceCalls = async () => {
    try {
      const response = await fetch(`/api/voice/calls?campaignId=${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        setCalls(data.calls || [])
      }
    } catch (error) {
      console.error('Error fetching voice calls:', error)
    }
  }

  const makeVoiceCall = async (recipientPhone: string, recipientName: string, script: string, voiceType: 'AI' | 'HUMAN' = 'AI') => {
    if (!campaignId || !leadId) {
      toast.error('Campaign and lead information required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientPhone,
          recipientName,
          script,
          voiceType,
          campaignId,
          leadId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Voice call initiated successfully')
        setActiveCall(data.callId)
        fetchVoiceCalls() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to initiate voice call')
      }
    } catch (error) {
      console.error('Error making voice call:', error)
      toast.error('Failed to initiate voice call')
    } finally {
      setLoading(false)
    }
  }

  const checkCallStatus = async (callId: string) => {
    try {
      const response = await fetch(`/api/voice/status/${callId}`)
      if (response.ok) {
        const data = await response.json()
        return data.status
      }
    } catch (error) {
      console.error('Error checking call status:', error)
    }
    return null
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CONNECTED':
        return <PhoneCall className="h-4 w-4 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIATED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONNECTED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Voice Call Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">{calls.length}</p>
              </div>
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">
                  {calls.filter(call => ['CONNECTED', 'COMPLETED'].includes(call.status)).length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {calls.filter(call => call.status === 'FAILED').length}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calls.length > 0 
                    ? Math.round((calls.filter(call => call.status === 'COMPLETED').length / calls.length) * 100)
                    : 0
                  }%
                </p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Voice Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PhoneCall className="mr-2 h-5 w-5" />
            Recent Voice Calls
          </CardTitle>
          <CardDescription>
            Track all voice calls made through your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <PhoneOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No voice calls yet</h3>
              <p className="text-gray-600">Voice calls will appear here when campaigns with voice channels are executed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(call.status)}
                    <div>
                      <p className="font-medium">{call.recipientName || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{call.recipientPhone}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(call.initiatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                    
                    <Badge variant="outline">
                      {call.voiceType} Voice
                    </Badge>

                    {call.duration && (
                      <span className="text-sm font-mono text-gray-600">
                        {formatDuration(call.duration)}
                      </span>
                    )}

                    {call.externalCallId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkCallStatus(call.externalCallId!)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceCallManager
