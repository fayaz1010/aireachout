
import { getUserApiKey } from '@/lib/api-keys'

export interface LeadData {
  name?: string
  email?: string
  company?: string
  title?: string
  location?: string
  industry?: string
  phone?: string
  website?: string
  linkedinUrl?: string
  score?: number
  source: string
}

export async function searchWithGoogleCustomSearch(
  userId: string, 
  query: string, 
  options: { location?: string; industry?: string; maxResults?: number } = {}
): Promise<LeadData[]> {
  const apiKey = await getUserApiKey(userId, 'GOOGLE_SEARCH')
  if (!apiKey) {
    throw new Error('Google Custom Search API key not found')
  }

  // Example implementation - you would implement actual Google Custom Search API call
  const searchQuery = `${query} ${options.industry || ''} ${options.location || ''} email contact`
  
  try {
    // This is a placeholder - implement actual Google Custom Search API call
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=YOUR_SEARCH_ENGINE_ID&q=${encodeURIComponent(searchQuery)}&num=${Math.min(options.maxResults || 10, 10)}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      throw new Error('Google Search API error')
    }

    const data = await response.json()
    
    // Extract lead information from search results
    const leads: LeadData[] = data.items?.map((item: any, index: number) => {
      // This is simplified - you'd need more sophisticated parsing
      const title = item.title || ''
      const snippet = item.snippet || ''
      
      return {
        company: extractCompanyFromTitle(title),
        website: item.link,
        industry: options.industry,
        location: options.location,
        score: 70 + Math.random() * 20, // Basic scoring
        source: 'GOOGLE_SEARCH',
        // You would implement more sophisticated extraction here
      }
    }).filter((lead: LeadData) => lead.company) || []

    return leads
  } catch (error) {
    console.error('Google Search error:', error)
    return []
  }
}

export async function scrapeWithApify(
  userId: string,
  actorId: string,
  input: any,
  options: { maxResults?: number } = {}
): Promise<LeadData[]> {
  const apiKey = await getUserApiKey(userId, 'APIFY')
  if (!apiKey) {
    throw new Error('Apify API key not found')
  }

  try {
    // Start Apify actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      }
    )

    if (!runResponse.ok) {
      throw new Error('Apify actor start failed')
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Wait for completion (simplified - you'd want better polling)
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items?token=${apiKey}&limit=${options.maxResults || 50}`,
      { method: 'GET' }
    )

    if (!resultsResponse.ok) {
      throw new Error('Apify results fetch failed')
    }

    const results = await resultsResponse.json()
    
    // Convert Apify results to standard lead format
    const leads: LeadData[] = results.map((item: any) => ({
      name: item.name || item.fullName,
      email: item.email,
      company: item.company || item.companyName,
      title: item.position || item.jobTitle,
      location: item.location,
      linkedinUrl: item.linkedinUrl || item.profileUrl,
      phone: item.phone,
      website: item.website || item.companyWebsite,
      industry: item.industry,
      score: calculateLeadScore(item),
      source: 'APIFY_SCRAPER'
    })).filter((lead: LeadData) => lead.email || lead.name)

    return leads
  } catch (error) {
    console.error('Apify scraping error:', error)
    return []
  }
}

export async function researchWithPerplexity(
  userId: string,
  query: string,
  context: string = ''
): Promise<string> {
  const apiKey = await getUserApiKey(userId, 'PERPLEXITY')
  if (!apiKey) {
    throw new Error('Perplexity API key not found')
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant helping with lead generation and market research.'
          },
          {
            role: 'user',
            content: `${context}\n\nPlease research: ${query}`
          }
        ],
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('Perplexity API error')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'No research results found'
  } catch (error) {
    console.error('Perplexity research error:', error)
    return 'Research unavailable'
  }
}

// Helper functions
function extractCompanyFromTitle(title: string): string {
  // Basic company extraction logic
  const patterns = [
    /^(.*?)\s*-\s*.*$/,
    /^(.*?)\s*\|\s*.*$/,
    /^(.*?)\s*:.*$/
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return title.split(' ').slice(0, 3).join(' ') // Fallback
}

function calculateLeadScore(leadData: any): number {
  let score = 50 // Base score
  
  if (leadData.email) score += 20
  if (leadData.phone) score += 10
  if (leadData.linkedinUrl) score += 10
  if (leadData.company) score += 10
  if (leadData.position) score += 5
  if (leadData.website) score += 5
  
  return Math.min(score, 100)
}

export const LEAD_SOURCE_CONFIGS = {
  GOOGLE_SEARCH: {
    name: 'Google Search',
    description: 'Search for leads using Google Custom Search API',
    apiKeyRequired: 'GOOGLE_SEARCH',
    maxResults: 10
  },
  APIFY_SCRAPER: {
    name: 'Apify Scraper',
    description: 'Scrape leads from websites and social platforms',
    apiKeyRequired: 'APIFY',
    maxResults: 100
  },
  LINKEDIN_SCRAPER: {
    name: 'LinkedIn Scraper',
    description: 'Extract leads from LinkedIn (requires Apify)',
    apiKeyRequired: 'APIFY',
    maxResults: 50
  },
  PERPLEXITY_RESEARCH: {
    name: 'AI Research',
    description: 'Use AI to research and find potential leads',
    apiKeyRequired: 'PERPLEXITY',
    maxResults: 20
  }
}
