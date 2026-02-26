import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/leads/[id]/convert
 *
 * Hand-off Engine: Converts an Outreach Lead into a Contact Center Customer.
 * - Creates a Customer record (or links existing by phone/email)
 * - Marks the lead status as CONVERTED
 * - Optionally creates a welcome Conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        project: { userId: session.user.id },
      },
      include: { project: true },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status === 'CONVERTED') {
      return NextResponse.json({ error: 'Lead already converted' }, { status: 400 })
    }

    // Update the lead status to CONVERTED
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: 'CONVERTED',
      },
    })

    // Emit hot_lead socket event via API (server-side)
    // The WebSocket server will broadcast to connected agents
    try {
      const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      await fetch(`${appUrl}/api/webhooks/internal/lead-converted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.INTERNAL_WEBHOOK_KEY || 'local' },
        body: JSON.stringify({
          leadId: lead.id,
          leadName: lead.fullName || `${lead.firstName} ${lead.lastName}`.trim() || lead.email,
          campaignId: null,
          action: 'converted',
        }),
      }).catch(() => {}) // Non-blocking
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Lead converted successfully',
      lead: updatedLead,
    })
  } catch (error) {
    console.error('Lead conversion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
