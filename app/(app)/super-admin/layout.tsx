import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/super-admin'
import { Shield } from 'lucide-react'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireSuperAdmin()
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      redirect('/login?error=authentication_required&callbackUrl=/super-admin')
    }
    redirect('/dashboard?error=access_denied')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
          <Shield className="h-4 w-4 text-violet-400" />
        </div>
        <span className="text-sm font-semibold text-foreground">Super Admin</span>
      </div>
      {children}
    </div>
  )
}
