'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { SocketProvider } from '@/contexts/SocketContext'

interface ProvidersProps {
  children: React.ReactNode
  session?: any
}

export function Providers({ children, session }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SocketProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            toastOptions={{
              style: {
                background: 'var(--aurora-surface)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--aurora-text-1)',
              },
            }}
          />
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
