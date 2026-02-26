
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here' // Should be 32 characters
const ALGORITHM = 'aes-256-cbc'

export function encrypt(text: string): string {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return text
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
    const parts = encryptedData.split(':')
    if (parts.length !== 2) {
      return encryptedData // Return as-is if not properly formatted
    }
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedData
  }
}
