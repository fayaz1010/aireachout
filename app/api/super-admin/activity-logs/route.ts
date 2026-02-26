import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    // Mock activity logs data (in a real app, you'd have an activity log table)
    const activities = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        action: 'login',
        resource: 'authentication',
        details: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date().toISOString(),
        status: 'SUCCESS' as const
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        action: 'email_sent',
        resource: 'campaign',
        details: 'Email campaign sent to 150 recipients',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'SUCCESS' as const
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Bob Johnson',
        userEmail: 'bob@example.com',
        action: 'api_call',
        resource: 'leads',
        details: 'Failed to fetch leads - rate limit exceeded',
        ipAddress: '192.168.1.102',
        userAgent: 'PostmanRuntime/7.28.4',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'FAILED' as const
      }
    ]

    return NextResponse.json({ activities })
    
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
