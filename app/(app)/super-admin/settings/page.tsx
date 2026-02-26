'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Shield, Bell, Database, Mail, Globe, Lock, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  maxUsersPerPlan: {
    FREE: number
    STARTER: number
    PROFESSIONAL: number
    ENTERPRISE: number
  }
  rateLimits: {
    emailsPerHour: number
    smsPerHour: number
    apiCallsPerMinute: number
  }
  securitySettings: {
    passwordMinLength: number
    requireTwoFactor: boolean
    sessionTimeout: number
  }
}

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'AI Reach Out',
    siteDescription: 'AI-powered outreach platform',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: true,
    maxUsersPerPlan: {
      FREE: 1000,
      STARTER: 5000,
      PROFESSIONAL: 10000,
      ENTERPRISE: -1
    },
    rateLimits: {
      emailsPerHour: 100,
      smsPerHour: 50,
      apiCallsPerMinute: 60
    },
    securitySettings: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 24
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/super-admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings({ ...settings, ...data })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/super-admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="limits">Limits & Quotas</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Site Configuration
              </CardTitle>
              <CardDescription>Basic site information and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Temporarily disable site access for maintenance</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Usage Limits & Quotas
              </CardTitle>
              <CardDescription>Configure usage limits and rate limiting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Plan Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.maxUsersPerPlan).map(([plan, limit]) => (
                    <div key={plan} className="space-y-2">
                      <Label htmlFor={`plan-${plan}`}>{plan} Plan Max Users</Label>
                      <Input
                        id={`plan-${plan}`}
                        type="number"
                        value={limit === -1 ? 'Unlimited' : limit}
                        onChange={(e) => {
                          const value = e.target.value === 'Unlimited' ? -1 : parseInt(e.target.value) || 0
                          setSettings({
                            ...settings,
                            maxUsersPerPlan: { ...settings.maxUsersPerPlan, [plan]: value }
                          })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Rate Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailsPerHour">Emails per Hour</Label>
                    <Input
                      id="emailsPerHour"
                      type="number"
                      value={settings.rateLimits.emailsPerHour}
                      onChange={(e) => setSettings({
                        ...settings,
                        rateLimits: { ...settings.rateLimits, emailsPerHour: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smsPerHour">SMS per Hour</Label>
                    <Input
                      id="smsPerHour"
                      type="number"
                      value={settings.rateLimits.smsPerHour}
                      onChange={(e) => setSettings({
                        ...settings,
                        rateLimits: { ...settings.rateLimits, smsPerHour: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiCallsPerMinute">API Calls per Minute</Label>
                    <Input
                      id="apiCallsPerMinute"
                      type="number"
                      value={settings.rateLimits.apiCallsPerMinute}
                      onChange={(e) => setSettings({
                        ...settings,
                        rateLimits: { ...settings.rateLimits, apiCallsPerMinute: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security policies and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.securitySettings.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      securitySettings: { 
                        ...settings.securitySettings, 
                        passwordMinLength: parseInt(e.target.value) || 8 
                      }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.securitySettings.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      securitySettings: { 
                        ...settings.securitySettings, 
                        sessionTimeout: parseInt(e.target.value) || 24 
                      }
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Require Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
                </div>
                <Switch
                  checked={settings.securitySettings.requireTwoFactor}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    securitySettings: { ...settings.securitySettings, requireTwoFactor: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Send system notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Send critical alerts via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
