import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    // Mock system settings (in a real app, you'd store these in database)
    const settings = {
      siteName: 'AI Reach Out',
      siteDescription: 'AI-powered outreach platform',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
      maxUsersPerPlan: {
        FREE: 1000,
        STARTER: 5000,
        PROFESSIONAL: 10000,
        ENTERPRISE: -1
      },
      rateLimits: {
        emailsPerHour: 100,
        smsPerHour: 50,
        apiCallsPerMinute: 60
      },
      securitySettings: {
        passwordMinLength: 8,
        requireTwoFactor: false,
        sessionTimeout: 24
      }
    }

    return NextResponse.json(settings)
    
  } catch (error) {
    console.error('Error fetching settings:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    const settings = await request.json()
    
    // In a real app, you'd save these settings to database
    console.log('Saving settings:', settings)
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
    
  } catch (error) {
    console.error('Error saving settings:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
