
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/crypto'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    
    const { keyName, apiKey, costPerUse, markup } = await req.json()
    const { id } = params
    
    if (!keyName) {
      return NextResponse.json(
        { error: 'Key name is required' },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData: any = {
      keyName,
      costPerUse: costPerUse ? parseFloat(costPerUse) : null,
      markup: parseFloat(markup) || 0.20,
    }
    
    // Only update the API key if provided
    if (apiKey) {
      updateData.encryptedKey = encrypt(apiKey)
    }
    
    const updatedKey = await prisma.superAdminApiKey.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({
      id: updatedKey.id,
      service: updatedKey.service,
      keyName: updatedKey.keyName,
      isActive: updatedKey.isActive,
      costPerUse: updatedKey.costPerUse,
      markup: updatedKey.markup,
      totalUsage: updatedKey.totalUsage,
      monthlyUsage: updatedKey.monthlyUsage,
      lastUsed: updatedKey.lastUsed,
      createdAt: updatedKey.createdAt,
    })
  } catch (error: any) {
    console.error('Error updating super admin API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update API key' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    const { id } = params
    
    await prisma.superAdminApiKey.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting super admin API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
