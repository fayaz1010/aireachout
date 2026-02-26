
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createVoiceCall, VoiceCallOptions } from '@/lib/voice-service'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const voiceCallSchema = z.object({
  recipientPhone: z.string().min(1, 'Phone number is required'),
  recipientName: z.string().optional(),
  script: z.string().min(1, 'Call script is required'),
  voiceType: z.enum(['AI', 'HUMAN']),
  campaignId: z.string().min(1, 'Campaign ID is required'),
  leadId: z.string().min(1, 'Lead ID is required')
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
    const validatedData = voiceCallSchema.parse(body)

    const callOptions: VoiceCallOptions = {
      ...validatedData,
      userId: session.user.id
    }

    const result = await createVoiceCall(session.user.id, callOptions)

    if (result.success) {
      return NextResponse.json({
        message: 'Voice call initiated successfully',
        callId: result.callId,
        status: result.status
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate voice call' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Voice call API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
