import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Tito Beach Week 2026',
  description: 'Segui i risultati e gioca alla fantacompetizione della Tito Beach Week 2026',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-slate-500 py-6 border-t border-orange-900/30">
          © 2026 Phœbus Tito Volley — Tito Beach Week
        </footer>
      </body>
    </html>
  )
}
