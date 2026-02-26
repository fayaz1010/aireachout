'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Zap,
  MessageSquare,
  Phone,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Activity,
  PhoneCall,
  Mic,
  User
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Project {
  id: string
  name: string
}

interface SocialMediaAccount {
  id: string
  platform: string
  accountName: string
  isActive: boolean
}

const PLATFORM_ICONS = {
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  TIKTOK: Activity,
  YOUTUBE: Youtube,
}

const CHANNEL_ICONS = {
  EMAIL: Mail,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  TIKTOK: Activity,
  YOUTUBE: Youtube,
  SMS: MessageSquare,
  VOICE_CALL: Phone,
}

export default function NewCampaignPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Initialize all hooks before conditional returns
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([])
  
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    campaignType: 'MULTI_CHANNEL',
    communicationChannels: ['EMAIL'] as string[],
    
    // Email fields
    subject: '',
    emailTemplate: `Hi {{firstName}},

I hope this email finds you well. I'm reaching out because I believe {{companyName}} could benefit from our solution.

{{personalizedInsight}}

We help companies like yours:
• Increase efficiency by 40% on average
• Reduce operational costs
• Improve customer satisfaction

Given your role as {{jobTitle}}, I'd love to show you how we can help {{companyName}} achieve similar results.

Would you be interested in a brief 15-minute demo?

Best regards,
{{senderName}}

P.S. I'd be happy to share a case study about how we helped a similar company increase their revenue by 25%.`,
    
    // Social media fields
    socialMediaContent: `🚀 Exciting news! We're helping businesses like {{companyName}} transform their operations.

{{personalizedInsight}}

✅ 40% increase in efficiency
✅ Reduced operational costs
✅ Improved customer satisfaction

#Business #Innovation #Growth #{{industry}}`,
    socialMediaPlatforms: [] as string[],
    
    // SMS fields
    smsContent: `Hi {{firstName}}! I'm {{senderName}} from {{companyName}}. We help companies like {{companyName}} boost efficiency by 40%. Quick chat? Reply YES for more info.`,
    
    // Voice call fields
    voiceScript: `Hello {{firstName}}, this is {{senderName}} calling from {{senderCompany}}. I hope I'm catching you at a good time.

I'm reaching out because I believe {{companyName}} could significantly benefit from our solution. We've helped similar companies in the {{industry}} industry increase their efficiency by up to 40% while reducing operational costs.

{{personalizedInsight}}

I'd love to share how we can help {{companyName}} achieve similar results. Would you be interested in a brief 15-minute conversation to explore this opportunity?

If now isn't a good time, when would be more convenient for you?`,
    voiceType: 'AI',
    
    // Common fields
    useAiPersonalization: true,
    personalizationPrompt: '',
    targetTags: [] as string[],
    scheduledAt: ''
  })

  // Load projects and social accounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, socialRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/social-media/accounts')
        ])
        
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.projects || [])
        }
        
        if (socialRes.ok) {
          const socialData = await socialRes.json()
          setSocialAccounts(socialData.accounts || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Campaign created successfully!')
        router.push(`/campaigns/${data.campaign.id}`)
      } else {
        toast.error(data.error || 'Failed to create campaign')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      communicationChannels: prev.communicationChannels.includes(channel)
        ? prev.communicationChannels.filter(c => c !== channel)
        : [...prev.communicationChannels, channel]
    }))
  }

  const handleSocialPlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaPlatforms: prev.socialMediaPlatforms.includes(platform)
        ? prev.socialMediaPlatforms.filter(p => p !== platform)
        : [...prev.socialMediaPlatforms, platform]
    }))
  }

  const getAvailableSocialPlatforms = () => {
    return socialAccounts.filter(account => account.isActive)
  }

  const isChannelSelected = (channel: string) => {
    return formData.communicationChannels.includes(channel)
  }

  // Handle loading and authentication
  if (status === 'loading') {
    return (
      <div className="space-y-6">        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return (
      <div className="space-y-6">        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">      
      <main className="max-w-4xl mx-auto py-6 px-4">
        <PageHeader
          title="Create New Campaign"
          description="Design and launch personalized email campaigns with AI-powered content generation."
          action={
            <Link href="/campaigns">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
          }
        />

        <div className="mt-8 space-y-8">
          {/* Basic Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Multi-Channel Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Select Project *</Label>
                    <Select 
                      value={formData.projectId} 
                      onValueChange={(value) => setFormData(prev => ({...prev, projectId: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g., Product Launch Multi-Channel Outreach"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Communication Channels Selection */}
                <div className="space-y-4">
                  <Label>Communication Channels *</Label>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* Email Channel */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isChannelSelected('EMAIL') 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelToggle('EMAIL')}
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className={`h-5 w-5 ${isChannelSelected('EMAIL') ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-500">Direct email outreach</p>
                        </div>
                      </div>
                    </div>

                    {/* SMS Channel */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isChannelSelected('SMS') 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelToggle('SMS')}
                    >
                      <div className="flex items-center space-x-3">
                        <MessageSquare className={`h-5 w-5 ${isChannelSelected('SMS') ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-gray-500">Text messaging</p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Call Channel */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isChannelSelected('VOICE_CALL') 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelToggle('VOICE_CALL')}
                    >
                      <div className="flex items-center space-x-3">
                        <Phone className={`h-5 w-5 ${isChannelSelected('VOICE_CALL') ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium">Voice Calls</p>
                          <p className="text-sm text-gray-500">AI or human calls</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Platforms */}
                    {getAvailableSocialPlatforms().length > 0 ? (
                      getAvailableSocialPlatforms().map((account) => {
                        const PlatformIcon = PLATFORM_ICONS[account.platform as keyof typeof PLATFORM_ICONS]
                        const channelKey = account.platform
                        return (
                          <div 
                            key={account.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              isChannelSelected(channelKey) 
                                ? 'border-orange-500 bg-orange-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleChannelToggle(channelKey)}
                          >
                            <div className="flex items-center space-x-3">
                              <PlatformIcon className={`h-5 w-5 ${isChannelSelected(channelKey) ? 'text-orange-600' : 'text-gray-400'}`} />
                              <div>
                                <p className="font-medium">{account.platform.toLowerCase().replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500">@{account.accountName}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      /* Social Media Setup Prompt */
                      <div className="md:col-span-2 xl:col-span-3">
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center">
                          <Share2 className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-lg font-medium text-gray-900">No Social Media Accounts</h3>
                          <p className="mt-1 text-gray-500">
                            Connect your social media accounts to enable social posting as a campaign channel.
                          </p>
                          <Link href="/settings/social-media">
                            <Button className="mt-4" variant="outline">
                              <Share2 className="mr-2 h-4 w-4" />
                              Set Up Social Media Accounts
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  {formData.communicationChannels.length === 0 && (
                    <p className="text-sm text-red-500">Please select at least one communication channel</p>
                  )}
                </div>

                {/* Email Content - Show if EMAIL is selected */}
                {isChannelSelected('EMAIL') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Email Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="e.g., Boost Your Business with Our Solution"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailTemplate">Email Template *</Label>
                        <Textarea
                          id="emailTemplate"
                          name="emailTemplate"
                          placeholder="Your email content with personalization variables..."
                          value={formData.emailTemplate}
                          onChange={handleInputChange}
                          rows={8}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Media Content */}
                {formData.communicationChannels.some(channel => 
                  ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'].includes(channel)
                ) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Share2 className="mr-2 h-4 w-4" />
                        Social Media Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="socialMediaContent">Social Media Post Content *</Label>
                        <Textarea
                          id="socialMediaContent"
                          name="socialMediaContent"
                          placeholder="Your social media post content with personalization variables..."
                          value={formData.socialMediaContent}
                          onChange={handleInputChange}
                          rows={6}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SMS Content */}
                {isChannelSelected('SMS') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        SMS Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="smsContent">SMS Message *</Label>
                        <Textarea
                          id="smsContent"
                          name="smsContent"
                          placeholder="Your SMS message (keep it concise - 160 characters recommended)"
                          value={formData.smsContent}
                          onChange={handleInputChange}
                          rows={3}
                          required
                          disabled={isLoading}
                        />
                        <div className="text-sm text-gray-500">
                          Character count: {formData.smsContent.length}/160 (recommended)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Voice Call Content */}
                {isChannelSelected('VOICE_CALL') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Phone className="mr-2 h-4 w-4" />
                        Voice Call Script
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="voiceType">Voice Type</Label>
                        <Select 
                          value={formData.voiceType} 
                          onValueChange={(value) => setFormData(prev => ({...prev, voiceType: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AI">
                              <div className="flex items-center">
                                <Mic className="mr-2 h-4 w-4" />
                                AI Voice
                              </div>
                            </SelectItem>
                            <SelectItem value="HUMAN">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                Human Caller
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="voiceScript">Call Script *</Label>
                        <Textarea
                          id="voiceScript"
                          name="voiceScript"
                          placeholder="Your call script with personalization variables..."
                          value={formData.voiceScript}
                          onChange={handleInputChange}
                          rows={8}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Personalization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Zap className="mr-2 h-4 w-4" />
                      AI Personalization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useAiPersonalization"
                        checked={formData.useAiPersonalization}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({...prev, useAiPersonalization: checked as boolean}))
                        }
                      />
                      <Label htmlFor="useAiPersonalization">
                        Enable AI Personalization for all channels
                      </Label>
                    </div>

                    {formData.useAiPersonalization && (
                      <div className="space-y-2">
                        <Label htmlFor="personalizationPrompt">AI Personalization Instructions</Label>
                        <Textarea
                          id="personalizationPrompt"
                          name="personalizationPrompt"
                          placeholder="Provide specific instructions for AI personalization (e.g., focus on pain points, industry trends, company news)"
                          value={formData.personalizationPrompt}
                          onChange={handleInputChange}
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Available variables: {`{{firstName}}, {{lastName}}, {{companyName}}, {{jobTitle}}, {{personalizedInsight}}, {{industry}}, {{senderName}}, {{senderCompany}}, {{unsubscribeLink}}`}
                    </div>
                  </CardContent>
                </Card>

                {/* Scheduling */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Scheduling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Schedule Send (Optional)</Label>
                      <Input
                        id="scheduledAt"
                        name="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <p className="text-sm text-gray-500">
                        Leave blank to create as draft. You can launch the campaign manually later.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Link href="/campaigns">
                    <Button type="button" variant="outline" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={
                      isLoading || 
                      !formData.projectId || 
                      !formData.name || 
                      formData.communicationChannels.length === 0
                    }
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Multi-Channel Campaign
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
