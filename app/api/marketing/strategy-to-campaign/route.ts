// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const strategyToCampaignSchema = z.object({
  strategyId: z.string(),
  projectId: z.string(),
  campaignName: z.string().optional(),
  targetAudience: z.object({
    demographics: z.array(z.string()),
    interests: z.array(z.string()),
    companySize: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional()
  }).optional(),
  channels: z.array(z.enum(['EMAIL', 'SMS', 'VOICE_CALL', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE'])),
  leadGenerationConfig: z.object({
    searchQueries: z.array(z.string()),
    maxLeads: z.number().default(100),
    sources: z.array(z.string()).default(['GOOGLE_SEARCH', 'LINKEDIN', 'COMPANY_WEBSITES'])
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = strategyToCampaignSchema.parse(body)

    // Get the marketing strategy
    const strategy = await prisma.marketingStrategy.findFirst({
      where: {
        id: validatedData.strategyId,
        userId: session.user.id
      },
      include: {
        customerPersonas: true,
        competitorAnalysis: true
      }
    })

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 })
    }

    // Generate AI-powered campaign configuration based on strategy
    const campaignConfig = await generateCampaignFromStrategy(strategy, validatedData)

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.id,
        projectId: validatedData.projectId,
        name: validatedData.campaignName || `${strategy.name} Campaign`,
        campaignType: 'MULTI_CHANNEL',
        status: 'DRAFT',
        
        // Strategy-driven configuration
        subject: campaignConfig.emailSubject,
        emailTemplate: campaignConfig.emailTemplate,
        smsTemplate: campaignConfig.smsTemplate,
        voiceCallScript: campaignConfig.voiceScript,
        
        // Social media templates
        socialMediaTemplates: campaignConfig.socialTemplates,
        
        // Channel selection based on strategy
        communicationChannels: validatedData.channels,
        
        // AI personalization enabled
        useAiPersonalization: true,
        
        // Target configuration
        targetTags: campaignConfig.targetTags,
        targetLocation: validatedData.targetAudience?.location || '',
        
        // Strategy metadata
        marketingStrategyId: strategy.id,
        strategyObjective: strategy.objective,
        
        // Lead generation configuration
        leadGenerationConfig: validatedData.leadGenerationConfig ? {
          searchQueries: validatedData.leadGenerationConfig.searchQueries,
          maxLeads: validatedData.leadGenerationConfig.maxLeads,
          sources: validatedData.leadGenerationConfig.sources,
          targetAudience: validatedData.targetAudience
        } : null
      }
    })

    // If lead generation is configured, trigger lead generation
    if (validatedData.leadGenerationConfig) {
      await triggerLeadGeneration(campaign.id, validatedData.leadGenerationConfig, validatedData.targetAudience)
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        channels: campaign.communicationChannels,
        strategyBased: true
      },
      message: 'Campaign created successfully from marketing strategy'
    })

  } catch (error) {
    console.error('Strategy to campaign conversion error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign from strategy' },
      { status: 500 }
    )
  }
}

