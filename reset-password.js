const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    console.log('🔧 Resetting password for mohamed.fayaz@gmail.com...')
    
    const email = 'mohamed.fayaz@gmail.com'
    const newPassword = 'admin123' // Simple password for easy login
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN', // Ensure role is still SUPER_ADMIN
        currentPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE'
      }
    })
    
    console.log('✅ Password reset successful!')
    console.log('📧 Email:', updatedUser.email)
    console.log('🔑 New Password:', newPassword)
    console.log('👑 Role:', updatedUser.role)
    console.log('')
    console.log('You can now login with:')
    console.log('Email: mohamed.fayaz@gmail.com')
    console.log('Password: admin123')
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
