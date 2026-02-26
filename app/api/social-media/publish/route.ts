
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { decrypt } from '@/lib/crypto'

export const dynamic = "force-dynamic"

const publishPostSchema = z.object({
  accountIds: z.array(z.string()).min(1, 'At least one account is required'),
  content: z.string().min(1, 'Content is required'),
  mediaUrls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  campaignId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = publishPostSchema.parse(body)

    // Verify account ownership
    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        id: { in: validatedData.accountIds },
        userId: session.user.id,
        isActive: true
      }
    })

    if (accounts.length !== validatedData.accountIds.length) {
      return NextResponse.json(
        { error: 'Some accounts not found or not accessible' },
        { status: 400 }
      )
    }

    const posts = []

    // Create posts for each account
    for (const account of accounts) {
      try {
        // Decrypt access token
        const accessToken = decrypt(account.accessToken)
        
        // Create social media post record
        const post = await prisma.socialMediaPost.create({
          data: {
            platform: account.platform,
            content: validatedData.content,
            mediaUrls: validatedData.mediaUrls || [],
            hashtags: validatedData.hashtags || [],
            status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
            scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
            campaignId: validatedData.campaignId || null,
            socialMediaAccountId: account.id,
          }
        })

        // If not scheduled, attempt to publish immediately
        if (!validatedData.scheduledAt) {
          const publishResult = await publishToSocialMedia(
            account.platform, 
            accessToken, 
            validatedData.content,
            validatedData.mediaUrls,
            validatedData.hashtags
          )

          if (publishResult.success) {
            await prisma.socialMediaPost.update({
              where: { id: post.id },
              data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                platformPostId: publishResult.postId,
                platformData: publishResult.data
              }
            })
          } else {
            await prisma.socialMediaPost.update({
              where: { id: post.id },
              data: {
                status: 'FAILED',
                // Store error in platformData
                platformData: { error: publishResult.error }
              }
            })
          }
        }

        posts.push(post)
      } catch (error) {
        console.error(`Failed to create post for account ${account.id}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Posts created successfully',
      posts: posts.map(post => ({
        id: post.id,
        platform: post.platform,
        status: post.status,
        publishedAt: post.publishedAt,
        scheduledAt: post.scheduledAt
      }))
    })

  } catch (error) {
    console.error('Social media publish error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function publishToSocialMedia(
  platform: string, 
  accessToken: string, 
  content: string, 
  mediaUrls?: string[], 
  hashtags?: string[]
): Promise<{ success: boolean; postId?: string; data?: any; error?: string }> {
  // This is a simplified mock implementation
  // In a real application, you would integrate with each platform's API
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock success response
    const mockPostId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add hashtags to content if provided
    let finalContent = content
    if (hashtags && hashtags.length > 0) {
      finalContent += '\n\n' + hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
    }
    
    // Simulate different success rates by platform
    const successRate = {
      'FACEBOOK': 0.95,
      'INSTAGRAM': 0.90,
      'LINKEDIN': 0.98,
      'TWITTER': 0.92,
      'TIKTOK': 0.88,
      'YOUTUBE': 0.85
    }[platform] || 0.90
    
    if (Math.random() < successRate) {
      return {
        success: true,
        postId: mockPostId,
        data: {
          platform,
          content: finalContent,
          mediaCount: mediaUrls?.length || 0,
          hashtags: hashtags?.length || 0,
          publishedAt: new Date().toISOString()
        }
      }
    } else {
      return {
        success: false,
        error: `Failed to publish to ${platform}: Rate limit exceeded`
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Helper function to integrate with actual social media APIs
// This would be implemented based on each platform's API documentation
async function integrateWithPlatformAPI(platform: string, accessToken: string, postData: any) {
  switch (platform) {
    case 'FACEBOOK':
      // Facebook Graph API integration
      // return await publishToFacebook(accessToken, postData)
      break
    case 'INSTAGRAM':
      // Instagram Basic Display API integration
      // return await publishToInstagram(accessToken, postData)
      break
    case 'LINKEDIN':
      // LinkedIn API integration
      // return await publishToLinkedIn(accessToken, postData)
      break
    case 'TWITTER':
      // Twitter API v2 integration
      // return await publishToTwitter(accessToken, postData)
      break
    case 'TIKTOK':
      // TikTok API integration
      // return await publishToTikTok(accessToken, postData)
      break
    case 'YOUTUBE':
      // YouTube Data API integration
      // return await publishToYouTube(accessToken, postData)
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
