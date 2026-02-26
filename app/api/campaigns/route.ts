
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const createCampaignSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Campaign name is required'),
  campaignType: z.enum(['EMAIL', 'SOCIAL_MEDIA', 'SMS', 'VOICE_CALL', 'MULTI_CHANNEL']).optional(),
  communicationChannels: z.array(z.string()).min(1, 'At least one communication channel is required'),
  
  // Email fields (optional)
  subject: z.string().optional(),
  emailTemplate: z.string().optional(),
  
  // Social media fields (optional)
  socialMediaContent: z.string().optional(),
  socialMediaPlatforms: z.array(z.string()).optional(),
  
  // SMS fields (optional)
  smsContent: z.string().optional(),
  
  // Voice call fields (optional)
  voiceScript: z.string().optional(),
  voiceType: z.enum(['AI', 'HUMAN']).optional(),
  
  // Common fields
  useAiPersonalization: z.boolean().optional(),
  personalizationPrompt: z.string().optional(),
  targetTags: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
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
    const validatedData = createCampaignSchema.parse(body)

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        campaignType: validatedData.campaignType || 'MULTI_CHANNEL',
        communicationChannels: validatedData.communicationChannels as any,
        
        // Email fields
        subject: validatedData.subject || null,
        emailTemplate: validatedData.emailTemplate || null,
        
        // Social media fields
        socialMediaContent: validatedData.socialMediaContent || null,
        socialMediaPlatforms: (validatedData.socialMediaPlatforms || []) as any,
        
        // SMS fields
        smsContent: validatedData.smsContent || null,
        
        // Voice call fields
        voiceScript: validatedData.voiceScript || null,
        voiceType: validatedData.voiceType || 'AI',
        
        // Common fields
        useAiPersonalization: validatedData.useAiPersonalization ?? true,
        personalizationPrompt: validatedData.personalizationPrompt || null,
        targetTags: validatedData.targetTags || [],
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        userId: session.user.id,
        projectId: validatedData.projectId,
        status: validatedData.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    })

    return NextResponse.json(
      { message: 'Campaign created successfully', campaign },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create campaign error:', error)
    
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Fetch campaigns error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
