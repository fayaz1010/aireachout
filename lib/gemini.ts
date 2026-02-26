import { GoogleGenerativeAI } from '@google/generative-ai'

const getGenAI = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not set in environment variables')
  return new GoogleGenerativeAI(apiKey)
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
