
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const leadId = searchParams.get('leadId')

    let whereClause: any = {}

    // Build filter based on parameters
    if (campaignId) {
      whereClause.campaignId = campaignId
      
      // Verify campaign ownership
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId: session.user.id
        }
      })

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
    }

    if (leadId) {
      whereClause.leadId = leadId
    }

    // If no specific filters, get all calls for this user
    if (!campaignId && !leadId) {
      const userCampaigns = await prisma.campaign.findMany({
        where: { userId: session.user.id },
        select: { id: true }
      })
      
      whereClause.campaignId = {
        in: userCampaigns.map(c => c.id)
      }
    }

    const voiceCalls = await prisma.voiceCallHistory.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: {
            name: true,
            id: true
          }
        },
        lead: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        initiatedAt: 'desc'
      }
    })

    return NextResponse.json({
      calls: voiceCalls,
      total: voiceCalls.length
    })

  } catch (error) {
    console.error('Voice calls fetch error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
