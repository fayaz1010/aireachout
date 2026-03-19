import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ReachOut AI - Lead Generation & Contact Center Platform',
  verification: {
    google: 'GzD3b5MPazhHwEFAcOFEiaTyHQtNXDOi6XfXc7YKVMY',
  },
  description:
    'AI-powered platform combining outbound lead generation with a unified contact center. Automate outreach, manage conversations, and convert leads across email, SMS, voice, and social.',
  themeColor: '#0C0C14',
<<<<<<< HEAD
  metadataBase: new URL('https://www.aireachout.com'),
  openGraph: {
    type: 'website',
    url: 'https://www.aireachout.com',
    title: 'ReachOut AI - AI-Powered Lead Generation & Contact Center',
    description:
      'Automate outbound outreach, unify conversations, and convert more leads with AI. Email, SMS, voice, and social — all in one platform.',
    siteName: 'ReachOut AI',
    images: [
      {
        url: 'https://www.aireachout.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ReachOut AI - Lead Generation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReachOut AI - AI-Powered Lead Generation',
    description: 'Automate outbound outreach and convert more leads with AI.',
    images: ['https://www.aireachout.com/og-image.png'],
=======
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aireachout.com',
    siteName: 'ReachOut AI',
    title: 'ReachOut AI — Lead Generation & Contact Center Platform',
    description: 'AI-powered platform combining outbound lead generation with a unified contact center.',
  },
  alternates: {
    canonical: 'https://aireachout.com',
  },
  robots: {
    index: true,
    follow: true,
>>>>>>> 5d943d5 (fix: add security headers and meta tags)
  },
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
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1546745079461283" crossOrigin="anonymous" strategy="afterInteractive" />
      </body>
    </html>
  )
}