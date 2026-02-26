
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const callSid = formData.get('CallSid') as string
    const callStatus = formData.get('CallStatus') as string
    const callDuration = formData.get('CallDuration') as string

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 })
    }

    // Find the voice call history record
    const voiceCall = await prisma.voiceCallHistory.findFirst({
      where: {
        externalCallId: callSid
      }
    })

    if (!voiceCall) {
      console.log(`Voice call not found for Twilio SID: ${callSid}`)
      return NextResponse.json({ success: true })
    }

    // Update call status based on Twilio webhook
    let status = voiceCall.status
    let connectedAt = voiceCall.connectedAt
    let endedAt = voiceCall.endedAt
    let duration = voiceCall.duration

    switch (callStatus) {
      case 'ringing':
        status = 'INITIATED'
        break

      case 'in-progress':
        status = 'CONNECTED'
        if (!connectedAt) {
          connectedAt = new Date()
        }
        break

      case 'completed':
      case 'busy':
      case 'no-answer':
        status = 'COMPLETED'
        endedAt = new Date()
        if (callDuration) {
          duration = parseInt(callDuration, 10)
        }
        break

      case 'failed':
      case 'canceled':
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
    console.error('Twilio webhook error:', error)
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
