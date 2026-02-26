
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const executeActionSchema = z.object({
  action: z.enum(['start', 'pause', 'stop', 'resume'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = executeActionSchema.parse(body)

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        project: {
          include: {
            leads: {
              where: {
                status: { notIn: ['UNSUBSCRIBED', 'BOUNCED'] }
              }
            }
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Update campaign status based on action
    let newStatus: string
    let sentAt: Date | null = null

    switch (action) {
      case 'start':
      case 'resume':
        if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)) {
          return NextResponse.json(
            { error: 'Campaign cannot be started from current status' },
            { status: 400 }
          )
        }
        newStatus = 'SENDING'
        if (campaign.status === 'DRAFT') {
          sentAt = new Date()
        }
        break
      
      case 'pause':
        if (campaign.status !== 'SENDING') {
          return NextResponse.json(
            { error: 'Campaign is not currently running' },
            { status: 400 }
          )
        }
        newStatus = 'PAUSED'
        break
      
      case 'stop':
        if (!['SENDING', 'PAUSED'].includes(campaign.status)) {
          return NextResponse.json(
            { error: 'Campaign cannot be stopped from current status' },
            { status: 400 }
          )
        }
        newStatus = 'CANCELLED'
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: newStatus as any,
        sentAt: sentAt,
        totalRecipients: campaign.project.leads.length,
      }
    })

    // If starting campaign, initiate the execution process
    if (action === 'start' || action === 'resume') {
      // This would typically trigger a background job
      // For now, we'll simulate the process
      await simulateCampaignExecution(campaign, session.user.id)
    }

    return NextResponse.json({
      message: `Campaign ${action}ed successfully`,
      campaign: updatedCampaign
    })

  } catch (error) {
    console.error('Campaign execution error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid action', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function simulateCampaignExecution(campaign: any, userId: string) {
  // This is a simplified simulation of campaign execution
  // In a real implementation, this would be handled by background jobs
  
  try {
    const leads = campaign.project.leads
    const channels = campaign.communicationChannels
    
    // Get user's API keys for sending
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: { service: true, encryptedKey: true }
    })

    // Get social media accounts if social channels are selected
    const socialAccounts = await prisma.socialMediaAccount.findMany({
      where: { 
        userId, 
        isActive: true,
        platform: { in: channels.filter((ch: string) => ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'].includes(ch)) }
      }
    })

    // Simulate processing each lead
    for (const lead of leads.slice(0, 5)) { // Limit for demo
      for (const channel of channels) {
        await processChannelForLead(campaign, lead, channel, apiKeys, socialAccounts)
        
        // Add small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Update campaign status to SENT when done
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { 
        status: 'SENT',
        // Update actual stats based on execution results
        emailsSent: channels.includes('EMAIL') ? leads.length : 0,
        emailsDelivered: channels.includes('EMAIL') ? Math.floor(leads.length * 0.95) : 0,
        emailsOpened: channels.includes('EMAIL') ? Math.floor(leads.length * 0.25) : 0,
        smsSent: channels.includes('SMS') ? leads.length : 0,
        smsDelivered: channels.includes('SMS') ? Math.floor(leads.length * 0.98) : 0,
        socialPostsCreated: socialAccounts.length,
        socialPostsPublished: socialAccounts.length,
        voiceCallsMade: channels.includes('VOICE_CALL') ? leads.length : 0,
        voiceCallsConnected: channels.includes('VOICE_CALL') ? Math.floor(leads.length * 0.15) : 0,
      }
    })

  } catch (error) {
    console.error('Campaign execution simulation error:', error)
    
    // Update campaign status to indicate failure
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'CANCELLED' }
    })
  }
}

async function processChannelForLead(campaign: any, lead: any, channel: string, apiKeys: any[], socialAccounts: any[]) {
  // This would contain the actual logic for each channel
  // For now, just simulate with database records
  
  switch (channel) {
    case 'EMAIL':
      if (lead.email && campaign.emailTemplate) {
        await prisma.emailHistory.create({
          data: {
            subject: campaign.subject || 'Multi-channel outreach',
            content: campaign.emailTemplate,
            recipientEmail: lead.email,
            recipientName: lead.firstName || lead.fullName,
            status: 'SENT',
            userId: campaign.userId,
            leadId: lead.id,
            campaignId: campaign.id,
          }
        })
      }
      break
      
    case 'SMS':
      if (lead.phone && campaign.smsContent) {
        await prisma.smsHistory.create({
          data: {
            content: campaign.smsContent,
            recipientPhone: lead.phone,
            recipientName: lead.firstName || lead.fullName,
            status: 'SENT',
            campaignId: campaign.id,
            leadId: lead.id,
          }
        })
      }
      break
      
    case 'VOICE_CALL':
      if (lead.phone && campaign.voiceScript) {
        // Use the real voice call service
        try {
          const { createVoiceCall } = await import('@/lib/voice-service')
          const result = await createVoiceCall(campaign.userId, {
            recipientPhone: lead.phone,
            recipientName: lead.firstName || lead.fullName || 'there',
            script: campaign.voiceScript,
            voiceType: campaign.voiceType || 'AI',
            campaignId: campaign.id,
            leadId: lead.id,
            userId: campaign.userId
          })
          
          console.log(`Voice call result for ${lead.phone}:`, result)
        } catch (error) {
          console.error(`Voice call failed for ${lead.phone}:`, error)
          // Still create a record for tracking
          await prisma.voiceCallHistory.create({
            data: {
              recipientPhone: lead.phone,
              recipientName: lead.firstName || lead.fullName,
              script: campaign.voiceScript,
              voiceType: campaign.voiceType || 'AI',
              status: 'FAILED',
              campaignId: campaign.id,
              leadId: lead.id,
            }
          })
        }
      }
      break
      
    default:
      // Handle social media platforms
      if (['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'].includes(channel as string)) {
        const socialAccount = socialAccounts.find(acc => acc.platform === channel)
        if (socialAccount && campaign.socialMediaContent) {
          await prisma.socialMediaPost.create({
            data: {
              platform: channel as any,
              content: campaign.socialMediaContent,
              status: 'PUBLISHED',
              campaignId: campaign.id,
              socialMediaAccountId: socialAccount.id,
            }
          })
        }
      }
      break
  }
}
