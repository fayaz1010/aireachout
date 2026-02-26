// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStrategySchema = z.object({
  name: z.string().min(1, 'Strategy name is required'),
  description: z.string().min(1, 'Description is required'),
  objective: z.enum([
    'BRAND_AWARENESS',
    'LEAD_GENERATION', 
    'CUSTOMER_ACQUISITION',
    'CUSTOMER_RETENTION',
    'REVENUE_GROWTH',
    'MARKET_PENETRATION',
    'PRODUCT_LAUNCH',
    'TRIAL_CONVERSION'
  ]),
  targetAudience: z.string().min(1, 'Target audience is required'),
  budget: z.number().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  targetCAC: z.number().optional(),
  targetLTV: z.number().optional(),
  targetConversion: z.number().optional(),
  targetMRR: z.number().optional(),
  targetChurnRate: z.number().optional(),
  channels: z.array(z.enum([
    'CONTENT_MARKETING',
    'SEO',
    'PAID_SEARCH',
    'SOCIAL_MEDIA',
    'EMAIL_MARKETING',
    'INFLUENCER_MARKETING',
    'AFFILIATE_MARKETING',
    'PR_OUTREACH',
    'EVENTS_WEBINARS',
    'DIRECT_SALES',
    'REFERRAL_PROGRAM',
    'PARTNERSHIP_MARKETING'
  ])),
  tactics: z.array(z.string()),
  contentThemes: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const strategies = await prisma.marketingStrategy.findMany({
      where: { userId: session.user.id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            conversions: true,
            revenue: true
          }
        },
        funnels: {
          select: {
            id: true,
            name: true,
            overallConversion: true,
            totalRevenue: true
          }
        },
        experiments: {
          select: {
            id: true,
            name: true,
            status: true,
            winner: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ strategies })
  } catch (error) {
    console.error('Error fetching marketing strategies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing strategies' },
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
    const validatedData = createStrategySchema.parse(body)

    const strategy = await prisma.marketingStrategy.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        campaigns: true,
        funnels: true,
        experiments: true
      }
    })

    return NextResponse.json({ strategy }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating marketing strategy:', error)
    return NextResponse.json(
      { error: 'Failed to create marketing strategy' },
      { status: 500 }
    )
  }
}
