import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const APP_SECRET   = process.env.FACEBOOK_APP_SECRET!
const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN ?? 'aireachout_webhook_verify_2026'
const PAGE_TOKEN   = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!
const ADMIN_EMAIL  = process.env.SUPER_ADMIN_EMAIL

/** Resolve the platform User ID that owns this Facebook page (cached per cold start) */
let _ownerUserId: string | null = null
async function getOwnerUserId(): Promise<string | null> {
  if (_ownerUserId) return _ownerUserId
  if (ADMIN_EMAIL) {
    const user = await prisma.user.findUnique({
      where:  { email: ADMIN_EMAIL },
      select: { id: true },
    }).catch(() => null)
    if (user) { _ownerUserId = user.id; return user.id }
  }
  // Fall back to first user in the platform
  const first = await prisma.user.findFirst({ select: { id: true } }).catch(() => null)
  if (first) { _ownerUserId = first.id; return first.id }
  return null
}

/** GET — Facebook webhook verification handshake */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[FB Messenger] Webhook verified ✓')
    return new NextResponse(challenge, { status: 200 })
  }

  console.warn('[FB Messenger] Verification failed — token mismatch')
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/** POST — incoming messages and events from Facebook Messenger */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Verify X-Hub-Signature-256
    const signature = request.headers.get('x-hub-signature-256')
    if (APP_SECRET && signature) {
      const { createHmac } = await import('crypto')
      const expected = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
      if (signature !== expected) {
        console.warn('[FB Messenger] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    const payload = JSON.parse(body)
    if (payload.object !== 'page') return NextResponse.json({ ok: true })

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleMessagingEvent(event).catch(err =>
          console.error('[FB Messenger] Event error:', err)
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[FB Messenger] Webhook error:', err)
    // Always 200 — prevents Facebook from disabling the webhook
    return NextResponse.json({ ok: false, error: String(err) })
  }
}

async function handleMessagingEvent(event: any) {
  if (event.message?.is_echo) return
  if (event.read || event.delivery) return

  const senderId    = event.sender?.id as string
  const messageText = event.message?.text ?? ''
  const timestamp   = event.timestamp ? new Date(event.timestamp) : new Date()

  if (!senderId) return

  const userId = await getOwnerUserId()
  if (!userId) {
    console.error('[FB Messenger] No platform user found — cannot save message')
    return
  }

  // Fetch sender profile
  let senderName = `FB User ${senderId}`
  try {
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${senderId}?fields=name,first_name,last_name&access_token=${PAGE_TOKEN}`
    )
    if (profileRes.ok) {
      const profile = await profileRes.json()
      senderName = profile.name ?? senderName
    }
  } catch { /* non-critical */ }

  // Find or create Customer
  let customer = await prisma.customer.findFirst({
    where: { userId, telegram: senderId },
  })
  if (!customer) {
    customer = await prisma.customer.create({
      data: { userId, name: senderName, telegram: senderId, tags: ['facebook', 'messenger'] },
    })
  }

  // Try to match a Lead (by name similarity or existing link)
  let leadId:     string | null = null
  let campaignId: string | null = null

  const nameParts = senderName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName  = nameParts.slice(1).join(' ') || undefined

  const lead = await prisma.lead.findFirst({
    where: {
      project: { userId },
      OR: [
        { firstName: { equals: firstName, mode: 'insensitive' } },
        ...(lastName ? [{ lastName: { equals: lastName, mode: 'insensitive' } }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => null)

  if (lead) {
    leadId = lead.id
    // Find the most recent sent/active campaign that targeted this lead
    const campaign = await prisma.campaign.findFirst({
      where: {
        userId,
        targetLeadIds: { has: lead.id },
        status:        { not: 'DRAFT' },
      },
      orderBy: { sentAt: 'desc' },
      select:  { id: true },
    }).catch(() => null)
    campaignId = campaign?.id ?? null
  }

  // Find or create Conversation
  let conversation = await prisma.conversation.findFirst({
    where: { userId, channel: 'FACEBOOK', externalId: senderId, status: { not: 'CLOSED' } },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        customerId: customer.id,
        channel:    'FACEBOOK',
        externalId: senderId,
        source:     'SOCIAL',
        status:     'OPEN',
        ...(leadId     && { leadId }),
        ...(campaignId && { campaignId }),
      },
    })
  } else if ((!conversation.leadId && leadId) || (!conversation.campaignId && campaignId)) {
    // Enrich existing conversation with newly matched lead/campaign
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        ...(leadId     && { leadId }),
        ...(campaignId && { campaignId }),
      },
    })
  }

  // Save message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content:        messageText || '[attachment]',
      direction:      'INBOUND',
      channel:        'FACEBOOK',
      senderType:     'CUSTOMER',
      senderId,
      senderName,
      status:         'DELIVERED',
      deliveredAt:    timestamp,
      attachments:    event.message?.attachments
        ? JSON.parse(JSON.stringify(event.message.attachments))
        : undefined,
    },
  })

  // Mark seen
  if (PAGE_TOKEN) {
    fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ recipient: { id: senderId }, sender_action: 'mark_seen' }),
    }).catch(() => {})
  }

  console.log(
    `[FB Messenger] Saved — ${senderName} | lead: ${leadId ?? 'none'} | campaign: ${campaignId ?? 'none'} | "${messageText?.slice(0, 60)}"`
  )
}
