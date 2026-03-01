import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const APP_SECRET   = process.env.FACEBOOK_APP_SECRET!
const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN ?? 'aireachout_webhook_verify_2026'
const IG_TOKEN     = process.env.INSTAGRAM_ACCESS_TOKEN!
const ADMIN_EMAIL  = process.env.SUPER_ADMIN_EMAIL

let _ownerUserId: string | null = null
async function getOwnerUserId(): Promise<string | null> {
  if (_ownerUserId) return _ownerUserId
  if (ADMIN_EMAIL) {
    const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL }, select: { id: true } }).catch(() => null)
    if (user) { _ownerUserId = user.id; return user.id }
  }
  const first = await prisma.user.findFirst({ select: { id: true } }).catch(() => null)
  if (first) { _ownerUserId = first.id; return first.id }
  return null
}

/** GET — webhook verification (shared verify token with Facebook) */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Instagram] Webhook verified ✓')
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/** POST — incoming Instagram DM events */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    const signature = request.headers.get('x-hub-signature-256')
    if (APP_SECRET && signature) {
      const { createHmac } = await import('crypto')
      const expected = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    const payload = JSON.parse(body)

    // Instagram webhooks use object: 'instagram'
    if (payload.object !== 'instagram') return NextResponse.json({ ok: true })

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleInstagramEvent(event).catch(err =>
          console.error('[Instagram] Event error:', err)
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Instagram] Webhook error:', err)
    return NextResponse.json({ ok: false, error: String(err) })
  }
}

async function handleInstagramEvent(event: any) {
  if (event.message?.is_echo) return
  if (event.read || event.delivery) return

  const senderId    = event.sender?.id as string
  const messageText = event.message?.text ?? ''
  const timestamp   = event.timestamp ? new Date(event.timestamp) : new Date()

  if (!senderId) return

  const userId = await getOwnerUserId()
  if (!userId) {
    console.error('[Instagram] No platform user found')
    return
  }

  // Fetch Instagram profile via Graph API
  let senderName = `Instagram User ${senderId}`
  try {
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${senderId}?fields=name,username&access_token=${IG_TOKEN}`
    )
    if (profileRes.ok) {
      const profile = await profileRes.json()
      senderName = profile.name ?? (profile.username ? `@${profile.username}` : senderName)
    }
  } catch { /* non-critical */ }

  // Find or create Customer
  let customer = await prisma.customer.findFirst({
    where: { userId, telegram: senderId, tags: { has: 'instagram' } },
  })
  if (!customer) {
    customer = await prisma.customer.create({
      data: { userId, name: senderName, telegram: senderId, tags: ['instagram', 'dm'] },
    })
  }

  // Find or create Conversation
  let conversation = await prisma.conversation.findFirst({
    where: { userId, channel: 'INSTAGRAM', externalId: senderId, status: { not: 'CLOSED' } },
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId,
        customerId: customer.id,
        channel:    'INSTAGRAM',
        externalId: senderId,
        source:     'SOCIAL',
        status:     'OPEN',
      },
    })
  }

  // Save message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content:        messageText || '[attachment]',
      direction:      'INBOUND',
      channel:        'INSTAGRAM',
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
  if (IG_TOKEN) {
    fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${IG_TOKEN}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ recipient: { id: senderId }, sender_action: 'mark_seen' }),
    }).catch(() => {})
  }

  console.log(`[Instagram] Message saved — ${senderName}: "${messageText?.slice(0, 60)}"`)
}
