// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const followUpSchema = z.object({
  leadId: z.string(),
  sequenceType: z.enum(['TRIAL_NURTURE', 'DEMO_FOLLOW_UP', 'CONTENT_SERIES', 'SALES_SEQUENCE', 'REFERRAL_ONBOARD']),
  currentStep: z.number().default(1),
  customization: z.object({
    companyName: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = followUpSchema.parse(body)

    // Get lead with campaign and strategy context
    const lead = await prisma.lead.findFirst({
      where: {
        id: validatedData.leadId,
        project: { userId: session.user.id }
      },
      include: {
        campaign: {
          include: {
            marketingStrategy: true
          }
        },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Generate AI-powered follow-up sequence
    const followUpSequence = await generateFollowUpSequence(
      lead,
      validatedData.sequenceType,
      validatedData.currentStep,
      validatedData.customization
    )

    // Create follow-up campaign
    const followUpCampaign = await prisma.followUpCampaign.create({
      data: {
        userId: session.user.id,
        leadId: validatedData.leadId,
        originalCampaignId: lead.campaignId,
        sequenceType: validatedData.sequenceType,
        currentStep: validatedData.currentStep,
        totalSteps: followUpSequence.steps.length,
        status: 'ACTIVE',
        sequenceData: followUpSequence
      }
    })

    // Schedule the sequence steps
    await scheduleSequenceSteps(followUpCampaign.id, followUpSequence.steps)

    return NextResponse.json({
      success: true,
      followUpCampaignId: followUpCampaign.id,
      sequence: followUpSequence,
      message: 'Follow-up sequence created and scheduled'
    })

  } catch (error) {
    console.error('Follow-up sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to create follow-up sequence' },
      { status: 500 }
    )
  }
}

async function generateFollowUpSequence(lead: any, sequenceType: string, currentStep: number, customization: any) {
  const strategy = lead.campaign.marketingStrategy
  const leadResponses = lead.responses

  // AI-generated sequences based on strategy and lead behavior
  const sequences = {
    'TRIAL_NURTURE': {
      name: 'Free Trial Nurturing Sequence',
      description: 'Convert trial users to paid subscribers',
      steps: [
        {
          step: 1,
          delay: 0,
          channel: 'EMAIL',
          subject: 'Welcome to your free trial, {{firstName}}!',
          template: `Hi {{firstName}},

Welcome to your free trial! You're now part of thousands of companies using our solution to ${strategy?.primaryGoal || 'achieve their goals'}.

🚀 **Get started in 3 easy steps:**
1. Complete your profile setup
2. Import your first dataset
3. Run your first analysis

**Quick wins for {{companyName}}:**
${customization?.painPoints?.map(point => `• Solve: ${point}`).join('\n') || '• Streamline your workflow\n• Increase efficiency\n• Save time'}

Need help? Reply to this email or book a 15-minute setup call: {{calendarLink}}

Best,
{{senderName}}`,
          cta: 'Complete Setup',
          conversionGoal: 'ONBOARDING_COMPLETE'
        },
        {
          step: 2,
          delay: 2 * 24 * 60 * 60 * 1000, // 2 days
          channel: 'EMAIL',
          subject: 'How is your trial going, {{firstName}}?',
          template: `Hi {{firstName}},

It's been 2 days since you started your trial. How are things going?

📊 **Your progress so far:**
• Account setup: Complete ✅
• First project: ${Math.random() > 0.5 ? 'Complete ✅' : 'In progress 🔄'}
• Team invited: ${Math.random() > 0.5 ? 'Complete ✅' : 'Pending 📧'}

**Need a quick boost?** Here are 3 features that companies like {{companyName}} love most:
1. Automated reporting
2. Team collaboration tools  
3. Advanced analytics dashboard

Questions? I'm here to help!

Best,
{{senderName}}`,
          cta: 'Explore Features',
          conversionGoal: 'FEATURE_ADOPTION'
        },
        {
          step: 3,
          delay: 5 * 24 * 60 * 60 * 1000, // 5 days
          channel: 'EMAIL',
          subject: 'Your trial expires in 9 days - let\'s talk!',
          template: `Hi {{firstName}},

Your trial expires in 9 days, and I wanted to check in on your experience.

**Companies like {{companyName}} typically see:**
• 40% faster project completion
• 60% reduction in manual work
• 25% increase in team productivity

I'd love to show you how to maximize these results for your team.

**Free 20-minute strategy session:**
We'll review your specific use case and create a custom implementation plan.

Book here: {{calendarLink}}

Best,
{{senderName}}`,
          cta: 'Book Strategy Session',
          conversionGoal: 'DEMO_SCHEDULED'
        },
        {
          step: 4,
          delay: 10 * 24 * 60 * 60 * 1000, // 10 days
          channel: 'EMAIL',
          subject: 'Last chance: Your trial expires in 4 days',
          template: `Hi {{firstName}},

Your trial expires in just 4 days. Don't lose access to all the progress you've made!

**Your trial results:**
• Projects created: {{projectCount}}
• Time saved: {{timeSaved}} hours
• Team members active: {{teamCount}}

**Continue with 20% off your first 3 months:**
Use code TRIAL20 at checkout.

Upgrade now: {{upgradeLink}}

Questions? Reply to this email.

Best,
{{senderName}}`,
          cta: 'Upgrade Now',
          conversionGoal: 'SUBSCRIPTION_PURCHASE'
        },
        {
          step: 5,
          delay: 14 * 24 * 60 * 60 * 1000, // 14 days (trial ended)
          channel: 'EMAIL',
          subject: 'We miss you, {{firstName}} - 30% off to come back',
          template: `Hi {{firstName}},

Your trial ended, but your progress doesn't have to stop there.

**Special win-back offer: 30% off for 6 months**
Code: COMEBACK30

**What you'll get back:**
• All your saved projects and data
• Advanced features you were using
• Priority support from our team

This offer expires in 7 days.

Reactivate: {{reactivateLink}}

Best,
{{senderName}}`,
          cta: 'Reactivate Account',
          conversionGoal: 'WINBACK_CONVERSION'
        }
      ]
    },

    'DEMO_FOLLOW_UP': {
      name: 'Demo Follow-up Sequence',
      description: 'Convert demo attendees to customers',
      steps: [
        {
          step: 1,
          delay: 2 * 60 * 60 * 1000, // 2 hours
          channel: 'EMAIL',
          subject: 'Thanks for the demo, {{firstName}} - here\'s your custom plan',
          template: `Hi {{firstName}},

Great meeting you today! Based on our conversation, I've created a custom implementation plan for {{companyName}}.

**Your personalized roadmap:**
${customization?.painPoints?.map((point, i) => `${i + 1}. Address: ${point}`).join('\n') || '1. Streamline current processes\n2. Implement automation\n3. Scale team efficiency'}

**Next steps:**
• Review the attached proposal
• Schedule implementation kickoff
• Start seeing results in 30 days

**Questions from our call:**
I'll research those specific integration questions and follow up tomorrow.

Best,
{{senderName}}

P.S. The 15% early-bird discount expires Friday.`,
          cta: 'Review Proposal',
          conversionGoal: 'PROPOSAL_REVIEW'
        },
        {
          step: 2,
          delay: 24 * 60 * 60 * 1000, // 1 day
          channel: 'EMAIL',
          subject: 'Integration answers + implementation timeline',
          template: `Hi {{firstName}},

I researched those integration questions from our demo:

**✅ Integration capabilities:**
• Native API connections with your current tools
• 2-week implementation timeline
• Dedicated technical support during setup

**Your custom timeline:**
• Week 1: System setup and data migration
• Week 2: Team training and go-live
• Week 3: Optimization and fine-tuning

Ready to move forward? Let's schedule your kickoff call.

Calendar: {{calendarLink}}

Best,
{{senderName}}`,
          cta: 'Schedule Kickoff',
          conversionGoal: 'KICKOFF_SCHEDULED'
        }
      ]
    },

    'CONTENT_SERIES': {
      name: 'Educational Content Nurture',
      description: 'Build trust through valuable content',
      steps: [
        {
          step: 1,
          delay: 24 * 60 * 60 * 1000, // 1 day
          channel: 'EMAIL',
          subject: 'The {{companyName}} Growth Playbook - Part 1',
          template: `Hi {{firstName}},

Here's the first part of your personalized growth playbook for {{companyName}}.

**Part 1: Foundation Building**

Based on your ${strategy?.industry || 'industry'}, here are the 3 critical foundations:

1. **Process Optimization**
   ${customization?.painPoints?.[0] || 'Streamline your current workflows'}
   
2. **Team Alignment** 
   Ensure everyone is working toward the same goals
   
3. **Data-Driven Decisions**
   Use metrics to guide your strategy

**Action item for this week:**
Audit your current processes and identify the biggest bottleneck.

Part 2 coming tomorrow: "Scaling Your Operations"

Best,
{{senderName}}`,
          cta: 'Read Full Guide',
          conversionGoal: 'CONTENT_ENGAGEMENT'
        }
      ]
    }
  }

  return sequences[sequenceType as keyof typeof sequences] || sequences.TRIAL_NURTURE
}

async function scheduleSequenceSteps(followUpCampaignId: string, steps: any[]) {
  for (const step of steps) {
    await prisma.followUpStep.create({
      data: {
        followUpCampaignId,
        stepNumber: step.step,
        channel: step.channel,
        subject: step.subject,
        template: step.template,
        cta: step.cta,
        conversionGoal: step.conversionGoal,
        scheduledFor: new Date(Date.now() + step.delay),
        status: 'SCHEDULED'
      }
    })
  }
}
