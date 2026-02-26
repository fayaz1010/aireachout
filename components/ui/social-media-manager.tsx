'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Plus,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react'

const PLATFORM_ICONS = {
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  TIKTOK: Activity,
  YOUTUBE: Youtube,
}

const PLATFORM_COLORS = {
  FACEBOOK: 'bg-blue-600',
  INSTAGRAM: 'bg-pink-600',
  LINKEDIN: 'bg-blue-700',
  TWITTER: 'bg-blue-400',
  TIKTOK: 'bg-black',
  YOUTUBE: 'bg-red-600',
}

interface SocialMediaAccount {
  id: string
  platform: string
  accountName: string
  followerCount?: number
  profileUrl?: string
  isActive: boolean
  accountType?: string
  createdAt: string
}

interface SocialMediaManagerProps {
  userId: string
}

export function SocialMediaManager({ userId }: SocialMediaManagerProps) {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [newAccount, setNewAccount] = useState({
    platform: '',
    accountName: '',
    accessToken: '',
    refreshToken: '',
    accountType: 'business'
  })

  useEffect(() => {
    fetchSocialAccounts()
  }, [])

  const fetchSocialAccounts = async () => {
    try {
      const response = await fetch('/api/social-media/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      toast.error('Failed to fetch social media accounts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingAccount(true)

    try {
      const response = await fetch('/api/social-media/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })

      if (response.ok) {
        toast.success('Social media account added successfully!')
        setNewAccount({
          platform: '',
          accountName: '',
          accessToken: '',
          refreshToken: '',
          accountType: 'business'
        })
        fetchSocialAccounts()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add account')
      }
    } catch (error) {
      toast.error('An error occurred while adding the account')
    } finally {
      setIsAddingAccount(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this social media account?')) return

    try {
      const response = await fetch(`/api/social-media/accounts/${accountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Account removed successfully')
        fetchSocialAccounts()
      } else {
        toast.error('Failed to remove account')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleToggleActive = async (accountId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/social-media/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success(`Account ${!isActive ? 'activated' : 'deactivated'}`)
        fetchSocialAccounts()
      } else {
        toast.error('Failed to update account status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const toggleTokenVisibility = (accountId: string) => {
    setShowTokens(prev => ({ ...prev, [accountId]: !prev[accountId] }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Accounts</h2>
          <p className="text-gray-600">Manage your connected social media accounts for campaigns</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Social Media Account</DialogTitle>
              <DialogDescription>
                Connect a social media account to use in your campaigns
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={newAccount.platform}
                  onValueChange={(value) => setNewAccount(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="TWITTER">Twitter (X)</SelectItem>
                    <SelectItem value="TIKTOK">TikTok</SelectItem>
                    <SelectItem value="YOUTUBE">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name/Username</Label>
                <Input
                  id="accountName"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="@username or display name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Textarea
                  id="accessToken"
                  value={newAccount.accessToken}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="Paste your access token here"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refreshToken">Refresh Token (optional)</Label>
                <Textarea
                  id="refreshToken"
                  value={newAccount.refreshToken}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, refreshToken: e.target.value }))}
                  placeholder="Paste your refresh token here (if applicable)"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={newAccount.accountType}
                  onValueChange={(value) => setNewAccount(prev => ({ ...prev, accountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button type="submit" disabled={isAddingAccount}>
                  {isAddingAccount && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Add Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No Social Media Accounts</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Connect your social media accounts to start publishing content as part of your campaigns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const PlatformIcon = PLATFORM_ICONS[account.platform as keyof typeof PLATFORM_ICONS]
            const platformColor = PLATFORM_COLORS[account.platform as keyof typeof PLATFORM_COLORS]
            
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${platformColor} text-white`}>
                        <PlatformIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.accountName}</CardTitle>
                        <CardDescription className="capitalize">{account.platform.toLowerCase()}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {account.isActive ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {account.accountType && (
                      <Badge variant="outline" className="capitalize">
                        {account.accountType} Account
                      </Badge>
                    )}
                    
                    {account.followerCount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-1 h-4 w-4" />
                        {account.followerCount.toLocaleString()} followers
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        Added {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(account.id, account.isActive)}
                          title={account.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          title="Remove Account"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
