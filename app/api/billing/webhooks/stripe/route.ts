
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/billing'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: subscription.customer as string }
  })
  
  if (!user) {
    console.error('User not found for subscription update')
    return
  }
  
  // Map subscription status
  const subscriptionStatus = mapStripeStatus(subscription.status)
  
  // Get the plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  const pricingTier = await prisma.pricingTier.findFirst({
    where: {
      OR: [
        { stripePriceId: priceId },
        { stripeYearlyPriceId: priceId }
      ]
    }
  })
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus,
      currentPlan: pricingTier?.plan || user.currentPlan,
      subscriptionEndsAt: (subscription as any).current_period_end 
        ? new Date((subscription as any).current_period_end * 1000) 
        : undefined,
      // Update usage limits based on plan
      emailLimit: pricingTier?.emailLimit,
      smsLimit: pricingTier?.smsLimit,
      voiceCallLimit: pricingTier?.voiceCallLimit,
      leadsLimit: pricingTier?.leadsLimit,
      apiCallLimit: pricingTier ? 10000 : null // Example API limit
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: subscription.customer as string }
  })
  
  if (!user) return
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'CANCELED',
      subscriptionEndsAt: new Date(),
      // Reset to trial limits
      emailLimit: 100,
      smsLimit: 10,
      voiceCallLimit: 5,
      leadsLimit: 100,
      apiCallLimit: 1000
    }
  })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: invoice.customer as string }
  })
  
  if (!user) return
  
  // Create billing history record
  await prisma.billingHistory.create({
    data: {
      userId: user.id,
      type: 'SUBSCRIPTION',
      description: `Payment for invoice ${invoice.number}`,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: 'SUCCEEDED',
      stripeEventId: invoice.id,
      processedAt: new Date()
    }
  })
  
  // Update or create invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      invoiceNumber: invoice.number || `INV-${Date.now()}`,
      userId: user.id,
      status: 'PAID',
      subtotal: invoice.subtotal || 0,
      total: invoice.total || 0,
      currency: invoice.currency.toUpperCase(),
      billingPeriodStart: new Date(invoice.period_start * 1000),
      billingPeriodEnd: new Date(invoice.period_end * 1000),
      stripeInvoiceId: invoice.id,
      paidAt: new Date(),
      dueAt: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now())
    },
    update: {
      status: 'PAID',
      paidAt: new Date()
    }
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: invoice.customer as string }
  })
  
  if (!user) return
  
  // Create billing history record for failed payment
  await prisma.billingHistory.create({
    data: {
      userId: user.id,
      type: 'SUBSCRIPTION',
      description: `Failed payment for invoice ${invoice.number}`,
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
      stripeEventId: invoice.id
    }
  })
  
  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'PAST_DUE' }
  })
}

function mapStripeStatus(stripeStatus: string) {
  switch (stripeStatus) {
    case 'active': return 'ACTIVE'
    case 'past_due': return 'PAST_DUE'
    case 'canceled': return 'CANCELED'
    case 'unpaid': return 'UNPAID'
    case 'incomplete': return 'INCOMPLETE'
    case 'incomplete_expired': return 'INCOMPLETE_EXPIRED'
    case 'trialing': return 'TRIAL'
    default: return 'TRIAL'
  }
}
