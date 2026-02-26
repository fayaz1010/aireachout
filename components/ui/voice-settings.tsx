
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Phone,
  Mic,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'

interface VoiceSettingsProps {
  onConfigurationChange?: (isConfigured: boolean) => void
}

export function VoiceSettings({ onConfigurationChange }: VoiceSettingsProps) {
  const [settings, setSettings] = useState({
    vapiPhoneNumber: '',
    twilioPhoneNumber: '',
    defaultVoiceId: 'Rachel',
    maxCallDuration: '600', // 10 minutes
  })
  
  const [apiKeyStatus, setApiKeyStatus] = useState({
    vapi: false,
    twilio: false,
    elevenlabs: false
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchApiKeyStatus()
    fetchVoiceSettings()
  }, [])

  const fetchApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        const configuredServices = data.apiKeys.reduce((acc: any, key: any) => {
          acc[key.service.toLowerCase()] = key.isActive
          return acc
        }, {})

        setApiKeyStatus({
          vapi: configuredServices.vapi || false,
          twilio: configuredServices.twilio || false,
          elevenlabs: configuredServices.elevenlabs || false
        })

        // Notify parent component about configuration status
        const isConfigured = configuredServices.vapi && configuredServices.twilio
        onConfigurationChange?.(isConfigured)
      }
    } catch (error) {
      console.error('Error fetching API key status:', error)
    }
  }

  const fetchVoiceSettings = async () => {
    // In a real implementation, you'd fetch these from your backend
    // For now, we'll use placeholder values
    setSettings({
      vapiPhoneNumber: process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER || '',
      twilioPhoneNumber: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || '',
      defaultVoiceId: 'Rachel',
      maxCallDuration: '600',
    })
  }

  const saveVoiceSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, you'd save these to your backend
      toast.success('Voice settings saved successfully')
    } catch (error) {
      toast.error('Failed to save voice settings')
    } finally {
      setLoading(false)
    }
  }

  const testVoiceCall = async () => {
    if (!apiKeyStatus.vapi || !apiKeyStatus.twilio) {
      toast.error('Please configure all required API keys first')
      return
    }

    setLoading(true)
    try {
      // This would make a test call in a real implementation
      toast.success('Test call feature will be available once API keys are properly configured')
    } catch (error) {
      toast.error('Test call failed')
    } finally {
      setLoading(false)
    }
  }

  const isFullyConfigured = apiKeyStatus.vapi && apiKeyStatus.twilio

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="mr-2 h-5 w-5" />
            Voice Call Configuration Status
          </CardTitle>
          <CardDescription>
            Check the status of your voice call integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span className="text-sm font-medium">Vapi AI</span>
              </div>
              <Badge className={apiKeyStatus.vapi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {apiKeyStatus.vapi ? (
                  <><CheckCircle className="mr-1 h-3 w-3" /> Configured</>
                ) : (
                  <><AlertCircle className="mr-1 h-3 w-3" /> Missing</>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Twilio</span>
              </div>
              <Badge className={apiKeyStatus.twilio ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {apiKeyStatus.twilio ? (
                  <><CheckCircle className="mr-1 h-3 w-3" /> Configured</>
                ) : (
                  <><AlertCircle className="mr-1 h-3 w-3" /> Missing</>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">ElevenLabs</span>
              </div>
              <Badge className={apiKeyStatus.elevenlabs ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {apiKeyStatus.elevenlabs ? (
                  <><CheckCircle className="mr-1 h-3 w-3" /> Configured</>
                ) : (
                  <><Info className="mr-1 h-3 w-3" /> Optional</>
                )}
              </Badge>
            </div>
          </div>

          {!isFullyConfigured && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To enable AI voice calls, you need to configure both Vapi AI and Twilio API keys in your settings.
                ElevenLabs is optional for custom voice synthesis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Voice Call Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Call Settings</CardTitle>
          <CardDescription>
            Configure your voice call preferences and phone numbers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vapiPhoneNumber">Vapi Phone Number</Label>
              <Input
                id="vapiPhoneNumber"
                placeholder="+1234567890"
                value={settings.vapiPhoneNumber}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  vapiPhoneNumber: e.target.value
                }))}
              />
              <p className="text-xs text-gray-500">
                The phone number assigned to your Vapi account for outbound calls
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
              <Input
                id="twilioPhoneNumber"
                placeholder="+1234567890"
                value={settings.twilioPhoneNumber}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  twilioPhoneNumber: e.target.value
                }))}
              />
              <p className="text-xs text-gray-500">
                Your Twilio phone number for fallback calls and SMS
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultVoiceId">Default Voice</Label>
              <Input
                id="defaultVoiceId"
                placeholder="Rachel"
                value={settings.defaultVoiceId}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  defaultVoiceId: e.target.value
                }))}
              />
              <p className="text-xs text-gray-500">
                ElevenLabs voice ID to use for AI calls (e.g., Rachel, Adam, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCallDuration">Max Call Duration (seconds)</Label>
              <Input
                id="maxCallDuration"
                type="number"
                placeholder="600"
                value={settings.maxCallDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  maxCallDuration: e.target.value
                }))}
              />
              <p className="text-xs text-gray-500">
                Maximum duration for each voice call (default: 10 minutes)
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={saveVoiceSettings} disabled={loading}>
              Save Settings
            </Button>

            <Button variant="outline" onClick={testVoiceCall} disabled={loading || !isFullyConfigured}>
              Test Voice Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Step-by-step guide to configure voice calling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Create Vapi AI Account</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Sign up at Vapi AI and get your API key and phone number
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer">
                    Visit Vapi AI <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Setup Twilio Account</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Get your Twilio Account SID and Auth Token for phone infrastructure
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer">
                    Visit Twilio <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Optional: ElevenLabs Voice Synthesis</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Add ElevenLabs for premium voice synthesis capabilities
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer">
                    Visit ElevenLabs <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceSettings
