// @ts-nocheck
import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireSuperAdmin()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalUsers,
      activeUsers,
      trialUsers,
      newUsersThisMonth,
      churnedThisMonth,
      planBreakdown,
      usageSums,
      mrrThisMonth,
      mrrLastMonth,
      monthlySignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.user.count({ where: { subscriptionStatus: 'TRIAL' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({
        where: {
          subscriptionStatus: 'CANCELED',
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.user.groupBy({
        by: ['currentPlan'],
        _count: { id: true },
      }),
      prisma.user.aggregate({
        _sum: {
          monthlyEmailsSent: true,
          monthlyVoiceCallsMade: true,
          monthlyLeadsGenerated: true,
        },
      }),
      prisma.billingHistory.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.billingHistory.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
      // last 6 months signups
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
          const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
          return prisma.user
            .count({ where: { createdAt: { gte: d, lte: end } } })
            .then((count) => ({
              month: d.toLocaleString('default', { month: 'short' }),
              count,
            }))
        })
      ),
    ])

    const mrr = (mrrThisMonth._sum.amount || 0) / 100
    const mrrPrev = (mrrLastMonth._sum.amount || 0) / 100
    const mrrGrowth = mrrPrev > 0 ? ((mrr - mrrPrev) / mrrPrev) * 100 : 0

    const planBreakdownFormatted = planBreakdown.map((p) => ({
      plan: p.currentPlan,
      count: p._count.id,
      revenue: 0, // billing data not linked to plan directly without joins
    }))

    const churnRate = totalUsers > 0 ? (churnedThisMonth / totalUsers) * 100 : 0
    const conversionRate =
      trialUsers + activeUsers > 0 ? (activeUsers / (trialUsers + activeUsers)) * 100 : 0

    return NextResponse.json({
      mrr,
      mrrGrowth,
      arr: mrr * 12,
      totalUsers,
      activeUsers,
      trialUsers,
      newUsersThisMonth,
      churnedThisMonth,
      churnRate,
      conversionRate,
      totalEmailsSent: usageSums._sum.monthlyEmailsSent || 0,
      totalCallsMade: usageSums._sum.monthlyVoiceCallsMade || 0,
      totalLeadsGenerated: usageSums._sum.monthlyLeadsGenerated || 0,
      planBreakdown: planBreakdownFormatted,
      monthlySignups,
      revenueByMonth: [],
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
