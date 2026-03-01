import { GoogleGenerativeAI } from '@google/generative-ai'

const getGenAI = (apiKey?: string) => {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY
  if (!key) throw new Error('Gemini API key is not available')
  return new GoogleGenerativeAI(key)
}

// Get Gemini 2.5 Flash model (lazy init)
export const geminiModel = {
  generateContent: async (prompt: string | object) => {
    return getGenAI().getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: { temperature: 0.7, topP: 0.8, topK: 40, maxOutputTokens: 8192 }
    }).generateContent(prompt as any)
  }
}

export interface WebsiteAnalysis {
  businessName: string
  businessType: string
  industry: string
  services: string[]
  targetAudience: string
  location: string
  socialPresence?: {
    twitter?: string | null
    facebook?: string | null
    linkedin?: string | null
    other?: string[]
  }
  suggestedSearchQueries: string[]
  suggestedIndustry: string
  suggestedLocation: string
  campaignAngles: { angle: string; description: string; searchQuery: string; source?: string }[]
  competitorKeywords: string[]
  summary: string
}

/**
 * Analyze a target website using Gemini with Google Search grounding
 * to formulate intelligent campaign parameters.
 */
export async function analyzeWebsiteForCampaign(
  websiteUrl: string,
  projectContext?: { name?: string; industry?: string },
  apiKey?: string
): Promise<WebsiteAnalysis> {
  const genAI = getGenAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} } as any],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  })

  const prompt = `You are a lead generation and outreach strategist. Analyze this website thoroughly using Google Search to gather real, current information:

WEBSITE: ${websiteUrl}
${projectContext?.name ? `MY PROJECT: ${projectContext.name}` : ''}
${projectContext?.industry ? `MY INDUSTRY: ${projectContext.industry}` : ''}

Research the website and its business using Google Search. Specifically:
1. What the business does, its services/products, and industry
2. Who their target customers/audience are
3. Where they operate (geographic reach)
4. Their competitors and market positioning
5. What kind of businesses or people would want to reach them OR businesses similar to them

SOCIAL MEDIA RESEARCH — also search for:
6. Their X/Twitter presence — search "site:x.com ${websiteUrl}" or their brand name on X. Note followers, posting topics, and who engages with them.
7. Their Facebook presence — search "site:facebook.com ${websiteUrl}" or their brand name on Facebook. Look for public pages, groups they're in, community engagement.
8. Any other social profiles (Instagram, LinkedIn company page, YouTube)

Then provide a campaign strategy for finding leads related to this website. These leads could be:
- Similar businesses to prospect (competitors' customers)
- Potential partners or suppliers
- Businesses in the same vertical or adjacent markets
- Decision makers who would benefit from outreach
- People actively discussing this niche on X/Twitter or in Facebook groups

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "businessName": "The actual business name",
  "businessType": "e.g., SaaS, Agency, E-commerce, Non-profit, Religious Organization, etc.",
  "industry": "Primary industry",
  "services": ["service1", "service2", "service3"],
  "targetAudience": "Who this business serves",
  "location": "Primary location/region",
  "socialPresence": {
    "twitter": "X/Twitter URL if found, or null",
    "facebook": "Facebook page URL if found, or null",
    "linkedin": "LinkedIn company URL if found, or null",
    "other": ["any other social URLs found"]
  },
  "suggestedSearchQueries": [
    "Best search query for finding leads",
    "Alternative search query 1",
    "Alternative search query 2",
    "Alternative search query 3"
  ],
  "suggestedIndustry": "Best industry filter for lead search",
  "suggestedLocation": "Best location filter, or empty if global",
  "campaignAngles": [
    {
      "angle": "Short name for this approach",
      "description": "Why this angle works",
      "searchQuery": "Specific search query for this angle",
      "source": "web | x_twitter | facebook | linkedin"
    }
  ],
  "competitorKeywords": ["keyword1", "keyword2", "keyword3"],
  "summary": "2-3 sentence summary of the business and recommended outreach strategy"
}`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse website analysis response')
  }

  return JSON.parse(jsonMatch[0]) as WebsiteAnalysis
}

