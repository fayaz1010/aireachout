
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSuperAdmin()
    const { id } = params
    
    const apiKey = await prisma.superAdminApiKey.findUnique({
      where: { id },
      select: { encryptedKey: true }
    })
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }
    
    const decryptedKey = decrypt(apiKey.encryptedKey)
    
    return NextResponse.json({ decryptedKey })
  } catch (error: any) {
    console.error('Error decrypting super admin API key:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decrypt API key' },
      { status: 500 }
    )
  }
}
