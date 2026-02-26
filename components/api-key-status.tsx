'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ApiKeyStatus {
  service: string
  label: string
  isConfigured: boolean
  isActive: boolean
  description: string
}

export default function ApiKeyStatus() {
  const [apiKeyStatuses, setApiKeyStatuses] = useState<ApiKeyStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApiKeyStatus()
  }, [])

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        const configuredServices = data.apiKeys.reduce((acc: any, key: any) => {
          acc[key.service] = { isActive: key.isActive }
          return acc
        }, {})

        const statuses: ApiKeyStatus[] = [
          {
            service: 'GEMINI',
            label: 'Gemini AI',
            isConfigured: !!configuredServices.GEMINI,
            isActive: configuredServices.GEMINI?.isActive || false,
            description: 'For AI analysis and personalization'
          },
          {
            service: 'GOOGLE_SEARCH',
            label: 'Google Search',
            isConfigured: !!configuredServices.GOOGLE_SEARCH,
            isActive: configuredServices.GOOGLE_SEARCH?.isActive || false,
            description: 'For web search lead generation'
          },
          {
            service: 'APIFY',
            label: 'Apify',
            isConfigured: !!configuredServices.APIFY,
            isActive: configuredServices.APIFY?.isActive || false,
            description: 'For web scraping and LinkedIn'
          },
          {
            service: 'PERPLEXITY',
            label: 'Perplexity',
            isConfigured: !!configuredServices.PERPLEXITY,
            isActive: configuredServices.PERPLEXITY?.isActive || false,
            description: 'For AI research and analysis'
          },
          {
            service: 'ELEVENLABS',
            label: 'ElevenLabs',
            isConfigured: !!configuredServices.ELEVENLABS,
            isActive: configuredServices.ELEVENLABS?.isActive || false,
            description: 'For AI voice synthesis'
          },
          {
            service: 'VAPI',
            label: 'Vapi AI',
            isConfigured: !!configuredServices.VAPI,
            isActive: configuredServices.VAPI?.isActive || false,
            description: 'For conversational AI calls'
          }
        ]

        setApiKeyStatuses(statuses)
      }
    } catch (error) {
      console.error('Failed to fetch API key status:', error)
    } finally {
      setLoading(false)
    }
  }

  const configuredCount = apiKeyStatuses.filter(s => s.isConfigured).length
  const activeCount = apiKeyStatuses.filter(s => s.isConfigured && s.isActive).length

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>API Configuration</span>
            </CardTitle>
            <CardDescription>
              {activeCount} of {apiKeyStatuses.length} services configured and active
            </CardDescription>
          </div>
          <Link href="/settings">
            <Button variant="outline" size="sm">
              Manage Keys
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {apiKeyStatuses.map((status) => (
          <div key={status.service} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              {status.isConfigured && status.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : status.isConfigured ? (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">{status.label}</p>
                <p className="text-xs text-gray-600">{status.description}</p>
              </div>
            </div>
            <Badge 
              variant={
                status.isConfigured && status.isActive 
                  ? "default" 
                  : status.isConfigured 
                    ? "secondary" 
                    : "outline"
              }
              className="text-xs"
            >
              {status.isConfigured && status.isActive 
                ? "Active" 
                : status.isConfigured 
                  ? "Inactive" 
                  : "Not Set"}
            </Badge>
          </div>
        ))}

        {configuredCount === 0 && (
          <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
            <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              No API keys configured yet. Add your API keys to unlock powerful lead generation features.
            </p>
            <Link href="/settings">
              <Button size="sm">
                Add API Keys
              </Button>
            </Link>
          </div>
        )}

        {configuredCount > 0 && configuredCount < apiKeyStatuses.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Configure more API keys to unlock additional lead generation methods and improve your outreach capabilities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
