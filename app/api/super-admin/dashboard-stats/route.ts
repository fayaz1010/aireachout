

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    // Get basic platform statistics (safe queries only)
    const [
      totalUsers,
      activeSubscriptions,
      recentActivity,
      totalProjects,
      totalCampaigns,
      totalLeads
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }).catch(() => 0),
      prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }).catch(() => 0),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        where: { role: { not: 'SUPER_ADMIN' } },
        select: {
          id: true,
          name: true,
          email: true,
          currentPlan: true,
          subscriptionStatus: true,
          createdAt: true
        }
      }).catch(() => []),
      prisma.project.count().catch(() => 0),
      prisma.campaign.count().catch(() => 0),
      prisma.lead.count().catch(() => 0)
    ])
    
    // Calculate aggregate usage from user data
    const usageData = await prisma.user.aggregate({
      _sum: {
        monthlyEmailsSent: true,
        monthlySmsSent: true,
        monthlyVoiceCallsMade: true,
        monthlyLeadsGenerated: true,
        monthlyApiCalls: true
      }
    }).catch(() => ({
      _sum: {
        monthlyEmailsSent: 0,
        monthlySmsSent: 0,
        monthlyVoiceCallsMade: 0,
        monthlyLeadsGenerated: 0,
        monthlyApiCalls: 0
      }
    }))
    
    const emailUsage = usageData._sum.monthlyEmailsSent || 0
    const smsUsage = usageData._sum.monthlySmsSent || 0
    const voiceUsage = usageData._sum.monthlyVoiceCallsMade || 0
    const leadsUsage = usageData._sum.monthlyLeadsGenerated || 0

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      recentActivity,
      totalProjects,
      totalCampaigns,
      totalLeads,
      emailUsage,
      smsUsage,
      voiceUsage,
      leadsUsage
    })
  } catch (error) {
    console.error('Error fetching super admin dashboard stats:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

