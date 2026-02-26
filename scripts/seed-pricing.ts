
import { PrismaClient, PricingPlan } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPricingTiers() {
  console.log('Seeding pricing tiers...')
  
  // Create pricing tiers
  const pricingTiers = [
    {
      name: 'Trial',
      plan: PricingPlan.TRIAL,
      monthlyPrice: 0,
      yearlyPrice: 0,
      emailLimit: 100,
      smsLimit: 10,
      voiceCallLimit: 5,
      leadsLimit: 100,
      projectLimit: 1,
      campaignLimit: 3,
      features: [
        '100 emails per month',
        '10 SMS per month',
        '5 voice calls per month',
        '100 leads per month',
        'Basic analytics',
        'Email support'
      ],
      aiPersonalization: true,
      multiChannel: false,
      analytics: true,
      apiAccess: false,
      prioritySupport: false,
      description: 'Perfect for trying out our platform',
      isPopular: false,
      isActive: true
    },
    {
      name: 'Starter',
      plan: PricingPlan.STARTER,
      monthlyPrice: 29.00,
      yearlyPrice: 290.00, // 2 months free
      emailLimit: 5000,
      smsLimit: 500,
      voiceCallLimit: 100,
      leadsLimit: 5000,
      projectLimit: 5,
      campaignLimit: 20,
      features: [
        '5,000 emails per month',
        '500 SMS per month',
        '100 voice calls per month',
        '5,000 leads per month',
        'Multi-channel campaigns',
        'Advanced analytics',
        'Email support'
      ],
      aiPersonalization: true,
      multiChannel: true,
      analytics: true,
      apiAccess: false,
      prioritySupport: false,
      description: 'Great for small businesses getting started',
      isPopular: false,
      isActive: true
    },
    {
      name: 'Professional',
      plan: PricingPlan.PROFESSIONAL,
      monthlyPrice: 99.00,
      yearlyPrice: 990.00, // 2 months free
      emailLimit: 25000,
      smsLimit: 2500,
      voiceCallLimit: 500,
      leadsLimit: 25000,
      projectLimit: 20,
      campaignLimit: 100,
      features: [
        '25,000 emails per month',
        '2,500 SMS per month',
        '500 voice calls per month',
        '25,000 leads per month',
        'Unlimited projects',
        'Advanced AI personalization',
        'Priority email support',
        'Custom integrations'
      ],
      aiPersonalization: true,
      multiChannel: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      description: 'Perfect for growing businesses',
      isPopular: true,
      isActive: true
    },
    {
      name: 'Enterprise',
      plan: PricingPlan.ENTERPRISE,
      monthlyPrice: 299.00,
      yearlyPrice: 2990.00, // 2 months free
      emailLimit: 100000,
      smsLimit: 10000,
      voiceCallLimit: 2000,
      leadsLimit: 100000,
      projectLimit: 100,
      campaignLimit: 1000,
      features: [
        '100,000 emails per month',
        '10,000 SMS per month',
        '2,000 voice calls per month',
        '100,000 leads per month',
        'Unlimited projects & campaigns',
        'Custom AI models',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'White-label options'
      ],
      aiPersonalization: true,
      multiChannel: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      description: 'For large organizations with high volume needs',
      isPopular: false,
      isActive: true
    }
  ]
  
  // Upsert pricing tiers
  for (const tier of pricingTiers) {
    await prisma.pricingTier.upsert({
      where: { plan: tier.plan },
      update: tier,
      create: tier
    })
  }
  
  console.log('✅ Pricing tiers seeded successfully')
}

async function createSuperAdmin() {
  console.log('Creating super admin user...')
  
  const bcrypt = require('bcryptjs')
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@yourplatform.com'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123'
  
  const hashedPassword = await bcrypt.hash(superAdminPassword, 12)
  
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: 'SUPER_ADMIN',
      currentPlan: PricingPlan.ENTERPRISE,
      subscriptionStatus: 'ACTIVE',
      // Unlimited usage for super admin
      emailLimit: null,
      smsLimit: null,
      voiceCallLimit: null,
      leadsLimit: null,
      apiCallLimit: null
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      currentPlan: PricingPlan.ENTERPRISE,
      subscriptionStatus: 'ACTIVE',
      // Unlimited usage for super admin
      emailLimit: null,
      smsLimit: null,
      voiceCallLimit: null,
      leadsLimit: null,
      apiCallLimit: null
    }
  })
  
  console.log(`✅ Super admin created: ${superAdminEmail}`)
  console.log(`Password: ${superAdminPassword}`)
}

async function seedSuperAdminApiKeys() {
  console.log('Seeding super admin API keys...')
  
  const { encrypt } = require('../lib/crypto')
  
  // Example API keys (replace with real ones)
  const apiKeys = [
    {
      service: 'STRIPE',
      keyName: 'Production Stripe Key',
      apiKey: process.env.STRIPE_SECRET_KEY || 'sk_test_example',
      costPerUse: 0,
      markup: 0.30 // 30% markup
    },
    {
      service: 'GEMINI',
      keyName: 'Google Gemini API',
      apiKey: process.env.GEMINI_API_KEY || 'fake_gemini_key',
      costPerUse: 0.01, // 1 cent per request
      markup: 0.50 // 50% markup
    },
    {
      service: 'SENDGRID',
      keyName: 'SendGrid API Key',
      apiKey: process.env.SENDGRID_API_KEY || 'SG.fake_sendgrid_key',
      costPerUse: 0.001, // 0.1 cent per email
      markup: 2.00 // 200% markup (very profitable)
    },
    {
      service: 'TWILIO',
      keyName: 'Twilio API Key',
      apiKey: process.env.TWILIO_AUTH_TOKEN || 'fake_twilio_token',
      costPerUse: 0.0075, // 0.75 cents per SMS
      markup: 1.00 // 100% markup
    }
  ]
  
  for (const key of apiKeys) {
    if (key.apiKey === 'fake_gemini_key' || key.apiKey.startsWith('fake_') || key.apiKey.startsWith('SG.fake_')) {
      console.log(`⚠️  Skipping ${key.service} - no real API key provided`)
      continue
    }
    
    await prisma.superAdminApiKey.upsert({
      where: { service: key.service as any },
      update: {
        keyName: key.keyName,
        encryptedKey: encrypt(key.apiKey),
        costPerUse: key.costPerUse,
        markup: key.markup
      },
      create: {
        service: key.service as any,
        keyName: key.keyName,
        encryptedKey: encrypt(key.apiKey),
        costPerUse: key.costPerUse,
        markup: key.markup
      }
    })
    
    console.log(`✅ API key configured: ${key.service}`)
  }
}

async function main() {
  try {
    await seedPricingTiers()
    await createSuperAdmin()
    await seedSuperAdminApiKeys()
    
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Update your real API keys in the super admin dashboard')
    console.log('2. Configure Stripe webhook endpoints')
    console.log('3. Test the billing flow')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export default main
