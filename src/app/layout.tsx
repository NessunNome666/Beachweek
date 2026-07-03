import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Navbar from '@/components/Navbar'
import InstallBanner from '@/components/InstallBanner'
import FooterConditional from '@/components/FooterConditional'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

const beachWeek = localFont({
  src: './fonts/BeachWeek.woff2',
  variable: '--font-beachweek',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tito Beach Week 2026',
  description: 'Segui i risultati e gioca alla fantacompetizione della Tito Beach Week 2026',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} ${beachWeek.variable} h-full`}>
      <head>
        <link rel="preload" href="/HomescreenBG.png" as="image" />
      </head>
      <body className="min-h-full flex flex-col text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <InstallBanner />
        <FooterConditional />
      </body>
    </html>
  )
}