async function generateCampaignFromStrategy(strategy: any, config: any) {
  // AI-powered campaign generation based on strategy type
  const strategyTemplates = {
    FREEMIUM: {
      emailSubject: "Start Your Free Trial - No Credit Card Required",
      emailTemplate: `Hi {{firstName}},

I noticed {{companyName}} could benefit from our ${strategy.name} solution.

🎯 **Perfect for companies like yours:**
- ${strategy.targetAudience || 'Growing businesses'}
- Looking to ${strategy.primaryGoal || 'scale efficiently'}

**Start your free trial today:**
✅ Full access for 14 days
✅ No credit card required
✅ Setup in under 5 minutes

{{personalizedInsight}}

Ready to see the impact?

Best regards,
{{senderName}}`,
      
      smsTemplate: "Hi {{firstName}}! Start your free trial of our solution - no credit card needed. Perfect for {{companyName}}. Get started: {{link}}",
      
      voiceScript: `Hi {{firstName}}, this is {{senderName}}. I'm calling about a free trial opportunity for {{companyName}}. We help companies like yours ${strategy.primaryGoal || 'achieve their goals'}. Do you have 2 minutes to discuss how this could benefit your team?`,
      
      socialTemplates: {
        LINKEDIN: `Excited to help companies like {{companyName}} with our free trial! No commitment, just results. #FreeTrial #${strategy.industry || 'Business'}`,
        TWITTER: `🚀 Free trial available for ${strategy.targetAudience || 'growing businesses'}! No credit card required. Try it today!`,
        FACEBOOK: `Transform your business with our free trial. Join hundreds of companies already seeing results!`
      },
      
      targetTags: ['free-trial-interested', 'cost-conscious', 'risk-averse', strategy.industry || 'general'].filter(Boolean)
    },
    
    CONTENT_MARKETING: {
      emailSubject: "Exclusive Insights for {{companyName}} - Industry Report Inside",
      emailTemplate: `Hi {{firstName}},

I've been following {{companyName}}'s growth and thought you'd find our latest ${strategy.industry || 'industry'} report valuable.

📊 **Key insights include:**
- Market trends affecting companies like yours
- Strategies your competitors are using
- Actionable steps for ${strategy.primaryGoal || 'growth'}

{{personalizedInsight}}

Download your free copy: {{link}}

Best,
{{senderName}}`,
      
      smsTemplate: "Hi {{firstName}}! Exclusive ${strategy.industry || 'industry'} report for {{companyName}} - download here: {{link}}",
      
      voiceScript: `Hi {{firstName}}, I'm calling from {{companyName}}. We've published a comprehensive report on ${strategy.industry || 'your industry'} that I think would be valuable for {{companyName}}. Would you like me to send it over?`,
      
      socialTemplates: {
        LINKEDIN: `New industry report: Key insights for ${strategy.targetAudience || 'business leaders'}. Download free: {{link}} #IndustryInsights #${strategy.industry || 'Business'}`,
        TWITTER: `📊 Just released: ${strategy.industry || 'Industry'} trends report. Free download for business leaders!`,
        FACEBOOK: `Comprehensive industry analysis now available. Perfect for business leaders looking to stay ahead.`
      },
      
      targetTags: ['content-engaged', 'industry-focused', 'research-oriented', strategy.industry || 'general'].filter(Boolean)
    },
    
    REFERRAL_PROGRAM: {
      emailSubject: "Earn $500 for Each Referral - {{companyName}} Exclusive",
      emailTemplate: `Hi {{firstName}},

Since {{companyName}} has been such a great partner, I wanted to share an exclusive opportunity.

💰 **Our Referral Program:**
- Earn $500 for each qualified referral
- No limit on earnings
- Fast payouts within 30 days

{{personalizedInsight}}

Companies you refer typically see results within the first month.

Interested in learning more?

Best,
{{senderName}}`,
      
      smsTemplate: "Hi {{firstName}}! Exclusive referral program for {{companyName}} - earn $500 per referral. Details: {{link}}",
      
      voiceScript: `Hi {{firstName}}, I'm calling about an exclusive referral opportunity for {{companyName}}. You can earn $500 for each company you refer to us. Given your network, this could be quite lucrative. Do you have a moment to discuss?`,
      
      socialTemplates: {
        LINKEDIN: `Excited about our referral program! Earn $500 for each qualified referral. Perfect for business leaders with strong networks. #ReferralProgram #Partnership`,
        TWITTER: `💰 New referral program: Earn $500 per referral! Perfect for business leaders. Join today!`,
        FACEBOOK: `Introducing our referral program - earn money by helping other businesses succeed!`
      },
      
      targetTags: ['referral-ready', 'well-connected', 'partnership-oriented', strategy.industry || 'general'].filter(Boolean)
    },
    
    PARTNERSHIP: {
      emailSubject: "Strategic Partnership Opportunity - {{companyName}} + Us",
      emailTemplate: `Hi {{firstName}},

I've been impressed by {{companyName}}'s work in ${strategy.industry || 'your industry'} and see a strong partnership opportunity.

🤝 **Potential collaboration:**
- Mutual customer referrals
- Co-marketing opportunities
- Shared resources and expertise

{{personalizedInsight}}

Our partners typically see 30-40% increase in qualified leads.

Would you be open to a brief call to explore this?

Best,
{{senderName}}`,
      
      smsTemplate: "Hi {{firstName}}! Partnership opportunity for {{companyName}} - mutual growth potential. Let's discuss: {{link}}",
      
      voiceScript: `Hi {{firstName}}, I'm calling about a strategic partnership opportunity between {{companyName}} and us. I believe there's strong synergy between our companies that could benefit both our customer bases. Would you be interested in exploring this?`,
      
      socialTemplates: {
        LINKEDIN: `Exploring strategic partnerships with innovative companies in ${strategy.industry || 'various industries'}. Exciting opportunities ahead! #Partnership #Collaboration`,
        TWITTER: `🤝 Building strategic partnerships with industry leaders. Mutual growth opportunities available!`,
        FACEBOOK: `Announcing new partnership opportunities - let's grow together!`
      },
      
      targetTags: ['partnership-ready', 'strategic-minded', 'collaboration-focused', strategy.industry || 'general'].filter(Boolean)
    }
  }

  const template = strategyTemplates[strategy.objective as keyof typeof strategyTemplates] || strategyTemplates.FREEMIUM
  
  return {
    ...template,
    // Add strategy-specific customizations
    emailTemplate: template.emailTemplate.replace('${strategy.name}', strategy.name)
      .replace('${strategy.targetAudience}', strategy.targetAudience || 'businesses like yours')
      .replace('${strategy.primaryGoal}', strategy.primaryGoal || 'achieve growth')
      .replace('${strategy.industry}', strategy.industry || 'your industry')
  }
}

async function triggerLeadGeneration(campaignId: string, leadConfig: any, targetAudience: any) {
  // This would integrate with your Apify or lead generation system
  try {
    // Example: Call your lead generation API
    const response = await fetch('/api/leads/generate-for-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        searchQueries: leadConfig.searchQueries,
        maxLeads: leadConfig.maxLeads,
        sources: leadConfig.sources,
        targetAudience
      })
    })
    
    if (!response.ok) {
      console.error('Failed to trigger lead generation')
    }
  } catch (error) {
    console.error('Lead generation trigger error:', error)
  }
}
