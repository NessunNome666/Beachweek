'use client'

import { usePathname } from 'next/navigation'

export default function FooterConditional() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return (
    <footer className="text-center text-xs text-slate-500 py-6">
      © 2026 Phœbus Tito Volley — Tito Beach Week
    </footer>
  )
}
