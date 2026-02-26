
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            leads: true,
            campaigns: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    const project = await prisma.project.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        website: validatedData.website || null,
        industry: validatedData.industry || null,
        targetAudience: validatedData.targetAudience || null,
        keywords: validatedData.keywords || [],
      }
    })

    if (project.count === 0) {
      return NextResponse.json(
        { error: 'Project not found or not owned by user' },
        { status: 404 }
      )
    }

    // Fetch updated project
    const updatedProject = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    })
  } catch (error) {
    console.error('Error updating project:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project = await prisma.project.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (project.count === 0) {
      return NextResponse.json(
        { error: 'Project not found or not owned by user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
