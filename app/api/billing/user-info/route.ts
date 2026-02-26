
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        billingHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const billingInfo = {
      currentPlan: user.currentPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
      usage: {
        emails: {
          current: user.monthlyEmailsSent,
          limit: user.emailLimit
        },
        sms: {
          current: user.monthlySmsSent,
          limit: user.smsLimit
        },
        voiceCalls: {
          current: user.monthlyVoiceCallsMade,
          limit: user.voiceCallLimit
        },
        leads: {
          current: user.monthlyLeadsGenerated,
          limit: user.leadsLimit
        },
        apiCalls: {
          current: user.monthlyApiCalls,
          limit: user.apiCallLimit
        }
      },
      billingHistory: user.billingHistory.map((record: any) => ({
        id: record.id,
        type: record.type,
        description: record.description,
        amount: Number(record.amount),
        status: record.status,
        createdAt: record.createdAt
      })),
      invoices: user.invoices.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        total: Number(invoice.total),
        dueAt: invoice.dueAt,
        paidAt: invoice.paidAt
      }))
    }
    
    return NextResponse.json(billingInfo)
  } catch (error: any) {
    console.error('Error fetching user billing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}
