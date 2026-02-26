
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        apiKeys: {
          select: {
            id: true,
            service: true,
            keyName: true,
            isActive: true,
            lastUsed: true,
            createdAt: true,
            // Don't return encrypted keys for security
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      apiKeys: user.apiKeys
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { service, keyName, apiKey } = await request.json()

    if (!service || !keyName || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate service enum
    const validServices = ['GEMINI', 'GOOGLE_SEARCH', 'APIFY', 'PERPLEXITY', 'ELEVENLABS', 'VAPI', 'SENDGRID', 'TWILIO']
    if (!validServices.includes(service)) {
      return NextResponse.json({ error: 'Invalid service' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a key for this service
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        userId_service: {
          userId: user.id,
          service: service
        }
      }
    })

    if (existingKey) {
      return NextResponse.json({ 
        error: 'You already have an API key for this service. Delete the existing one first.' 
      }, { status: 400 })
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey)

    // Create new API key
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        service: service,
        keyName,
        encryptedKey
      }
    })

    return NextResponse.json({
      success: true,
      message: 'API key added successfully',
      apiKey: {
        id: newApiKey.id,
        service: newApiKey.service,
        keyName: newApiKey.keyName,
        isActive: newApiKey.isActive,
        createdAt: newApiKey.createdAt
      }
    })
  } catch (error) {
    console.error('Error adding API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, isActive } = await request.json()

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update API key status
    const updatedKey = await prisma.apiKey.updateMany({
      where: {
        id,
        userId: user.id
      },
      data: { isActive }
    })

    if (updatedKey.count === 0) {
      return NextResponse.json({ error: 'API key not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'API key status updated successfully'
    })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete API key
    const deletedKey = await prisma.apiKey.deleteMany({
      where: {
        id,
        userId: user.id
      }
    })

    if (deletedKey.count === 0) {
      return NextResponse.json({ error: 'API key not found or not owned by user' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
