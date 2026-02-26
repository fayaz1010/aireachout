// @ts-nocheck
import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireSuperAdmin()

    const tiers = await prisma.pricingTier.findMany({
      orderBy: { monthlyPrice: 'asc' },
    })

    // Get user counts per plan
    const userCounts = await prisma.user.groupBy({
      by: ['currentPlan'],
      _count: { id: true },
      where: { subscriptionStatus: 'ACTIVE' },
    })

    const countMap: Record<string, number> = {}
    userCounts.forEach((u) => {
      countMap[u.currentPlan] = u._count.id
    })

    const tiersWithCounts = tiers.map((t) => ({
      ...t,
      monthlyPrice: Number(t.monthlyPrice),
      yearlyPrice: t.yearlyPrice ? Number(t.yearlyPrice) : null,
      userCount: countMap[t.plan] || 0,
    }))

    return NextResponse.json({ tiers: tiersWithCounts })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
}
