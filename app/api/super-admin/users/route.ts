// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    console.log('Fetching users from database...')
    
    // First, let's check if we can connect to the database at all
    const userCount = await prisma.user.count()
    console.log('Total user count:', userCount)
    
    // Fetch all users with their usage data (including super admins)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currentPlan: true,
        subscriptionStatus: true,
        emailUsage: true,
        smsUsage: true,
        voiceUsage: true,
        leadsUsage: true,
        apiUsage: true,
        emailLimit: true,
        smsLimit: true,
        voiceCallLimit: true,
        leadsLimit: true,
        apiCallLimit: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Fetched users:', users.length)
    console.log('Users data:', users)

    return NextResponse.json({ users })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
