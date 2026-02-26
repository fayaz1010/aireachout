
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { encrypt } from '@/lib/crypto'

export const dynamic = "force-dynamic"

const addAccountSchema = z.object({
  platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE']),
  accountName: z.string().min(1, 'Account name is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  accountType: z.enum(['business', 'personal', 'creator']).optional(),
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
    const validatedData = addAccountSchema.parse(body)

    // Check if account already exists for this platform and user
    const existingAccount = await prisma.socialMediaAccount.findUnique({
      where: {
        userId_platform_accountName: {
          userId: session.user.id,
          platform: validatedData.platform,
          accountName: validatedData.accountName
        }
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already exists for this platform' },
        { status: 400 }
      )
    }

    // Encrypt the tokens
    const encryptedAccessToken = encrypt(validatedData.accessToken)
    const encryptedRefreshToken = validatedData.refreshToken ? encrypt(validatedData.refreshToken) : null

    const account = await prisma.socialMediaAccount.create({
      data: {
        platform: validatedData.platform,
        accountName: validatedData.accountName,
        accountType: validatedData.accountType || 'business',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      { message: 'Social media account added successfully', account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        accountType: account.accountType,
        isActive: account.isActive,
        createdAt: account.createdAt
      }},
      { status: 201 }
    )
  } catch (error) {
    console.error('Add social media account error:', error)
    
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

    const accounts = await prisma.socialMediaAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        accountName: true,
        accountType: true,
        followerCount: true,
        profileUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Fetch social media accounts error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
