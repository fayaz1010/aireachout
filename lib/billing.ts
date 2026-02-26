
import Stripe from 'stripe'
import { prisma } from './prisma'
import { PricingPlan, SubscriptionStatus, UserRole } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export interface UsageRecord {
  service: string
  operation: string
  quantity: number
  userId?: string
  cost?: number
  metadata?: any
}

export class BillingService {
  static async createCustomer(userId: string, email: string, name?: string) {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: { userId }
    })
    
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    })
    
    return customer
  }
  
  static async createSubscription(userId: string, priceId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user?.stripeCustomerId) {
      throw new Error('Customer not found')
    }
    
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: this.mapStripeStatus(subscription.status)
      }
    })
    
    return subscription
  }
  
  static async recordUsage(record: UsageRecord) {
    const { service, operation, quantity, userId, cost, metadata } = record
    
    // Get user to check if they have their own API keys
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      include: { apiKeys: true }
    }) : null
    
    // Check if user has their own API key for this service
    const userHasOwnKey = user?.apiKeys.some(
      (key: any) => key.service === service && key.isActive
    )
    
    // If user doesn't have their own key, use super admin key and charge
    let finalCost = 0
    let superAdminApiKeyId = null
    
    if (!userHasOwnKey && userId) {
      // Get super admin API key for this service
      const superAdminKey = await prisma.superAdminApiKey.findUnique({
        where: { service: service as any }
      })
      
      if (superAdminKey) {
        superAdminApiKeyId = superAdminKey.id
        const baseCost = superAdminKey.costPerUse?.toNumber() || 0
        const markup = superAdminKey.markup.toNumber()
        finalCost = baseCost * quantity * (1 + markup)
        
        // Update super admin key usage
        await prisma.superAdminApiKey.update({
          where: { id: superAdminKey.id },
          data: {
            totalUsage: { increment: quantity },
            monthlyUsage: { increment: quantity },
            dailyUsage: { increment: quantity },
            lastUsed: new Date()
          }
        })
      }
    }
    
    // Create usage log
    await prisma.usageLog.create({
      data: {
        service: service as any,
        operation,
        quantity,
        cost: finalCost,
        userId,
        superAdminApiKeyId,
        requestData: metadata,
        billable: !userHasOwnKey && userId !== null
      }
    })
    
    // Update user usage counters
    if (userId) {
      const updateData: any = {}
      
      switch (operation) {
        case 'email_sent':
          updateData.monthlyEmailsSent = { increment: quantity }
          break
        case 'sms_sent':
          updateData.monthlySmsSent = { increment: quantity }
          break
        case 'voice_call':
          updateData.monthlyVoiceCallsMade = { increment: quantity }
          break
        case 'api_call':
          updateData.monthlyApiCalls = { increment: quantity }
          break
        case 'lead_generated':
          updateData.monthlyLeadsGenerated = { increment: quantity }
          break
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData
        })
      }
    }
    
    return finalCost
  }
  
  static async checkUsageLimits(userId: string, operation: string, quantity: number = 1): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return false
    
    // Super admin has unlimited usage
    if (user.role === UserRole.SUPER_ADMIN) return true
    
    switch (operation) {
      case 'email_sent':
        return !user.emailLimit || (user.monthlyEmailsSent + quantity) <= user.emailLimit
      case 'sms_sent':
        return !user.smsLimit || (user.monthlySmsSent + quantity) <= user.smsLimit
      case 'voice_call':
        return !user.voiceCallLimit || (user.monthlyVoiceCallsMade + quantity) <= user.voiceCallLimit
      case 'api_call':
        return !user.apiCallLimit || (user.monthlyApiCalls + quantity) <= user.apiCallLimit
      case 'lead_generated':
        return !user.leadsLimit || (user.monthlyLeadsGenerated + quantity) <= user.leadsLimit
      default:
        return true
    }
  }
  
  static async resetMonthlyUsage() {
    await prisma.user.updateMany({
      data: {
        monthlyEmailsSent: 0,
        monthlySmsSent: 0,
        monthlyVoiceCallsMade: 0,
        monthlyApiCalls: 0,
        monthlyLeadsGenerated: 0,
        usageResetAt: new Date()
      }
    })
    
    await prisma.superAdminApiKey.updateMany({
      data: {
        monthlyUsage: 0,
        dailyUsage: 0,
        usageResetAt: new Date()
      }
    })
  }
  
  private static mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active': return SubscriptionStatus.ACTIVE
      case 'past_due': return SubscriptionStatus.PAST_DUE
      case 'canceled': return SubscriptionStatus.CANCELED
      case 'unpaid': return SubscriptionStatus.UNPAID
      case 'incomplete': return SubscriptionStatus.INCOMPLETE
      case 'incomplete_expired': return SubscriptionStatus.INCOMPLETE_EXPIRED
      case 'trialing': return SubscriptionStatus.TRIAL
      default: return SubscriptionStatus.TRIAL
    }
  }
}

export { stripe }
