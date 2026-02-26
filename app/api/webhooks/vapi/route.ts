
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Vapi webhook payload structure
    const { call, message } = body

    if (!call?.id) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Find the voice call history record
    const voiceCall = await prisma.voiceCallHistory.findFirst({
      where: {
        externalCallId: call.id
      }
    })

    if (!voiceCall) {
      console.log(`Voice call not found for Vapi call ID: ${call.id}`)
      return NextResponse.json({ success: true })
    }

    // Update call status based on Vapi webhook
    let status = voiceCall.status
    let connectedAt = voiceCall.connectedAt
    let endedAt = voiceCall.endedAt
    let duration = voiceCall.duration

    switch (message?.type || call.status) {
      case 'call-started':
      case 'started':
        status = 'CONNECTED'
        connectedAt = new Date()
        break

      case 'call-ended':
      case 'ended':
        status = 'COMPLETED'
        endedAt = new Date()
        if (call.duration) {
          duration = Math.floor(call.duration)
        }
        break

      case 'call-failed':
      case 'failed':
        status = 'FAILED'
        endedAt = new Date()
        break
    }

    // Update the voice call history
    await prisma.voiceCallHistory.update({
      where: { id: voiceCall.id },
      data: {
        status: status as any,
        connectedAt,
        endedAt,
        duration
      }
    })

    // Update campaign statistics if needed
    if (voiceCall.campaignId) {
      await updateCampaignStats(voiceCall.campaignId)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Vapi webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function updateCampaignStats(campaignId: string) {
  try {
    // Get all voice calls for this campaign
    const voiceCalls = await prisma.voiceCallHistory.findMany({
      where: { campaignId }
    })

    const voiceCallsMade = voiceCalls.length
    const voiceCallsConnected = voiceCalls.filter(call => 
      ['CONNECTED', 'COMPLETED'].includes(call.status)
    ).length

    // Update campaign statistics
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        voiceCallsMade,
        voiceCallsConnected
      }
    })

  } catch (error) {
    console.error('Error updating campaign stats:', error)
  }
}
