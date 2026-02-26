// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/super-admin'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireSuperAdmin()

    const body = await req.json()
    const {
      name,
      monthlyPrice,
      yearlyPrice,
      emailLimit,
      smsLimit,
      voiceCallLimit,
      leadsLimit,
      projectLimit,
      campaignLimit,
      features,
      aiPersonalization,
      multiChannel,
      analytics,
      apiAccess,
      prioritySupport,
      description,
      isPopular,
      isActive,
    } = body

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (monthlyPrice !== undefined) updateData.monthlyPrice = monthlyPrice
    if (yearlyPrice !== undefined) updateData.yearlyPrice = yearlyPrice
    if (emailLimit !== undefined) updateData.emailLimit = emailLimit
    if (smsLimit !== undefined) updateData.smsLimit = smsLimit
    if (voiceCallLimit !== undefined) updateData.voiceCallLimit = voiceCallLimit
    if (leadsLimit !== undefined) updateData.leadsLimit = leadsLimit
    if (projectLimit !== undefined) updateData.projectLimit = projectLimit
    if (campaignLimit !== undefined) updateData.campaignLimit = campaignLimit
    if (features !== undefined) updateData.features = features
    if (aiPersonalization !== undefined) updateData.aiPersonalization = aiPersonalization
    if (multiChannel !== undefined) updateData.multiChannel = multiChannel
    if (analytics !== undefined) updateData.analytics = analytics
    if (apiAccess !== undefined) updateData.apiAccess = apiAccess
    if (prioritySupport !== undefined) updateData.prioritySupport = prioritySupport
    if (description !== undefined) updateData.description = description
    if (isPopular !== undefined) updateData.isPopular = isPopular
    if (isActive !== undefined) updateData.isActive = isActive

    const tier = await prisma.pricingTier.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ tier })
  } catch (error) {
    console.error('Plan update error:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
