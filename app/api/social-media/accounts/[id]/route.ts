
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic"

const updateAccountSchema = z.object({
  isActive: z.boolean().optional(),
  followerCount: z.number().optional(),
  profileUrl: z.string().optional(),
})

export async function PATCH(
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
    const validatedData = updateAccountSchema.parse(body)

    // Verify account ownership
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    const updatedAccount = await prisma.socialMediaAccount.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountType: true,
        followerCount: true,
        profileUrl: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: 'Account updated successfully',
      account: updatedAccount
    })
  } catch (error) {
    console.error('Update social media account error:', error)
    
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

    // Verify account ownership
    const account = await prisma.socialMediaAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    await prisma.socialMediaAccount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete social media account error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
