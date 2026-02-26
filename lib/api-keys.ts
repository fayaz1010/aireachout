
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'

export async function getUserApiKey(userId: string, service: string): Promise<string | null> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_service: {
          userId,
          service: service as any
        },
        isActive: true
      }
    })

    if (!apiKey) {
      return null
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    })

    return decrypt(apiKey.encryptedKey)
  } catch (error) {
    console.error('Error retrieving API key:', error)
    return null
  }
}

export async function validateApiKey(service: string, apiKey: string): Promise<boolean> {
  // Add basic validation based on service
  switch (service) {
    case 'GEMINI':
      return apiKey.startsWith('AI') && apiKey.length > 10
    case 'GOOGLE_SEARCH':
      return apiKey.length > 10 // Basic validation
    case 'APIFY':
      return apiKey.startsWith('apify_api_')
    case 'PERPLEXITY':
      return apiKey.startsWith('pplx-')
    case 'ELEVENLABS':
      return apiKey.length > 20
    case 'VAPI':
      return apiKey.length > 30 // Vapi API keys are typically longer
    case 'SENDGRID':
      return apiKey.startsWith('SG.')
    case 'TWILIO':
      return apiKey.startsWith('AC') || apiKey.startsWith('SK')
    default:
      return apiKey.length > 5 // Basic fallback validation
  }
}
