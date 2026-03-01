
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserApiKey } from '@/lib/api-keys'
import { generateLeadsWithGroundedSearch } from '@/lib/gemini'

export const dynamic = "force-dynamic"

function sendSSE(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: any) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, searchQuery, targetLocation, industry, leadSource, maxResults, websiteContext } = body

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const geminiApiKey = await getUserApiKey(session.user.id, 'GEMINI')
    const systemKey = process.env.GOOGLE_AI_API_KEY

    if (!geminiApiKey && !systemKey) {
      return NextResponse.json(
        { error: 'Gemini API key required. Add your Gemini API key in Settings to generate leads.' },
        { status: 400 }
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          sendSSE(controller, encoder, {
            status: 'processing',
            message: 'Searching the web for matching prospects...'
          })

          const apiKey = geminiApiKey || systemKey || undefined

          sendSSE(controller, encoder, {
            status: 'processing',
            message: 'AI is analyzing search results and building lead profiles...'
          })

          const generatedLeads = await generateLeadsWithGroundedSearch(
            searchQuery,
            {
              location: targetLocation,
              industry: industry || project.industry || undefined,
              maxResults: parseInt(maxResults) || 25,
              projectName: project.name,
              websiteContext,
            },
            apiKey
          )

          sendSSE(controller, encoder, {
            status: 'processing',
            message: `Found ${generatedLeads.length} prospects. Validating data...`
          })

          const validatedLeads = generatedLeads.map((lead: any) => ({
            name: lead.name || 'Unknown',
            email: lead.email || '',
            company: lead.company || '',
            title: lead.title || '',
            location: lead.location || '',
            industry: lead.industry || industry || '',
            score: Math.min(Math.max(lead.score || 50, 1), 100),
            source: 'GOOGLE_SEARCH',
            sourceType: lead.sourceType || 'web',
            phone: lead.phone || '',
            website: lead.website || '',
            linkedinUrl: lead.linkedinUrl || '',
            twitterUrl: lead.twitterUrl || '',
            facebookUrl: lead.facebookUrl || '',
            sourceUrl: lead.sourceUrl || '',
            notes: lead.notes || '',
          }))

          sendSSE(controller, encoder, {
            status: 'completed',
            leads: validatedLeads,
            totalCount: validatedLeads.length,
          })
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          
        } catch (error) {
          console.error('Lead generation error:', error)
          
          sendSSE(controller, encoder, {
            status: 'error',
            message: error instanceof Error ? error.message : 'Lead generation failed. Please check your API keys in Settings.',
          })

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Lead generation route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