/**
 * Generate leads using Gemini with Google Search grounding.
 * Uses real web search to find actual businesses/contacts rather than fictional data.
 */
export async function generateLeadsWithGroundedSearch(
  searchQuery: string,
  options: {
    location?: string
    industry?: string
    maxResults?: number
    projectName?: string
    websiteContext?: string
  },
  apiKey?: string
): Promise<any[]> {
  const genAI = getGenAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} } as any],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    },
  })

  const maxResults = Math.min(options.maxResults || 25, 50)

  const prompt = `You are a lead generation specialist. Use Google Search to find REAL businesses and contacts matching this criteria:

SEARCH QUERY: ${searchQuery}
${options.location ? `LOCATION: ${options.location}` : ''}
${options.industry ? `INDUSTRY: ${options.industry}` : ''}
${options.projectName ? `FOR PROJECT: ${options.projectName}` : ''}
${options.websiteContext ? `CONTEXT: ${options.websiteContext}` : ''}
TARGET COUNT: ${maxResults} leads

SEARCH ACROSS MULTIPLE SOURCES — you must search all of these:

1. REGULAR WEB: Search Google for businesses, organizations, directories, and contact pages matching the criteria.

2. X / TWITTER: Search "site:x.com" or "site:twitter.com" combined with the search query. Find people and businesses who:
   - Post about topics related to the search query
   - Have relevant job titles or business descriptions in their bio
   - Are actively engaging in conversations about this niche
   Extract their display name, handle (@username), bio info, and any links in their profile.

3. FACEBOOK PUBLIC DATA: Search "site:facebook.com" combined with the search query. Find:
   - Public Facebook pages of matching businesses or organizations
   - Public Facebook groups related to the niche (and their admins/prominent members)
   - Public profiles of relevant professionals
   Extract page names, about info, location, contact details, and URLs.

4. LINKEDIN: Search "site:linkedin.com/in" or "site:linkedin.com/company" with the query for professional profiles and company pages.

IMPORTANT RULES:
- Every lead MUST be based on real search results — real names, real companies, real URLs
- Include the actual source URL where you found each lead
- For emails: use what you find publicly, or derive using standard patterns (info@, contact@, firstname@domain.com)
- Mark the source type for each lead so we know where they came from
- Score 1-100 based on relevance to search criteria AND quality of contact data found
- Leads with direct contact info score higher than those without

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "leads": [
    {
      "name": "Contact Name or Business Name",
      "email": "discoverable or derived email",
      "company": "Company/Organization Name",
      "title": "Job Title if available",
      "location": "City, State/Country",
      "industry": "Industry",
      "score": 85,
      "source": "GOOGLE_SEARCH",
      "sourceType": "web | x_twitter | facebook | linkedin",
      "phone": "phone if found",
      "website": "https://actual-website.com",
      "linkedinUrl": "LinkedIn URL if found",
      "twitterUrl": "X/Twitter profile URL if found",
      "facebookUrl": "Facebook page/profile URL if found",
      "sourceUrl": "URL where this lead was found",
      "notes": "Brief context on how/where this lead was found"
    }
  ],
  "searchSummary": "Summary of what was found across each source (web, X, Facebook, LinkedIn)"
}`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse lead generation response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.leads || []
}

