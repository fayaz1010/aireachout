import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 401 })
    }

    // Count conversations that have at least one unread inbound message
    const count = await prisma.conversation.count({
      where: {
        userId: session.user.id,
        status: { not: 'CLOSED' },
        messages: {
          some: {
            direction: 'INBOUND',
            status:    { notIn: ['READ'] },
          },
        },
      },
    })

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
