// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createFunnelSchema = z.object({
  name: z.string().min(1, 'Funnel name is required'),
  description: z.string().optional(),
  funnelType: z.enum([
    'AWARENESS',
    'ACQUISITION', 
    'ACTIVATION',
    'RETENTION',
    'REVENUE',
    'REFERRAL',
    'FULL_CUSTOMER_JOURNEY'
  ]),
  stages: z.any(), // JSON object with funnel stages
  strategyId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funnels = await prisma.marketingFunnel.findMany({
      where: { userId: session.user.id },
      include: {
        strategy: {
          select: {
            id: true,
            name: true,
            objective: true
          }
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            conversions: true,
            revenue: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ funnels })
  } catch (error) {
    console.error('Error fetching marketing funnels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing funnels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFunnelSchema.parse(body)

    const funnel = await prisma.marketingFunnel.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
      include: {
        strategy: true,
        campaigns: true
      }
    })

    return NextResponse.json({ funnel }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating marketing funnel:', error)
    return NextResponse.json(
      { error: 'Failed to create marketing funnel' },
      { status: 500 }
    )
  }
}
