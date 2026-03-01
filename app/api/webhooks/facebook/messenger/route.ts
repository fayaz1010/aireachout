import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const APP_SECRET    = process.env.FACEBOOK_APP_SECRET!
const VERIFY_TOKEN  = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN ?? 'aireachout_webhook_verify_2026'
const PAGE_TOKEN    = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!

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

    // Verify request signature (X-Hub-Signature-256)
    const signature = request.headers.get('x-hub-signature-256')
    if (APP_SECRET && signature) {
      const { createHmac } = await import('crypto')
      const expected = 'sha256=' + createHmac('sha256', APP_SECRET).update(body).digest('hex')
      if (signature !== expected) {
        console.warn('[FB Messenger] Invalid signature — possible spoofed request')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    const payload = JSON.parse(body)

    // Facebook sends batched entries
    if (payload.object !== 'page') {
      return NextResponse.json({ ok: true })
    }

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        await handleMessagingEvent(event)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[FB Messenger] Webhook error:', err)
    // Always return 200 to prevent Facebook from disabling the webhook
    return NextResponse.json({ ok: false, error: String(err) })
  }
}

async function handleMessagingEvent(event: any) {
  // Skip message echoes (messages sent BY the page)
  if (event.message?.is_echo) return
  // Skip read receipts and delivery confirmations
  if (event.read || event.delivery) return

  const senderId   = event.sender?.id as string
  const pageId     = event.recipient?.id as string
  const messageText = event.message?.text ?? ''
  const timestamp  = event.timestamp ? new Date(event.timestamp) : new Date()

  if (!senderId) return

  // Fetch sender profile from Facebook Graph API
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

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: { userId: pageId, telegram: senderId }, // reusing telegram field for FB sender ID
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        userId:   pageId,
        name:     senderName,
        telegram: senderId, // storing FB PSID here until schema has dedicated field
        tags:     ['facebook', 'messenger'],
      },
    })
  }

  // Find or create conversation (keyed by FB PSID)
  let conversation = await prisma.conversation.findFirst({
    where: {
      userId:     pageId,
      channel:    'FACEBOOK',
      externalId: senderId,
      status:     { not: 'CLOSED' },
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId:     pageId,
        customerId: customer.id,
        channel:    'FACEBOOK',
        externalId: senderId,
        source:     'SOCIAL',
        status:     'OPEN',
      },
    })
  }

  // Save the inbound message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content:        messageText || '[attachment]',
      direction:      'INBOUND',
      channel:        'FACEBOOK',
      senderType:     'CUSTOMER',
      senderId:       senderId,
      senderName:     senderName,
      status:         'DELIVERED',
      deliveredAt:    timestamp,
      attachments:    event.message?.attachments
        ? JSON.parse(JSON.stringify(event.message.attachments))
        : undefined,
    },
  })

  // Mark as seen on Messenger
  if (PAGE_TOKEN) {
    fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        recipient:      { id: senderId },
        sender_action:  'mark_seen',
      }),
    }).catch(() => {})
  }

  console.log(`[FB Messenger] Message saved — sender: ${senderName}, text: ${messageText?.slice(0, 60)}`)
}
