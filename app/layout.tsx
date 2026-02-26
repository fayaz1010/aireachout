import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ReachOut AI — Lead Generation & Contact Center Platform',
  description:
    'AI-powered platform combining outbound lead generation with a unified contact center. Automate outreach, manage conversations, and convert leads across email, SMS, voice, and social.',
  themeColor: '#0C0C14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} font-sans bg-aurora-bg text-foreground antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
