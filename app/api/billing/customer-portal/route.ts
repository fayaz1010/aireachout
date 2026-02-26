
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/billing'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (!user.stripeCustomerId) {
      // For users without a Stripe customer ID, create one
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id
          }
        })
        
        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customer.id }
        })
        
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: `${process.env.NEXTAUTH_URL}/billing`
        })
        
        return NextResponse.json({ url: portalSession.url })
      } catch (stripeError) {
        console.error('Error creating Stripe customer:', stripeError)
        return NextResponse.json(
          { error: 'Unable to create billing account. Please contact support.' },
          { status: 400 }
        )
      }
    }
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/billing`
    })
    
    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
