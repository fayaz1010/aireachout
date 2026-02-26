
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    throw new Error('Authentication required')
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Super admin access required')
  }
  
  return user
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return user?.role === UserRole.SUPER_ADMIN
}

export async function checkSuperAdminAccess(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  })
  
  return user?.role === UserRole.SUPER_ADMIN
}
