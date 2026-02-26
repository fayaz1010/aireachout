
import twilio from 'twilio'
import { getUserApiKey } from '@/lib/api-keys'
import { prisma } from '@/lib/db'

export interface VoiceCallOptions {
  recipientPhone: string
  recipientName?: string
  script: string
  voiceType: 'AI' | 'HUMAN'
  campaignId: string
  leadId: string
  userId: string
}

export interface CallResult {
  success: boolean
  callId?: string
  error?: string
  status: 'INITIATED' | 'CONNECTED' | 'FAILED' | 'COMPLETED'
}

export class VoiceCallService {
  private userId: string
  private elevenLabsClient?: any
  private twilioClient?: twilio.Twilio
  private vapiApiKey?: string | null

  constructor(userId: string) {
    this.userId = userId
  }

  private async initializeClients() {
    try {
      // Initialize ElevenLabs
      const elevenLabsKey = await getUserApiKey(this.userId, 'ELEVENLABS')
      if (elevenLabsKey) {
        // For now, we'll use a simple placeholder for ElevenLabs
        this.elevenLabsClient = {
          generate: async (options: any) => {
            // Placeholder implementation
            console.log('ElevenLabs generation requested:', options)
            return Buffer.from('audio-placeholder')
          }
        }
      }

      // Initialize Twilio
      const twilioAccountSid = await getUserApiKey(this.userId, 'TWILIO')
      // For now, we'll get auth token from the same API key field
      // In production, you should store these separately
      if (twilioAccountSid) {
        // Extract Account SID and Auth Token if stored together
        const [accountSid, authToken] = twilioAccountSid.split(':')
        if (authToken) {
          this.twilioClient = twilio(accountSid, authToken)
        }
      }

      // Get Vapi API Key
      this.vapiApiKey = await getUserApiKey(this.userId, 'VAPI')

    } catch (error) {
      console.error('Error initializing voice clients:', error)
      throw new Error('Failed to initialize voice call services')
    }
  }

  async makeVoiceCall(options: VoiceCallOptions): Promise<CallResult> {
    try {
      await this.initializeClients()

      if (!this.vapiApiKey) {
        throw new Error('Vapi API key not configured')
      }

      if (!this.twilioClient) {
        throw new Error('Twilio not configured')
      }

      // Create voice call history record
      const callHistory = await prisma.voiceCallHistory.create({
        data: {
          recipientPhone: options.recipientPhone,
          recipientName: options.recipientName,
          script: options.script,
          voiceType: options.voiceType,
          status: 'INITIATED',
          campaignId: options.campaignId,
          leadId: options.leadId,
        }
      })

      if (options.voiceType === 'AI') {
        // Use Vapi for AI voice calls
        return await this.makeVapiCall(options, callHistory.id)
      } else {
        // Use Twilio for human calls (basic implementation)
        return await this.makeTwilioCall(options, callHistory.id)
      }

    } catch (error) {
      console.error('Voice call error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'FAILED'
      }
    }
  }

  private async makeVapiCall(options: VoiceCallOptions, callHistoryId: string): Promise<CallResult> {
    try {
      // Generate voice using ElevenLabs if available
      let voiceId = 'default'
      if (this.elevenLabsClient) {
        // Use a professional voice for calls
        voiceId = '21m00Tcm4TlvDq8ikWAM' // Rachel voice ID from ElevenLabs
      }

      // Create Vapi call using their API
      const vapiResponse = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID, // You'll need to set this
          customer: {
            number: options.recipientPhone,
            name: options.recipientName
          },
          assistant: {
            model: {
              provider: 'openai',
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: `You are a professional sales representative making a personalized outreach call. Use this script as a guide but keep the conversation natural: ${options.script}`
                }
              ]
            },
            voice: {
              provider: 'elevenlabs',
              voiceId: voiceId
            },
            firstMessage: `Hello ${options.recipientName || 'there'}, this is an automated call. How are you doing today?`,
            endCallPhrases: ['goodbye', 'thank you', 'have a great day', 'not interested']
          }
        })
      })

      const vapiResult = await vapiResponse.json()

      if (vapiResponse.ok && vapiResult.id) {
        // Update call history with Vapi call ID
        await prisma.voiceCallHistory.update({
          where: { id: callHistoryId },
          data: {
            externalCallId: vapiResult.id,
            status: 'CONNECTED'
          }
        })

        return {
          success: true,
          callId: vapiResult.id,
          status: 'CONNECTED'
        }
      } else {
        throw new Error(vapiResult.message || 'Vapi call failed')
      }

    } catch (error) {
      await prisma.voiceCallHistory.update({
        where: { id: callHistoryId },
        data: { status: 'FAILED' }
      })

      throw error
    }
  }

  private async makeTwilioCall(options: VoiceCallOptions, callHistoryId: string): Promise<CallResult> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized')
      }

      // For human calls, we'll create a simple Twilio call that plays a pre-recorded message
      let audioUrl = process.env.TWILIO_DEFAULT_MESSAGE_URL

      // If ElevenLabs is available, generate audio
      if (this.elevenLabsClient) {
        audioUrl = await this.generateElevenLabsAudio(options.script, callHistoryId)
      }

      const call = await this.twilioClient.calls.create({
        to: options.recipientPhone,
        from: process.env.TWILIO_PHONE_NUMBER || '+1234567890', // You'll need to set this
        url: audioUrl || 'http://demo.twilio.com/docs/voice.xml', // Fallback TwiML
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      })

      // Update call history
      await prisma.voiceCallHistory.update({
        where: { id: callHistoryId },
        data: {
          externalCallId: call.sid,
          status: 'CONNECTED'
        }
      })

      return {
        success: true,
        callId: call.sid,
        status: 'CONNECTED'
      }

    } catch (error) {
      await prisma.voiceCallHistory.update({
        where: { id: callHistoryId },
        data: { status: 'FAILED' }
      })

      throw error
    }
  }

  private async generateElevenLabsAudio(script: string, callHistoryId: string): Promise<string> {
    try {
      if (!this.elevenLabsClient) {
        throw new Error('ElevenLabs client not initialized')
      }

      const audio = await this.elevenLabsClient.generate({
        voice: 'Rachel', // Professional female voice
        text: script,
        model_id: 'eleven_monolingual_v1'
      })

      // In a real implementation, you'd save this audio to a CDN/S3 and return the URL
      // For now, we'll return a placeholder
      return `${process.env.NEXT_PUBLIC_APP_URL}/api/audio/${callHistoryId}.mp3`

    } catch (error) {
      console.error('ElevenLabs audio generation error:', error)
      throw error
    }
  }

  async getCallStatus(callId: string): Promise<any> {
    try {
      if (this.vapiApiKey) {
        const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
          headers: {
            'Authorization': `Bearer ${this.vapiApiKey}`
          }
        })
        return await response.json()
      }

      if (this.twilioClient) {
        return await this.twilioClient.calls(callId).fetch()
      }

      throw new Error('No voice service configured')

    } catch (error) {
      console.error('Error fetching call status:', error)
      throw error
    }
  }
}

export async function createVoiceCall(userId: string, options: VoiceCallOptions): Promise<CallResult> {
  const voiceService = new VoiceCallService(userId)
  return await voiceService.makeVoiceCall(options)
}
