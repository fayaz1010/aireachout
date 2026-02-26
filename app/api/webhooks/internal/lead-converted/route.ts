import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Internal webhook to trigger Socket.IO events from API routes.
 * Called by /api/leads/[id]/convert and email tracking webhooks.
 */
export async function POST(request: NextRequest) {
  const key = request.headers.get('x-internal-key')
  const expected = process.env.INTERNAL_WEBHOOK_KEY || 'local'

  if (key !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // In production with the custom server.js, we'd access io via global or a shared module.
    // For now, this route acts as a notification log point.
    // The actual Socket.IO emit is handled by the server.js
    console.log('[Internal Webhook] Lead event:', body)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
