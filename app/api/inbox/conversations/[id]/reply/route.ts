import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const FB_PAGE_TOKEN  = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!
const IG_TOKEN       = process.env.INSTAGRAM_ACCESS_TOKEN!
const TELEGRAM_TOKEN = process.env.TELEGRAM_HUB_BOT_TOKEN

async function sendMetaMessage(recipientId: string, text: string, channel: 'FACEBOOK' | 'INSTAGRAM') {
  const token = channel === 'INSTAGRAM' ? IG_TOKEN : FB_PAGE_TOKEN
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`${channel} send failed: ${JSON.stringify(err)}`)
  }
  return res.json()
}

async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text }),
    }
  )
  if (!res.ok) throw new Error('Telegram send failed')
  return res.json()
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Route to correct channel
    let externalId: string | null = null
    switch (conversation.channel) {
      case 'FACEBOOK':
      case 'INSTAGRAM':
        if (!conversation.externalId) throw new Error(`No sender ID on ${conversation.channel} conversation`)
        await sendMetaMessage(conversation.externalId, text, conversation.channel as 'FACEBOOK' | 'INSTAGRAM')
        externalId = conversation.externalId
        break

      case 'TELEGRAM':
        if (!conversation.externalId) throw new Error('No Telegram chat ID')
        await sendTelegramMessage(conversation.externalId, text)
        externalId = conversation.externalId
        break

      default:
        return NextResponse.json(
          { error: `Reply not yet supported for channel: ${conversation.channel}` },
          { status: 400 }
        )
    }

    // Save outbound message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content:        text,
        direction:      'OUTBOUND',
        channel:        conversation.channel,
        senderType:     'AGENT',
        senderId:       session.user.id,
        senderName:     session.user.name ?? session.user.email ?? 'Agent',
        status:         'SENT',
      },
    })

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data:  { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('[Inbox] Reply error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send reply' },
      { status: 500 }
    )
  }
}
