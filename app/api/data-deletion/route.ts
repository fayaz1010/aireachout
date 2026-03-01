import { NextRequest, NextResponse } from 'next/server'

/**
 * Meta requires a data deletion callback URL.
 * When a user removes the app from Facebook, Meta sends a signed_request here.
 * We return a confirmation URL where users can check deletion status.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    const signedRequest = body.get('signed_request') as string

    if (!signedRequest) {
      return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
    }

    // Decode the signed request (base64url encoded)
    const [, payload] = signedRequest.split('.')
    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    )

    const userId    = decoded.user_id ?? 'unknown'
    const confirmationCode = `DEL-${userId}-${Date.now()}`

    console.log(`[Data Deletion] Request received for Facebook user: ${userId}`)

    // Return required Meta response format
    return NextResponse.json({
      url:    `https://aireachout.com/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    })
  } catch (err) {
    console.error('[Data Deletion] Error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
