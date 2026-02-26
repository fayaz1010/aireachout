import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Email tracking webhook — Campaign → Conversation Bridge
 *
 * SendGrid/email provider calls this when a recipient opens or clicks an email.
 * We:
 * 1. Update EmailHistory record (openedAt / clickedAt)
 * 2. Update Lead status to CONTACTED/RESPONDED
 * 3. Emit 'lead:hot' Socket.IO event so agents see the "Hot Lead" alert in real-time
 */
export async function POST(request: NextRequest) {
  try {
    const events = await request.json()
    const eventList = Array.isArray(events) ? events : [events]

    for (const event of eventList) {
      const { event: eventType, email, sg_message_id, url } = event

      if (!email) continue

      // Find the email history record by recipient email
      const emailHistory = await prisma.emailHistory.findFirst({
        where: { recipientEmail: email },
        orderBy: { sentAt: 'desc' },
        include: {
          lead: { select: { id: true, fullName: true, firstName: true, lastName: true, status: true } },
          campaign: { select: { id: true, name: true } },
        },
      })

      if (!emailHistory) continue

      const now = new Date()

      if (eventType === 'open') {
        // Mark as opened
        await prisma.emailHistory.update({
          where: { id: emailHistory.id },
          data: {
            openedAt: emailHistory.openedAt || now,
            openCount: { increment: 1 },
            status: 'OPENED',
          },
        })

        // Update lead if not already responded
        if (emailHistory.lead && ['NEW', 'CONTACTED'].includes(emailHistory.lead.status)) {
          await prisma.lead.update({
            where: { id: emailHistory.lead.id },
            data: { status: 'CONTACTED', lastContacted: now },
          })
        }

        // Emit hot lead event (via internal route or direct io access)
        emitHotLeadAlert({
          leadId: emailHistory.lead?.id || '',
          leadName: emailHistory.lead?.fullName ||
            `${emailHistory.lead?.firstName || ''} ${emailHistory.lead?.lastName || ''}`.trim() ||
            email,
          action: 'opened your email',
          campaignId: emailHistory.campaignId || undefined,
          campaignName: emailHistory.campaign?.name || undefined,
        })

      } else if (eventType === 'click') {
        await prisma.emailHistory.update({
          where: { id: emailHistory.id },
          data: {
            clickedAt: emailHistory.clickedAt || now,
            clickCount: { increment: 1 },
            status: 'CLICKED',
          },
        })

        if (emailHistory.lead && emailHistory.lead.status !== 'CONVERTED') {
          await prisma.lead.update({
            where: { id: emailHistory.lead.id },
            data: { status: 'RESPONDED', lastContacted: now },
          })
        }

        emitHotLeadAlert({
          leadId: emailHistory.lead?.id || '',
          leadName: emailHistory.lead?.fullName ||
            `${emailHistory.lead?.firstName || ''} ${emailHistory.lead?.lastName || ''}`.trim() ||
            email,
          action: 'clicked your email link',
          campaignId: emailHistory.campaignId || undefined,
          campaignName: emailHistory.campaign?.name || undefined,
          url,
        })
      }
    }

    return NextResponse.json({ processed: eventList.length })
  } catch (error) {
    console.error('Email tracking webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

function emitHotLeadAlert(data: {
  leadId: string
  leadName: string
  action: string
  campaignId?: string
  campaignName?: string
  url?: string
}) {
  // Access the Socket.IO server attached by server.js
  // In production with custom server, this works via global.__io
  try {
    const io = (global as any).__io
    if (io) {
      io.emit('lead:hot', {
        ...data,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (e) {
    console.warn('Socket.IO not available for hot lead emit')
  }
}
