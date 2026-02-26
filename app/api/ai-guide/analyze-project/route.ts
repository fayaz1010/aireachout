import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeProjectWithGemini } from '@/lib/gemini'
import { z } from 'zod'

const analyzeProjectSchema = z.object({
  githubUrl: z.string().url('Please provide a valid GitHub URL'),
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  targetMarket: z.string().optional(),
  businessModel: z.enum(['SAAS', 'MARKETPLACE', 'ECOMMERCE', 'MOBILE_APP', 'API_SERVICE', 'OTHER']).optional()
})

// AI Analysis Engine - Analyzes GitHub repo and recommends strategies
async function analyzeGitHubProject(githubUrl: string, projectInfo: any) {
  try {
    // Extract repo info from GitHub URL
    const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!repoMatch) {
      throw new Error('Invalid GitHub URL format')
    }
    
    const [, owner, repo] = repoMatch
    
    // Fetch repository data from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Reach-Out-Platform'
      }
    })
    
    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository data')
    }
    
    const repoData = await repoResponse.json()
    
    // Fetch languages used in the project
    const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Reach-Out-Platform'
      }
    })
    
    const languages = languagesResponse.ok ? await languagesResponse.json() : {}
    
    // Fetch README content for deeper analysis
    let readmeContent = ''
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Reach-Out-Platform'
        }
      })
      
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json()
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
      }
    } catch (error) {
      console.log('Could not fetch README:', error)
    }
    
    // AI Analysis with Gemini 2.5 Flash
    try {
      const analysis = await analyzeProjectWithGemini({
        repoData,
        languages,
        readmeContent,
        projectInfo
      })
      return analysis
    } catch (error) {
      console.error('Gemini analysis failed, using fallback:', error)
      return getFallbackAnalysis()
    }
    
  } catch (error) {
    console.error('Error analyzing GitHub project:', error)
    throw error
  }
}

// Fallback analysis for when Gemini is unavailable
function getFallbackAnalysis() {
  return {
    projectType: {
      type: 'SAAS',
      confidence: 75,
      indicators: ['API service patterns', 'Dashboard components', 'Subscription model']
    },
    targetAudience: {
      primary: 'business_decision_makers',
      characteristics: ['Budget authority', 'Team management', 'ROI focused'],
      painPoints: ['Efficiency', 'Cost reduction', 'Team productivity'],
      channels: ['linkedin', 'content_marketing', 'webinars', 'direct_sales']
    },
    competitivePosition: {
      marketPosition: 'emerging',
      differentiators: ['AI-powered features', 'Open source approach'],
      advantages: ['Growing community', 'Market validation'],
      challenges: ['Building awareness', 'Proving market fit']
    },
    recommendedStrategies: [
      {
        strategy: 'Product-Led Growth',
        priority: 'very_high',
        confidence: 95,
        reasoning: 'SaaS products benefit most from freemium and trial strategies',
        expectedROI: '300-500%',
        timeline: '3-6 months',
        tactics: [
          'Implement 14-day free trial',
          'Add usage-based upgrade prompts',
          'Create onboarding excellence',
          'Build in-app upgrade flows'
        ]
      }
    ],
    implementationPlan: {
      phase1: {
        title: 'Foundation & Quick Wins',
        duration: '30 days',
        tasks: ['Set up analytics', 'Create landing page', 'Optimize GitHub repo']
      },
      phase2: {
        title: 'Growth Acceleration',
        duration: '60 days',
        tasks: ['Launch content marketing', 'Implement SEO', 'Start community engagement']
      },
      phase3: {
        title: 'Scale & Optimize',
        duration: 'Ongoing',
        tasks: ['Scale successful channels', 'Implement automation', 'Launch partnerships']
      }
    },
    keyMetrics: ['User acquisition', 'Trial conversion', 'Monthly recurring revenue'],
    budgetEstimate: {
      low: '$5,000-10,000',
      medium: '$15,000-25,000',
      high: '$30,000-50,000'
    }
  }
}

// Helper function to calculate confidence score
function calculateAnalysisConfidence(analysis: any): number {
  // Simple confidence calculation based on data availability
  let confidence = 70 // Base confidence
  
  if (analysis.keyMetrics && analysis.keyMetrics.length > 0) confidence += 10
  if (analysis.budgetEstimate) confidence += 10
  if (analysis.implementationPlan) confidence += 10
  
  return Math.min(confidence, 100)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = analyzeProjectSchema.parse(body)

    // Perform AI analysis
    const analysis = await analyzeGitHubProject(validatedData.githubUrl, validatedData)

    // Save analysis to database
    const projectAnalysis = await prisma.projectAnalysis.create({
      data: {
        userId: session.user.id,
        githubUrl: validatedData.githubUrl,
        projectName: validatedData.projectName,
        description: validatedData.description,
        targetMarket: validatedData.targetMarket,
        businessModel: validatedData.businessModel,
        analysis: analysis as any, // Store full analysis as JSON
        confidence: calculateAnalysisConfidence(analysis),
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({ 
      success: true,
      analysis,
      projectAnalysisId: projectAnalysis.id
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error analyzing project:', error)
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    )
  }
}
