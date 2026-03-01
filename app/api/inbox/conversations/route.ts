import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const channel  = searchParams.get('channel')  // filter by channel
    const status   = searchParams.get('status')   // OPEN, RESOLVED, etc.
    const search   = searchParams.get('search')
    const page     = parseInt(searchParams.get('page') ?? '1')
    const limit    = parseInt(searchParams.get('limit') ?? '30')

    const where: any = {
      userId: session.user.id,
      ...(channel && { channel: channel as any }),
      ...(status  && { status:  status  as any }),
      ...(search  && {
        OR: [
          { subject:     { contains: search, mode: 'insensitive' } },
          { customer:    { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, direction: true, createdAt: true, channel: true },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ])

    // Enrich with campaign/lead info if linked
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        let campaign = null
        let lead     = null

        if (conv.campaignId) {
          campaign = await prisma.campaign.findUnique({
            where: { id: conv.campaignId },
            select: { id: true, name: true, campaignType: true, status: true },
          }).catch(() => null)
        }

        if (conv.leadId) {
          lead = await prisma.lead.findUnique({
            where:  { id: conv.leadId },
            select: { id: true, firstName: true, lastName: true, email: true,
                      companyName: true, leadScore: true, status: true },
          }).catch(() => null)
        }

        return { ...conv, campaign, lead }
      })
    )

    return NextResponse.json({
      conversations: enriched,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[Inbox] List error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
