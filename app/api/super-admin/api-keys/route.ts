
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'

export async function GET() {
  try {
    await requireSuperAdmin()
    
    const apiKeys = await prisma.superAdminApiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        service: true,
        keyName: true,
        isActive: true,
        costPerUse: true,
        markup: true,
        totalUsage: true,
        monthlyUsage: true,
        lastUsed: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(apiKeys)
  } catch (error: any) {
    console.error('Error fetching super admin API keys:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API keys' },
      { status: error.message?.includes('required') ? 403 : 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin()
    
    const { service, keyName, apiKey, costPerUse, markup } = await req.json()
    
    if (!service || !keyName || !apiKey) {
      return NextResponse.json(
        { error: 'Service, key name, and API key are required' },
        { status: 400 }
      )
    }
    
    // Check if key already exists for this service
    const existingKey = await prisma.superAdminApiKey.findUnique({
      where: { service }
    })
    
    if (existingKey) {
      return NextResponse.json(
        { error: 'API key already exists for this service' },
        { status: 409 }
      )
    }
    
    // Encrypt the API key
    const encryptedKey = encrypt(apiKey)
    
    const newKey = await prisma.superAdminApiKey.create({
      data: {
        service,
        keyName,
        encryptedKey,
        costPerUse: costPerUse ? parseFloat(costPerUse) : null,
        markup: parseFloat(markup) || 0.20,
      }
    })
    
    return NextResponse.json({
      id: newKey.id,
      service: newKey.service,
      keyName: newKey.keyName,
      isActive: newKey.isActive,
      costPerUse: newKey.costPerUse,
      markup: newKey.markup,
      totalUsage: newKey.totalUsage,
      monthlyUsage: newKey.monthlyUsage,
      lastUsed: newKey.lastUsed,
      createdAt: newKey.createdAt,
    })
  } catch (error: any) {
    console.error('Error creating super admin API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create API key' },
      { status: 500 }
    )
  }
}
