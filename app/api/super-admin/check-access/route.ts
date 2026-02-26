import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    return NextResponse.json({ authorized: true })
    
  } catch (error) {
    console.error('Super admin access check failed:', error)
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
