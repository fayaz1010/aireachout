import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/ui/page-header'
import { SocialMediaManager } from '@/components/ui/social-media-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Info,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Activity,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default async function SocialMediaSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">      
      <main className="max-w-6xl mx-auto py-6 px-4">
        <PageHeader
          title="Social Media Accounts"
          description="Connect and manage your social media accounts for multi-channel campaigns."
        />
        
        {/* Instructions Card */}
        <div className="mt-8 mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Info className="mr-2 h-5 w-5" />
                How Social Media Integration Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Supported Platforms:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Facebook className="h-3 w-3" />
                        Facebook
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        Instagram
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Twitter className="h-3 w-3" />
                        Twitter (X)
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        TikTok
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Youtube className="h-3 w-3" />
                        YouTube
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Integration Steps:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>1. Add your social media accounts below</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>2. Accounts appear as channels in campaign creation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>3. Create multi-channel campaigns with social posts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                        <span className="font-medium">Ready to create campaigns!</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> Once you add social media accounts here, they will automatically appear as available channels when creating new campaigns. 
                    You can then create posts for multiple platforms simultaneously with AI-generated personalized content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <SocialMediaManager userId={session.user.id} />
        </div>
      </main>
    </div>
  )
}
