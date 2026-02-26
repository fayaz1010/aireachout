// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCompetitorSchema = z.object({
  competitorName: z.string().min(1, 'Competitor name is required'),
  website: z.string().url().optional(),
  description: z.string().optional(),
  marketShare: z.number().min(0).max(100).optional(),
  pricing: z.any().optional(), // JSON object
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  features: z.array(z.string()),
  uniqueSellingProp: z.string().optional(),
  targetMarket: z.string().optional(),
  marketingChannels: z.array(z.string()),
  messaging: z.string().optional(),
  contentStrategy: z.string().optional(),
  estimatedRevenue: z.number().optional(),
  estimatedCustomers: z.number().optional(),
  growthRate: z.number().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitors = await prisma.competitorAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { lastAnalyzed: 'desc' }
    })

    return NextResponse.json({ competitors })
  } catch (error) {
    console.error('Error fetching competitor analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor analysis' },
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
    const validatedData = createCompetitorSchema.parse(body)

    const competitor = await prisma.competitorAnalysis.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      }
    })

    return NextResponse.json({ competitor }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating competitor analysis:', error)
    return NextResponse.json(
      { error: 'Failed to create competitor analysis' },
      { status: 500 }
    )
  }
}
