
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data (in development only)
  await prisma.emailHistory.deleteMany({})
  await prisma.unsubscribe.deleteMany({})
  await prisma.campaign.deleteMany({})
  await prisma.lead.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Create test users
  const hashedPassword = await bcrypt.hash('johndoe123', 10)
  const adminHashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'AI Solutions Inc.',
    },
  })

  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: adminHashedPassword,
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Demo Company',
    },
  })

  console.log('✅ Created test users')

  // Create sample projects for the admin user
  const saasProject = await prisma.project.create({
    data: {
      name: 'SaaS Analytics Tool',
      description: 'Advanced analytics dashboard for SaaS companies',
      website: 'https://saasanalytics.com',
      industry: 'Software',
      targetAudience: 'SaaS founders, product managers, growth teams',
      keywords: ['saas analytics', 'dashboard', 'metrics', 'kpi tracking'],
      status: 'ACTIVE',
      userId: adminUser.id,
    },
  })

  const ecommerceProject = await prisma.project.create({
    data: {
      name: 'E-commerce Optimizer',
      description: 'AI-powered e-commerce conversion optimization platform',
      website: 'https://ecomoptimizer.com',
      industry: 'E-commerce',
      targetAudience: 'E-commerce store owners, marketing managers',
      keywords: ['ecommerce optimization', 'conversion rate', 'ai marketing', 'online store'],
      status: 'ACTIVE',
      userId: adminUser.id,
    },
  })

  const mobileAppProject = await prisma.project.create({
    data: {
      name: 'Mobile Fitness App',
      description: 'Personal trainer app with AI-powered workout recommendations',
      website: 'https://fitnessmobile.com',
      industry: 'Health & Fitness',
      targetAudience: 'Fitness enthusiasts, personal trainers, gym owners',
      keywords: ['fitness app', 'workout tracker', 'personal training', 'health'],
      status: 'ACTIVE',
      userId: testUser.id,
    },
  })

  console.log('✅ Created sample projects')

  // Create sample leads for SaaS Analytics project
  const saasLeads = [
    {
      email: 'sarah.johnson@techstartup.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      fullName: 'Sarah Johnson',
      companyName: 'TechStartup Inc.',
      jobTitle: 'VP of Product',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      website: 'https://techstartup.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      industry: 'Software',
      companySize: '50-200',
      source: 'LINKEDIN_SCRAPER' as const,
      status: 'NEW' as const,
      tags: ['saas', 'product-manager', 'bay-area'],
      leadScore: 85,
      aiInsights: {
        summary: 'High-potential lead from growing SaaS company. Company recently raised Series A funding.',
        painPoints: ['Need better product analytics', 'Struggling with user retention metrics'],
        interests: ['Product-led growth', 'Data-driven decisions'],
        bestContactTime: 'Tuesday-Thursday, 10AM-2PM PST'
      },
      personalizationData: {
        recentCompanyNews: 'Recently raised $5M Series A',
        companyGrowthStage: 'Scale-up phase',
        personalInterests: ['Product management', 'Analytics'],
        preferredCommunicationStyle: 'Data-driven, professional'
      }
    },
    {
      email: 'mike.chen@growthco.io',
      firstName: 'Mike',
      lastName: 'Chen',
      fullName: 'Mike Chen',
      companyName: 'GrowthCo',
      jobTitle: 'Head of Growth',
      linkedinUrl: 'https://linkedin.com/in/mikechen',
      website: 'https://growthco.io',
      phone: '+1-555-0456',
      location: 'Austin, TX',
      industry: 'MarTech',
      companySize: '20-50',
      source: 'GOOGLE_SEARCH' as const,
      status: 'NEW' as const,
      tags: ['martech', 'growth-hacker', 'austin'],
      leadScore: 92,
      aiInsights: {
        summary: 'Excellent lead - growth expert at fast-growing MarTech company.',
        painPoints: ['Need comprehensive analytics solution', 'Multiple tool integration challenges'],
        interests: ['Growth hacking', 'Marketing automation', 'Data visualization'],
        bestContactTime: 'Monday, Wednesday, Friday 9AM-11AM CST'
      },
      personalizationData: {
        recentCompanyNews: 'Launched new marketing automation feature',
        companyGrowthStage: 'Early growth stage',
        personalInterests: ['Growth strategies', 'Marketing tech'],
        preferredCommunicationStyle: 'Results-focused, innovative'
      }
    },
    {
      email: 'alex.rodriguez@datainsights.net',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      fullName: 'Alex Rodriguez',
      companyName: 'DataInsights',
      jobTitle: 'Analytics Director',
      linkedinUrl: 'https://linkedin.com/in/alexrodriguez',
      website: 'https://datainsights.net',
      location: 'New York, NY',
      industry: 'Analytics',
      companySize: '100-500',
      source: 'CSV_IMPORT' as const,
      status: 'CONTACTED' as const,
      tags: ['analytics', 'director-level', 'nyc'],
      leadScore: 78,
      emailsSent: 1,
      lastContacted: new Date('2024-01-15'),
      aiInsights: {
        summary: 'Mid-level opportunity. Company already has analytics infrastructure but may need advanced features.',
        painPoints: ['Complex data visualization needs', 'Cross-platform analytics integration'],
        interests: ['Business intelligence', 'Advanced analytics', 'Data science'],
        bestContactTime: 'Tuesday-Thursday, 2PM-5PM EST'
      }
    }
  ]

  // Create leads for SaaS project
  for (const leadData of saasLeads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        projectId: saasProject.id,
      },
    })
  }

  // Create sample leads for E-commerce project
  const ecommerceLeads = [
    {
      email: 'jennifer.kim@onlinestore.com',
      firstName: 'Jennifer',
      lastName: 'Kim',
      fullName: 'Jennifer Kim',
      companyName: 'Premium Online Store',
      jobTitle: 'E-commerce Manager',
      website: 'https://onlinestore.com',
      location: 'Los Angeles, CA',
      industry: 'E-commerce',
      companySize: '10-50',
      source: 'APIFY_SCRAPER' as const,
      status: 'NEW' as const,
      tags: ['ecommerce', 'manager', 'west-coast'],
      leadScore: 88,
      aiInsights: {
        summary: 'Strong lead from successful e-commerce business looking to optimize conversion rates.',
        painPoints: ['Low conversion rate', 'Cart abandonment issues', 'Need better product recommendations'],
        interests: ['Conversion optimization', 'Customer experience', 'AI recommendations'],
        bestContactTime: 'Monday-Friday, 11AM-3PM PST'
      }
    },
    {
      email: 'david.thompson@retailtech.biz',
      firstName: 'David',
      lastName: 'Thompson',
      fullName: 'David Thompson',
      companyName: 'RetailTech Solutions',
      jobTitle: 'CEO',
      website: 'https://retailtech.biz',
      location: 'Chicago, IL',
      industry: 'Retail Technology',
      companySize: '50-100',
      source: 'LINKEDIN_SCRAPER' as const,
      status: 'QUALIFIED' as const,
      tags: ['retail-tech', 'ceo', 'chicago'],
      leadScore: 95,
      emailsSent: 2,
      emailsOpened: 1,
      lastContacted: new Date('2024-01-20'),
      aiInsights: {
        summary: 'High-value lead. CEO of retail tech company actively seeking optimization solutions.',
        painPoints: ['Scaling challenges', 'Need AI-powered solutions', 'Integration with existing systems'],
        interests: ['AI technology', 'Business scaling', 'Retail innovation']
      }
    }
  ]

  // Create leads for E-commerce project
  for (const leadData of ecommerceLeads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        projectId: ecommerceProject.id,
      },
    })
  }

  console.log('✅ Created sample leads')

  // Create sample campaigns
  const saasEmailCampaign = await prisma.campaign.create({
    data: {
      name: 'SaaS Analytics Introduction Campaign',
      subject: 'Boost Your SaaS Metrics with AI-Powered Analytics',
      emailTemplate: `Hi {{firstName}},

I noticed {{companyName}} is in the {{industry}} space, and I thought you might be interested in how other {{industry}} companies are using AI-powered analytics to improve their key metrics.

{{personalizedInsight}}

Our SaaS Analytics Tool has helped similar companies:
• Increase user retention by 35% on average
• Reduce churn rate by 20%
• Improve product-market fit through data-driven insights

Given your role as {{jobTitle}}, I'd love to show you how {{companyName}} could benefit from our advanced analytics dashboard.

Would you be interested in a quick 15-minute demo this week?

Best regards,
John Doe
AI Solutions Inc.

P.S. {{companySpecificNote}}

---
Unsubscribe: {{unsubscribeLink}}`,
      status: 'SENT',
      sentAt: new Date('2024-01-10'),
      useAiPersonalization: true,
      personalizationPrompt: 'Create personalized insights based on the lead\'s company stage, industry, and pain points. Include relevant statistics and case studies.',
      targetTags: ['saas', 'product-manager'],
      totalRecipients: 2,
      emailsSent: 2,
      emailsDelivered: 2,
      emailsOpened: 1,
      userId: adminUser.id,
      projectId: saasProject.id,
    },
  })

  const ecommerceCampaign = await prisma.campaign.create({
    data: {
      name: 'E-commerce Optimization Outreach',
      subject: 'Increase Your Conversion Rate by 40% with AI',
      emailTemplate: `Hello {{firstName}},

I've been researching e-commerce businesses in {{location}} and came across {{companyName}}. 

{{personalizedInsight}}

Our E-commerce Optimizer uses AI to:
• Personalize product recommendations for each visitor
• Optimize checkout flow to reduce cart abandonment
• A/B test everything automatically

Companies similar to yours have seen:
• 40% increase in conversion rates
• 25% reduction in cart abandonment
• 30% boost in average order value

As {{jobTitle}} at {{companyName}}, I believe you'd appreciate seeing how AI can transform your online store performance.

Interested in a brief demo?

Best,
John Doe

---
Unsubscribe: {{unsubscribeLink}}`,
      status: 'SCHEDULED',
      scheduledAt: new Date('2024-02-01'),
      useAiPersonalization: true,
      personalizationPrompt: 'Focus on e-commerce specific pain points like conversion rates, cart abandonment, and personalization. Use industry-specific metrics and case studies.',
      targetTags: ['ecommerce'],
      totalRecipients: 2,
      userId: adminUser.id,
      projectId: ecommerceProject.id,
    },
  })

  console.log('✅ Created sample campaigns')

  // Create sample email history
  const leadSarah = await prisma.lead.findFirst({
    where: { email: 'sarah.johnson@techstartup.com' }
  })

  const leadMike = await prisma.lead.findFirst({
    where: { email: 'mike.chen@growthco.io' }
  })

  if (leadSarah) {
    await prisma.emailHistory.create({
      data: {
        subject: 'Boost Your SaaS Metrics with AI-Powered Analytics',
        content: `Hi Sarah,

I noticed TechStartup Inc. is in the Software space, and I thought you might be interested in how other Software companies are using AI-powered analytics to improve their key metrics.

Given that you recently raised $5M Series A, having comprehensive product analytics will be crucial for your next growth phase.

Our SaaS Analytics Tool has helped similar companies:
• Increase user retention by 35% on average
• Reduce churn rate by 20%
• Improve product-market fit through data-driven insights

Given your role as VP of Product, I'd love to show you how TechStartup Inc. could benefit from our advanced analytics dashboard.

Would you be interested in a quick 15-minute demo this week?

Best regards,
John Doe
AI Solutions Inc.

P.S. I saw your recent blog post about product-led growth - our analytics would perfectly support your data-driven approach.

---
Unsubscribe: https://app.example.com/unsubscribe/token123`,
        recipientEmail: 'sarah.johnson@techstartup.com',
        recipientName: 'Sarah Johnson',
        status: 'DELIVERED',
        deliveredAt: new Date('2024-01-10T10:30:00Z'),
        openedAt: new Date('2024-01-10T14:20:00Z'),
        openCount: 2,
        unsubscribeToken: 'token123',
        userId: adminUser.id,
        leadId: leadSarah.id,
        campaignId: saasEmailCampaign.id,
      },
    })
  }

  if (leadMike) {
    await prisma.emailHistory.create({
      data: {
        subject: 'Boost Your SaaS Metrics with AI-Powered Analytics',
        content: `Hi Mike,

I noticed GrowthCo is in the MarTech space, and I thought you might be interested in how other MarTech companies are using AI-powered analytics to improve their key metrics.

As a growth expert, you know the importance of having all your metrics in one place for quick decision-making.

Our SaaS Analytics Tool has helped similar companies:
• Increase user retention by 35% on average
• Reduce churn rate by 20%
• Improve product-market fit through data-driven insights

Given your role as Head of Growth, I'd love to show you how GrowthCo could benefit from our advanced analytics dashboard.

Would you be interested in a quick 15-minute demo this week?

Best regards,
John Doe
AI Solutions Inc.

P.S. Congratulations on launching your new marketing automation feature - our analytics would integrate perfectly with your existing stack.

---
Unsubscribe: https://app.example.com/unsubscribe/token124`,
        recipientEmail: 'mike.chen@growthco.io',
        recipientName: 'Mike Chen',
        status: 'SENT',
        unsubscribeToken: 'token124',
        userId: adminUser.id,
        leadId: leadMike.id,
        campaignId: saasEmailCampaign.id,
      },
    })
  }

  console.log('✅ Created sample email history')

  // Create sample unsubscribe record
  await prisma.unsubscribe.create({
    data: {
      email: 'former.lead@company.com',
      reason: 'No longer interested in SaaS tools',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      userId: adminUser.id,
    },
  })

  console.log('✅ Created sample unsubscribe record')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log('• Users: 2 (including test admin: john@doe.com / johndoe123)')
  console.log('• Projects: 3')
  console.log('• Leads: 5')
  console.log('• Campaigns: 2')
  console.log('• Email History: 2')
  console.log('• Unsubscribes: 1')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
