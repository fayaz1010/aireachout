import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    // Mock blog statistics (in a real app, you'd have blog tables)
    const blogStats = {
      totalPosts: 25,
      publishedPosts: 18,
      draftPosts: 7,
      totalViews: 15420,
      monthlyViews: 3250,
      topPosts: [
        { title: 'Getting Started with AI Outreach', views: 2340 },
        { title: 'Best Practices for Email Campaigns', views: 1890 },
        { title: 'Maximizing Lead Generation', views: 1650 }
      ]
    }

    return NextResponse.json(blogStats)
    
  } catch (error) {
    console.error('Error fetching blog stats:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
