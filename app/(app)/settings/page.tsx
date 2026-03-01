'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, pageHeaderConfigs } from '@/components/ui/page-header'
import { toast } from 'sonner'
import { Eye, EyeOff, Key, Settings, Trash2, Plus, CheckCircle, XCircle, Phone, MessageSquare, Copy } from 'lucide-react'
import { VoiceSettings } from '@/components/ui/voice-settings'

interface ApiKey {
  id: string
  service: string
  keyName: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
}

const API_SERVICES = [
  { value: 'GEMINI', label: 'Gemini AI', description: 'For AI analysis and personalization' },
  { value: 'GOOGLE_SEARCH', label: 'Google Custom Search', description: 'For web search and lead generation' },
  { value: 'APIFY', label: 'Apify', description: 'For web scraping and data extraction' },
  { value: 'PERPLEXITY', label: 'Perplexity', description: 'For research and analysis' },
  { value: 'ELEVENLABS', label: 'ElevenLabs', description: 'For AI voice synthesis' },
  { value: 'VAPI', label: 'Vapi AI', description: 'For conversational AI voice calls' },
  { value: 'SENDGRID', label: 'SendGrid', description: 'For email delivery' },
  { value: 'TWILIO', label: 'Twilio', description: 'For phone infrastructure and SMS' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [newApiKey, setNewApiKey] = useState({
    service: '',
    keyName: '',
    apiKey: ''
  })
  const [isAddingKey, setIsAddingKey] = useState(false)
  
  // Get tab from URL parameters
  const activeTab = searchParams.get('tab') || 'api-keys'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user) {
      fetchApiKeys()
    }
  }, [session, status, router])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      toast.error('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  const addApiKey = async () => {
    if (!newApiKey.service || !newApiKey.keyName || !newApiKey.apiKey) {
      toast.error('Please fill in all fields')
      return
    }

    setIsAddingKey(true)
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApiKey)
      })

      if (response.ok) {
        toast.success('API key added successfully')
        setNewApiKey({ service: '', keyName: '', apiKey: '' })
        fetchApiKeys()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to add API key')
      }
    } catch (error) {
      toast.error('Failed to add API key')
    } finally {
      setIsAddingKey(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch(`/api/user/api-keys?id=${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('API key deleted successfully')
        fetchApiKeys()
      } else {
        toast.error('Failed to delete API key')
      }
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId, isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`API key ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchApiKeys()
      } else {
        toast.error('Failed to update API key status')
      }
    } catch (error) {
      toast.error('Failed to update API key status')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader {...pageHeaderConfigs.settings} />

      <Tabs value={activeTab} onValueChange={(value) => {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', value)
        router.replace(url.toString())
      }} className="w-full">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="voice-calls">Voice Calls</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          {/* Add New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New API Key</span>
              </CardTitle>
              <CardDescription>
                Add your API keys to enable various services for lead generation and outreach.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="service">Service</Label>
                  <select
                    id="service"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newApiKey.service}
                    onChange={(e) => setNewApiKey({ ...newApiKey, service: e.target.value })}
                  >
                    <option value="">Select a service</option>
                    {API_SERVICES.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Main Gemini Key"
                    value={newApiKey.keyName}
                    onChange={(e) => setNewApiKey({ ...newApiKey, keyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={newApiKey.apiKey}
                    onChange={(e) => setNewApiKey({ ...newApiKey, apiKey: e.target.value })}
                  />
                </div>
              </div>
              {newApiKey.service && (
                <p className="text-sm text-gray-600">
                  {API_SERVICES.find(s => s.value === newApiKey.service)?.description}
                </p>
              )}
              <Button onClick={addApiKey} disabled={isAddingKey}>
                {isAddingKey ? 'Adding...' : 'Add API Key'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Your API Keys</span>
              </CardTitle>
              <CardDescription>
                Manage your existing API keys. Keep them secure and only share with trusted applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No API keys found. Add your first API key above to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map(key => (
                    <div key={key.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{key.keyName}</h3>
                          <p className="text-sm text-gray-600">
                            {API_SERVICES.find(s => s.value === key.service)?.label} • 
                            Created {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {key.isActive ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 text-sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyStatus(key.id, key.isActive)}
                        >
                          {key.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApiKey(key.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>

                      {key.lastUsed && (
                        <p className="text-xs text-gray-500">
                          Last used: {new Date(key.lastUsed).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          {/* Facebook Messenger */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Facebook Messenger</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Connected</span>
              </CardTitle>
              <CardDescription>
                Receive and reply to messages sent to your Facebook Page via Messenger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <p className="text-sm font-medium">Webhook URL — paste this in Meta for Developers</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background border rounded px-3 py-2 font-mono break-all">
                    https://aireachout.com/api/webhooks/facebook/messenger
                  </code>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText('https://aireachout.com/api/webhooks/facebook/messenger')
                    toast.success('Copied!')
                  }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28">Verify Token:</span>
                  <code className="text-xs bg-background border rounded px-3 py-2 font-mono">
                    aireachout_webhook_verify_2026
                  </code>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText('aireachout_webhook_verify_2026')
                    toast.success('Copied!')
                  }}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Subscribe to: <strong>messages</strong>, <strong>messaging_postbacks</strong>, <strong>message_reads</strong></p>
                <p>✓ Page: <strong>AI Reach Out</strong></p>
                <p>✓ App ID: <strong>1249193620696907</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>WhatsApp Business</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Setup required</span>
              </CardTitle>
              <CardDescription>
                Connect your WhatsApp Business number to receive and reply to customer messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Requires a WhatsApp Business phone number. Go to Meta for Developers → WhatsApp → Getting Started to add a number.
              </p>
            </CardContent>
          </Card>

          {/* Instagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-pink-600" />
                <span>Instagram</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Setup required</span>
              </CardTitle>
              <CardDescription>
                Receive and reply to Instagram DMs and story mentions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link your Instagram Business account to the AI Reach Out Facebook Page, then configure the Instagram webhook in Meta for Developers.
              </p>
            </CardContent>
          </Card>

          {/* Telegram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-sky-500" />
                <span>Telegram</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Connected</span>
              </CardTitle>
              <CardDescription>
                Telegram Hub bot forwards all channel messages to your team on Telegram.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bot token configured. All inbound messages from connected channels are forwarded to the Telegram Hub.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-calls" className="space-y-6">
          <VoiceSettings />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue={session?.user?.firstName || ''}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      defaultValue={session?.user?.lastName || ''}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={session?.user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      defaultValue={session?.user?.companyName || ''}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="w-full mt-1 p-2 border rounded-md"
                      defaultValue="UTC"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="CST">CST (Central Standard Time)</option>
                      <option value="MST">MST (Mountain Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="GMT">GMT (Greenwich Mean Time)</option>
                      <option value="CET">CET (Central European Time)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={() => toast.success('Profile updated successfully')}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => toast.success('Password updated successfully')}
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when and how you want to receive email notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Campaign Updates</Label>
                    <p className="text-sm text-gray-500">Get notified when campaigns are sent or completed</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Generation</Label>
                    <p className="text-sm text-gray-500">Get notified when new leads are discovered</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    defaultChecked={true}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-gray-500">Get notified about platform updates and maintenance</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    defaultChecked={false}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded"
                    defaultChecked={true}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={() => toast.success('Notification preferences updated')}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Manage browser push notifications for real-time updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive real-time notifications in your browser</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked={false}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Campaign Alerts</Label>
                  <p className="text-sm text-gray-500">Get push notifications for urgent campaign issues</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  defaultChecked={false}
                />
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => toast.info('Push notification settings updated')}
                >
                  Update Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Frequency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>
                Control how often you receive different types of notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignFreq">Campaign Notifications</Label>
                <select
                  id="campaignFreq"
                  className="w-full mt-1 p-2 border rounded-md"
                  defaultValue="immediate"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly digest</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                  <option value="never">Never</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="leadFreq">Lead Generation Notifications</Label>
                <select
                  id="leadFreq"
                  className="w-full mt-1 p-2 border rounded-md"
                  defaultValue="daily"
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly digest</option>
                  <option value="daily">Daily digest</option>
                  <option value="weekly">Weekly digest</option>
                  <option value="never">Never</option>
                </select>
              </div>
              
              <div className="pt-4 border-t">
                <Button onClick={() => toast.success('Notification frequency updated')}>
                  Save Frequency Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
