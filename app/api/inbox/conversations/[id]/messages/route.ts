import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        customer: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Enrich with campaign and lead
    let campaign = null
    let lead     = null

    if (conversation.campaignId) {
      campaign = await prisma.campaign.findUnique({
        where:  { id: conversation.campaignId },
        select: { id: true, name: true, campaignType: true, status: true, subject: true },
      }).catch(() => null)
    }

    if (conversation.leadId) {
      lead = await prisma.lead.findUnique({
        where:  { id: conversation.leadId },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true,
                  companyName: true, jobTitle: true, leadScore: true, status: true, tags: true,
                  projectId: true },
      }).catch(() => null)
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: { conversationId: params.id, direction: 'INBOUND', status: { not: 'READ' } },
      data:  { status: 'READ', readAt: new Date() },
    })

    return NextResponse.json({ ...conversation, campaign, lead })
  } catch (error) {
    console.error('[Inbox] Messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
