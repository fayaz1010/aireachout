// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const responseTrackingSchema = z.object({
  leadId: z.string(),
  campaignId: z.string(),
  responseType: z.enum(['EMAIL_REPLY', 'SMS_REPLY', 'CALL_ANSWERED', 'SOCIAL_ENGAGEMENT', 'WEBSITE_VISIT', 'FORM_SUBMISSION']),
  responseData: z.object({
    content: z.string().optional(),
    sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
    intent: z.enum(['INTERESTED', 'NOT_INTERESTED', 'REQUEST_INFO', 'SCHEDULE_DEMO', 'PRICING_INQUIRY']).optional(),
    channel: z.string(),
    timestamp: z.string()
  }),
  conversionStage: z.enum(['AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = responseTrackingSchema.parse(body)

    // Get the lead and campaign to ensure they belong to the user
    const lead = await prisma.lead.findFirst({
      where: {
        id: validatedData.leadId,
        userId: session.user.id
      },
      include: {
        campaign: {
          include: {
            marketingStrategy: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create response tracking record
    const responseRecord = await prisma.leadResponse.create({
      data: {
        leadId: validatedData.leadId,
        campaignId: validatedData.campaignId,
        userId: session.user.id,
        responseType: validatedData.responseType,
        responseContent: validatedData.responseData.content,
        sentiment: validatedData.responseData.sentiment || 'NEUTRAL',
        intent: validatedData.responseData.intent || 'INTERESTED',
        channel: validatedData.responseData.channel,
        conversionStage: validatedData.conversionStage || 'INTEREST',
        responseMetadata: validatedData.responseData
      }
    })

    // Update lead status based on response
    const newLeadStatus = determineLeadStatus(validatedData.responseData.intent, validatedData.responseData.sentiment)
    
    await prisma.lead.update({
      where: { id: validatedData.leadId },
      data: {
        status: newLeadStatus,
        lastContactedAt: new Date(),
        responseCount: {
          increment: 1
        },
        conversionStage: validatedData.conversionStage || 'INTEREST'
      }
    })

    // Trigger automated follow-up based on response type and strategy
    const followUpAction = await determineFollowUpAction(lead, validatedData)
    if (followUpAction) {
      await scheduleFollowUp(followUpAction)
    }

    // Update campaign conversion metrics
    await updateCampaignMetrics(validatedData.campaignId, validatedData.responseType, validatedData.responseData.sentiment)

    return NextResponse.json({
      success: true,
      responseId: responseRecord.id,
      leadStatus: newLeadStatus,
      followUpScheduled: !!followUpAction,
      nextAction: followUpAction?.action || null,
      message: 'Response tracked successfully'
    })

  } catch (error) {
    console.error('Response tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track response' },
      { status: 500 }
    )
  }
}

function determineLeadStatus(intent: string | undefined, sentiment: string | undefined) {
  if (intent === 'SCHEDULE_DEMO' || intent === 'PRICING_INQUIRY') {
    return 'HOT'
  } else if (intent === 'REQUEST_INFO' || sentiment === 'POSITIVE') {
    return 'WARM'
  } else if (intent === 'NOT_INTERESTED' || sentiment === 'NEGATIVE') {
    return 'COLD'
  } else {
    return 'CONTACTED'
  }
}

async function determineFollowUpAction(lead: any, responseData: any) {
  const strategy = lead.campaign.marketingStrategy
  
  // AI-powered follow-up determination based on strategy and response
  const followUpActions = {
    'FREEMIUM': {
      'INTERESTED': {
        action: 'SEND_TRIAL_LINK',
        delay: 0, // immediate
        template: 'freemium_trial_signup'
      },
      'REQUEST_INFO': {
        action: 'SEND_PRODUCT_DEMO',
        delay: 2 * 60 * 60 * 1000, // 2 hours
        template: 'freemium_demo_video'
      },
      'SCHEDULE_DEMO': {
        action: 'SCHEDULE_SALES_CALL',
        delay: 30 * 60 * 1000, // 30 minutes
        template: 'freemium_sales_call'
      }
    },
    'CONTENT_MARKETING': {
      'INTERESTED': {
        action: 'SEND_CONTENT_SERIES',
        delay: 24 * 60 * 60 * 1000, // 24 hours
        template: 'content_nurture_sequence'
      },
      'REQUEST_INFO': {
        action: 'SEND_CASE_STUDY',
        delay: 4 * 60 * 60 * 1000, // 4 hours
        template: 'content_case_study'
      }
    },
    'REFERRAL_PROGRAM': {
      'INTERESTED': {
        action: 'SEND_REFERRAL_DETAILS',
        delay: 2 * 60 * 60 * 1000, // 2 hours
        template: 'referral_program_details'
      }
    },
    'PARTNERSHIP': {
      'INTERESTED': {
        action: 'SCHEDULE_PARTNERSHIP_CALL',
        delay: 60 * 60 * 1000, // 1 hour
        template: 'partnership_discussion'
      }
    }
  }

  const strategyActions = followUpActions[strategy?.objective as keyof typeof followUpActions]
  if (!strategyActions) return null

  const intent = responseData.responseData.intent || 'INTERESTED'
  const action = strategyActions[intent as keyof typeof strategyActions]

  if (!action) return null

  return {
    leadId: lead.id,
    campaignId: lead.campaignId,
    action: action.action,
    delay: action.delay,
    template: action.template,
    scheduledFor: new Date(Date.now() + action.delay)
  }
}

async function scheduleFollowUp(followUpAction: any) {
  // Create follow-up task in database
  await prisma.followUpTask.create({
    data: {
      leadId: followUpAction.leadId,
      campaignId: followUpAction.campaignId,
      action: followUpAction.action,
      template: followUpAction.template,
      scheduledFor: followUpAction.scheduledFor,
      status: 'SCHEDULED'
    }
  })

  // In production, this would integrate with a job queue (Bull, Agenda, etc.)
  console.log('Follow-up scheduled:', followUpAction)
}

async function updateCampaignMetrics(campaignId: string, responseType: string, sentiment: string | undefined) {
  const updateData: any = {}

  // Update response counts
  if (responseType === 'EMAIL_REPLY') {
    updateData.emailsReplied = { increment: 1 }
  }

  // Update conversion metrics based on sentiment
  if (sentiment === 'POSITIVE') {
    updateData.positiveResponses = { increment: 1 }
  } else if (sentiment === 'NEGATIVE') {
    updateData.negativeResponses = { increment: 1 }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData
    })
  }
}
