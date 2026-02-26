
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        website: validatedData.website || null,
        industry: validatedData.industry || null,
        targetAudience: validatedData.targetAudience || null,
        keywords: validatedData.keywords || [],
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      { message: 'Project created successfully', project },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            leads: true,
            campaigns: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Fetch projects error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
