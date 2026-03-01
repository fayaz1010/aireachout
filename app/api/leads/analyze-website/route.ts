import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserApiKey } from '@/lib/api-keys'
import { analyzeWebsiteForCampaign } from '@/lib/gemini'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { websiteUrl, projectId } = await request.json()

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    let url: URL
    try {
      url = new URL(
        websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
      )
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const geminiApiKey = await getUserApiKey(session.user.id, 'GEMINI')
    const systemKey = process.env.GOOGLE_AI_API_KEY

    if (!geminiApiKey && !systemKey) {
      return NextResponse.json(
        {
          error:
            'Gemini API key required. Please add your Gemini API key in Settings.',
        },
        { status: 400 }
      )
    }

    let projectContext: { name?: string; industry?: string } | undefined
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
        select: { name: true, industry: true },
      })
      if (project) {
        projectContext = {
          name: project.name,
          industry: project.industry || undefined,
        }
      }
    }

    const analysis = await analyzeWebsiteForCampaign(
      url.toString(),
      projectContext,
      geminiApiKey || systemKey || undefined
    )

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Website analysis error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to analyze website'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
