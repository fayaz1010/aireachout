const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreSuperAdmin() {
  try {
    console.log('🔧 Restoring super admin account...')
    
    const superAdminEmail = 'mohamed.fayaz@gmail.com'
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Create or update the super admin user
    const superAdmin = await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        role: 'SUPER_ADMIN',
        currentPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        emailLimit: null,
        smsLimit: null,
        voiceCallLimit: null,
        leadsLimit: null,
        apiCallLimit: null
      },
      create: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        firstName: 'Mohamed',
        lastName: 'Fayaz',
        role: 'SUPER_ADMIN',
        currentPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        emailLimit: null,
        smsLimit: null,
        voiceCallLimit: null,
        leadsLimit: null,
        apiCallLimit: null
      }
    })
    
    console.log('✅ Super admin account restored:', superAdmin.email)
    console.log('🔑 Role:', superAdmin.role)
    console.log('💼 Plan:', superAdmin.currentPlan)
    
  } catch (error) {
    console.error('❌ Error restoring super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreSuperAdmin()
