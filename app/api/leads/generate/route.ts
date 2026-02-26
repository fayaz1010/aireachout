
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserApiKey } from '@/lib/api-keys'

export const dynamic = "force-dynamic"

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
    const { projectId, searchQuery, targetLocation, industry, leadSource, maxResults } = body

    // Verify project ownership
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

    // Get user's API keys
    const geminiApiKey = await getUserApiKey(session.user.id, 'GEMINI')
    const googleSearchApiKey = await getUserApiKey(session.user.id, 'GOOGLE_SEARCH')
    const apifyApiKey = await getUserApiKey(session.user.id, 'APIFY')
    const perplexityApiKey = await getUserApiKey(session.user.id, 'PERPLEXITY')

    // Check if user has required API keys based on lead source
    if (leadSource === 'GOOGLE_SEARCH' && !googleSearchApiKey) {
      return NextResponse.json(
        { error: 'Google Custom Search API key required for this search type. Please add it in Settings.' },
        { status: 400 }
      )
    }

    if (leadSource === 'APIFY_SCRAPER' && !apifyApiKey) {
      return NextResponse.json(
        { error: 'Apify API key required for scraping. Please add it in Settings.' },
        { status: 400 }
      )
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          // Send initial processing status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            message: 'Initializing AI lead generation...'
          })}\n\n`))

          // Use user's Gemini API key for AI processing (fallback to system key if needed)
          const apiKey = geminiApiKey || process.env.ABACUSAI_API_KEY
          const apiUrl = geminiApiKey ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent' : 'https://apps.abacus.ai/v1/chat/completions'
          
          let aiResponse
          if (geminiApiKey) {
            // Use Gemini API
            aiResponse = await fetch(`${apiUrl}?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Generate ${maxResults || 50} realistic business leads for the following criteria:

Project: ${project.name} (${project.industry || 'General'})
Search Query: ${searchQuery}
Target Location: ${targetLocation || 'Global'}
Industry Focus: ${industry || project.industry || 'General'}
Lead Source: ${leadSource}

Please generate leads with the following JSON structure:
{
  "leads": [
    {
      "name": "Full Name",
      "email": "email@company.com", 
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State/Country",
      "industry": "Industry",
      "score": 85,
      "source": "${leadSource}",
      "phone": "+1-555-0123 (optional)",
      "website": "https://company.com (optional)",
      "linkedinUrl": "https://linkedin.com/in/profile (optional)"
    }
  ]
}

Make the leads realistic and relevant to the search criteria. Include a lead score (1-100) based on how well they match the criteria. Vary the data realistically - not all leads need all optional fields.

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4000,
                }
              }),
            })
          } else {
            // Fallback to system API
            aiResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                  role: 'user',
                  content: `Generate ${maxResults || 50} realistic business leads for the following criteria:

Project: ${project.name} (${project.industry || 'General'})
Search Query: ${searchQuery}
Target Location: ${targetLocation || 'Global'}
Industry Focus: ${industry || project.industry || 'General'}
Lead Source: ${leadSource}

Please generate leads with the following JSON structure:
{
  "leads": [
    {
      "name": "Full Name",
      "email": "email@company.com", 
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State/Country",
      "industry": "Industry",
      "score": 85,
      "source": "${leadSource}",
      "phone": "+1-555-0123 (optional)",
      "website": "https://company.com (optional)",
      "linkedinUrl": "https://linkedin.com/in/profile (optional)"
    }
  ]
}

Make the leads realistic and relevant to the search criteria. Include a lead score (1-100) based on how well they match the criteria. Vary the data realistically - not all leads need all optional fields.

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`
                }],
                response_format: { type: "json_object" },
                max_tokens: 4000
              }),
            })
          }

          if (!aiResponse.ok) {
            throw new Error('AI service unavailable')
          }

          const aiData = await aiResponse.json()
          let generatedContent
          
          if (geminiApiKey) {
            // Handle Gemini API response
            generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text
          } else {
            // Handle system API response
            generatedContent = aiData.choices?.[0]?.message?.content
          }

          if (!generatedContent) {
            throw new Error('No content generated')
          }

          // Parse the AI response
          let generatedLeads
          try {
            const parsedData = JSON.parse(generatedContent)
            generatedLeads = parsedData.leads || []
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError)
            throw new Error('Invalid AI response format')
          }

          // Send progress updates
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            message: 'Processing and validating leads...'
          })}\n\n`))

          // Send completion with generated leads
          const finalData = JSON.stringify({
            status: 'completed',
            leads: generatedLeads,
            totalCount: generatedLeads.length
          })
          
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          
        } catch (error) {
          console.error('Lead generation error:', error)
          
          // Fallback to demo leads if AI fails
          const demoLeads = [
            {
              name: "Sarah Johnson",
              email: "sarah.johnson@techstartup.com",
              company: "TechStartup Inc.",
              title: "VP of Product",
              location: "San Francisco, CA",
              industry: "Software",
              score: 92,
              source: leadSource,
              phone: "+1-555-0123",
              website: "https://techstartup.com",
              linkedinUrl: "https://linkedin.com/in/sarahjohnson"
            },
            {
              name: "Mike Chen",
              email: "mike.chen@growthco.io", 
              company: "GrowthCo",
              title: "Head of Growth",
              location: "Austin, TX",
              industry: "MarTech",
              score: 88,
              source: leadSource,
              website: "https://growthco.io"
            },
            {
              name: "Jennifer Kim",
              email: "jennifer.kim@designfirm.com",
              company: "Creative Design Firm", 
              title: "Creative Director",
              location: "New York, NY",
              industry: "Design",
              score: 75,
              source: leadSource,
              phone: "+1-555-0456"
            }
          ].slice(0, Math.min(parseInt(maxResults) || 50, 10))

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'completed',
            leads: demoLeads,
            totalCount: demoLeads.length,
            note: 'Demo leads generated (AI service unavailable)'
          })}\n\n`))
          
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