// Marketing Strategy Analysis with Gemini
export async function analyzeProjectWithGemini(projectData: {
  repoData: any
  languages: any
  readmeContent: string
  projectInfo: any
}) {
  const { repoData, languages, readmeContent, projectInfo } = projectData

  const prompt = `
You are an expert marketing strategist and business analyst. Analyze this GitHub project and provide comprehensive marketing strategy recommendations.

PROJECT DATA:
- Name: ${repoData.name}
- Description: ${repoData.description || 'No description'}
- Stars: ${repoData.stargazers_count}
- Forks: ${repoData.forks_count}
- Language: ${repoData.language}
- Languages Used: ${JSON.stringify(languages)}
- Created: ${repoData.created_at}
- Last Updated: ${repoData.updated_at}
- Topics: ${repoData.topics?.join(', ') || 'None'}

README CONTENT:
${readmeContent.substring(0, 4000)}

USER PROVIDED INFO:
- Project Name: ${projectInfo.projectName}
- Description: ${projectInfo.description || 'Not provided'}
- Target Market: ${projectInfo.targetMarket || 'Not specified'}
- Business Model: ${projectInfo.businessModel || 'Not specified'}

ANALYSIS REQUIREMENTS:
Provide a detailed JSON response with the following structure:

{
  "projectType": {
    "type": "SAAS|MARKETPLACE|ECOMMERCE|MOBILE_APP|API_SERVICE|OTHER",
    "confidence": 0-100,
    "indicators": ["reason1", "reason2", "reason3"]
  },
  "targetAudience": {
    "primary": "developers|business_owners|consumers|enterprises",
    "characteristics": ["trait1", "trait2", "trait3"],
    "painPoints": ["pain1", "pain2", "pain3"],
    "channels": ["channel1", "channel2", "channel3"]
  },
  "competitivePosition": {
    "marketPosition": "emerging|growing|established|declining",
    "differentiators": ["diff1", "diff2"],
    "advantages": ["adv1", "adv2"],
    "challenges": ["challenge1", "challenge2"]
  },
  "recommendedStrategies": [
    {
      "strategy": "Strategy Name",
      "priority": "very_high|high|medium|low",
      "confidence": 0-100,
      "reasoning": "Why this strategy fits",
      "expectedROI": "ROI estimate",
      "timeline": "Implementation timeline",
      "tactics": ["tactic1", "tactic2", "tactic3", "tactic4"]
    }
  ],
  "implementationPlan": {
    "phase1": {
      "title": "Phase 1 Title",
      "duration": "Duration",
      "tasks": ["task1", "task2", "task3"]
    },
    "phase2": {
      "title": "Phase 2 Title", 
      "duration": "Duration",
      "tasks": ["task1", "task2", "task3"]
    },
    "phase3": {
      "title": "Phase 3 Title",
      "duration": "Duration", 
      "tasks": ["task1", "task2", "task3"]
    }
  },
  "keyMetrics": ["metric1", "metric2", "metric3"],
  "budgetEstimate": {
    "low": "Low estimate",
    "medium": "Medium estimate", 
    "high": "High estimate"
  }
}

Focus on actionable, data-driven recommendations. Consider the project's maturity, technology stack, and market potential.
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid JSON response from Gemini')
  } catch (error) {
    console.error('Gemini analysis error:', error)
    throw error
  }
}

// Generate marketing content with Gemini
export async function generateMarketingContent(type: 'email' | 'social' | 'blog' | 'ad', context: any) {
  const prompts = {
    email: `Create a compelling email campaign for: ${context.productName}. Target audience: ${context.audience}. Key benefits: ${context.benefits}. Include subject line and body.`,
    social: `Create engaging social media posts for: ${context.productName}. Platform: ${context.platform}. Tone: ${context.tone}. Include hashtags.`,
    blog: `Create a blog post outline for: ${context.topic}. Target keywords: ${context.keywords}. Audience: ${context.audience}.`,
    ad: `Create ad copy for: ${context.productName}. Platform: ${context.platform}. Budget: ${context.budget}. Target: ${context.target}.`
  }

  try {
    const result = await geminiModel.generateContent(prompts[type])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Content generation error:', error)
    throw error
  }
}

// Analyze competitor with Gemini
export async function analyzeCompetitor(competitorData: {
  name: string
  website?: string
  description?: string
  features?: string[]
}) {
  const prompt = `
Analyze this competitor and provide strategic insights:

COMPETITOR: ${competitorData.name}
WEBSITE: ${competitorData.website || 'Not provided'}
DESCRIPTION: ${competitorData.description || 'Not provided'}
FEATURES: ${competitorData.features?.join(', ') || 'Not provided'}

Provide analysis in JSON format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"], 
  "marketPosition": "leader|challenger|follower|niche",
  "pricingStrategy": "premium|competitive|budget|freemium",
  "differentiationOpportunities": ["opp1", "opp2"],
  "threats": ["threat1", "threat2"],
  "recommendations": ["rec1", "rec2"]
}
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error('Invalid JSON response from Gemini')
  } catch (error) {
    console.error('Competitor analysis error:', error)
    throw error
  }
}
