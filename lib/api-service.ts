
import { prisma } from './prisma'
import { decrypt } from './crypto'
import { BillingService } from './billing'

export class ApiService {
  static async getApiKey(service: string, userId?: string): Promise<string | null> {
    try {
      // First, try to get user's own API key
      if (userId) {
        const userApiKey = await prisma.apiKey.findUnique({
          where: {
            userId_service: {
              userId,
              service: service as any
            }
          }
        })
        
        if (userApiKey && userApiKey.isActive) {
          return decrypt(userApiKey.encryptedKey)
        }
      }
      
      // If no user key found, use super admin key
      const superAdminKey = await prisma.superAdminApiKey.findUnique({
        where: { service: service as any }
      })
      
      if (superAdminKey && superAdminKey.isActive) {
        return decrypt(superAdminKey.encryptedKey)
      }
      
      return null
    } catch (error) {
      console.error(`Error getting API key for ${service}:`, error)
      return null
    }
  }
  
  static async recordApiUsage(
    service: string,
    operation: string,
    userId?: string,
    quantity: number = 1,
    metadata?: any
  ): Promise<number> {
    try {
      // Check usage limits before recording
      if (userId) {
        const canUse = await BillingService.checkUsageLimits(userId, operation, quantity)
        if (!canUse) {
          throw new Error(`Usage limit exceeded for ${operation}`)
        }
      }
      
      // Record the usage and return cost
      const cost = await BillingService.recordUsage({
        service,
        operation,
        quantity,
        userId,
        metadata
      })
      
      return cost
    } catch (error) {
      console.error('Error recording API usage:', error)
      throw error
    }
  }
  
  static async makeApiCall<T>(
    service: string,
    operation: string,
    apiCall: (apiKey: string) => Promise<T>,
    userId?: string,
    metadata?: any
  ): Promise<T> {
    try {
      // Get API key
      const apiKey = await this.getApiKey(service, userId)
      if (!apiKey) {
        throw new Error(`API key not found for service: ${service}`)
      }
      
      // Make the API call
      const result = await apiCall(apiKey)
      
      // Record usage
      await this.recordApiUsage(service, operation, userId, 1, metadata)
      
      return result
    } catch (error) {
      console.error(`Error making ${service} API call:`, error)
      throw error
    }
  }
}
