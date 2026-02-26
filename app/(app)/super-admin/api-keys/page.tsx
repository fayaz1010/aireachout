'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Plus, Eye, EyeOff, Edit2, Trash2, TrendingUp, Activity } from 'lucide-react'

interface SuperAdminApiKey {
  id: string
  service: string
  keyName: string
  isActive: boolean
  costPerUse?: number
  markup: number
  totalUsage: number
  monthlyUsage: number
  lastUsed?: string
  createdAt: string
}

const API_SERVICES = [
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'GEMINI', label: 'Google Gemini' },
  { value: 'GOOGLE_SEARCH', label: 'Google Search' },
  { value: 'APIFY', label: 'Apify' },
  { value: 'PERPLEXITY', label: 'Perplexity' },
  { value: 'ELEVENLABS', label: 'ElevenLabs' },
  { value: 'VAPI', label: 'Vapi' },
  { value: 'SENDGRID', label: 'SendGrid' },
  { value: 'TWILIO', label: 'Twilio' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter/X' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
]

export default function SuperAdminApiKeys() {
  const [apiKeys, setApiKeys] = useState<SuperAdminApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<SuperAdminApiKey | null>(null)
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({})
  
  const [formData, setFormData] = useState({
    service: '',
    keyName: '',
    apiKey: '',
    costPerUse: '',
    markup: '0.20'
  })

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/super-admin/api-keys')
      if (!response.ok) throw new Error('Failed to fetch API keys')
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error('Error fetching API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingKey ? 'PUT' : 'POST'
      const url = editingKey 
        ? `/api/super-admin/api-keys/${editingKey.id}`
        : '/api/super-admin/api-keys'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save API key')
      }
      
      toast.success(editingKey ? 'API key updated successfully' : 'API key added successfully')
      setIsDialogOpen(false)
      setEditingKey(null)
      setFormData({ service: '', keyName: '', apiKey: '', costPerUse: '', markup: '0.20' })
      fetchApiKeys()
    } catch (error: any) {
      console.error('Error saving API key:', error)
      toast.error(error.message)
    }
  }

  const handleEdit = (key: SuperAdminApiKey) => {
    setEditingKey(key)
    setFormData({
      service: key.service,
      keyName: key.keyName,
      apiKey: '', // Don't populate for security
      costPerUse: key.costPerUse?.toString() || '',
      markup: key.markup.toString()
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return
    
    try {
      const response = await fetch(`/api/super-admin/api-keys/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete API key')
      
      toast.success('API key deleted successfully')
      fetchApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const toggleKeyVisibility = async (keyId: string) => {
    if (showKeys[keyId]) {
      setShowKeys(prev => ({ ...prev, [keyId]: false }))
      return
    }
    
    try {
      const response = await fetch(`/api/super-admin/api-keys/${keyId}/decrypt`)
      if (!response.ok) throw new Error('Failed to decrypt key')
      
      const data = await response.json()
      setShowKeys(prev => ({ ...prev, [keyId]: data.decryptedKey }))
    } catch (error) {
      console.error('Error decrypting key:', error)
      toast.error('Failed to decrypt API key')
    }
  }

  const handleOpenDialog = () => {
    setEditingKey(null)
    setFormData({ service: '', keyName: '', apiKey: '', costPerUse: '', markup: '0.20' })
    setIsDialogOpen(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin API Keys</h1>
          <p className="text-gray-600 mt-2">Manage platform-wide API keys and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingKey ? 'Edit API Key' : 'Add New API Key'}</DialogTitle>
              <DialogDescription>
                {editingKey ? 'Update the API key configuration' : 'Add a new platform API key with pricing'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {API_SERVICES.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={formData.keyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
                  placeholder="e.g., Production Stripe Key"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter API key"
                  required={!editingKey}
                />
                {editingKey && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep existing key
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="costPerUse">Cost Per Use (cents)</Label>
                <Input
                  id="costPerUse"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUse}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPerUse: e.target.value }))}
                  placeholder="e.g., 0.01 for 1 cent per use"
                />
              </div>
              
              <div>
                <Label htmlFor="markup">Markup (percentage)</Label>
                <Input
                  id="markup"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.markup}
                  onChange={(e) => setFormData(prev => ({ ...prev, markup: e.target.value }))}
                  placeholder="e.g., 0.20 for 20% markup"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingKey ? 'Update' : 'Add'} API Key
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {key.keyName}
                    <Badge variant={key.isActive ? 'default' : 'secondary'}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{key.service}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleKeyVisibility(key.id)}
                  >
                    {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(key)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showKeys[key.id] && (
                  <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                    {showKeys[key.id] === true ? 'Loading...' : showKeys[key.id]}
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cost Per Use</p>
                    <p className="text-lg">{key.costPerUse ? `$${key.costPerUse}` : 'Free'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Markup</p>
                    <p className="text-lg">{(key.markup * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Usage</p>
                    <p className="text-lg flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {key.totalUsage.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Usage</p>
                    <p className="text-lg flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-600" />
                      {key.monthlyUsage.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {key.lastUsed && (
                  <div className="text-sm text-gray-500">
                    Last used: {new Date(key.lastUsed).toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {apiKeys.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 mb-4">No API keys configured yet</p>
              <Button onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
