// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if user has super admin access
    await requireSuperAdmin()
    
    // Get billing statistics
    const [
      totalRevenue,
      monthlyRevenue,
      recentInvoices,
      revenueByPlan,
      usageStats,
      overdueBills
    ] = await Promise.all([
      // Total revenue from successful transactions
      prisma.billingHistory.aggregate({
        where: { 
          type: { in: ['SUBSCRIPTION', 'USAGE_CHARGE'] },
          status: 'SUCCEEDED'
        },
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0),
      
      // Monthly revenue from successful transactions
      prisma.billingHistory.aggregate({
        where: {
          type: { in: ['SUBSCRIPTION', 'USAGE_CHARGE'] },
          status: 'SUCCEEDED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      }).then(result => result._sum.amount || 0),
      
      // Recent invoices
      prisma.billingHistory.findMany({
        where: { type: { in: ['SUBSCRIPTION', 'USAGE_CHARGE'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      // Revenue by plan
      prisma.user.groupBy({
        by: ['currentPlan'],
        where: { role: { not: 'SUPER_ADMIN' } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      
      // Usage statistics from user data
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          currentPlan: true,
          emailUsage: true,
          smsUsage: true,
          voiceUsage: true,
          leadsUsage: true,
          apiUsage: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      
      // Overdue bills
      prisma.billingHistory.findMany({
        where: {
          status: 'FAILED',
          createdAt: {
            lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      recentInvoices,
      revenueByPlan,
      usageStats,
      overdueBills
    })
    
  } catch (error) {
    console.error('Error fetching billing data:', error)
    
    if (error instanceof Error && error.message === 'Super admin access required') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
