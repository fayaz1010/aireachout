
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { VoiceCallService } from '@/lib/voice-service'

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const voiceService = new VoiceCallService(session.user.id)
    const status = await voiceService.getCallStatus(params.callId)

    return NextResponse.json({
      callId: params.callId,
      status
    })

  } catch (error) {
    console.error('Voice call status API error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
