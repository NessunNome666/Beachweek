'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, Star, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { href: '/tornei', label: 'Tornei' },
  { href: '/fantacompetizione', label: 'Fantacompetizione' },
  { href: '/fantacompetizione/classifica', label: 'Classifica Fanta' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0d0520]/85 backdrop-blur border-b border-orange-900/40">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-orange-400 transition-colors">
          <Trophy size={22} className="text-orange-400" />
          Tito Beach Week 2026
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                pathname.startsWith(href) ? 'text-orange-400' : 'text-slate-300'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/fantacompetizione/pronostici"
            className="flex items-center gap-1.5 bg-orange-500 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-orange-400 transition-colors"
          >
            <Star size={14} />
            I miei pronostici
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pb-4 flex flex-col gap-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium py-2 transition-colors hover:text-orange-400 ${
                pathname.startsWith(href) ? 'text-orange-400' : 'text-slate-300'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/fantacompetizione/pronostici"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 bg-orange-500 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-orange-400 transition-colors"
          >
            <Star size={14} />
            I miei pronostici
          </Link>
        </div>
      )}
    </header>
  )
}
