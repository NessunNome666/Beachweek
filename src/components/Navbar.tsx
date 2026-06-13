'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trophy, Star, Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/tornei', label: 'Tornei' },
  { href: '/fantacompetizione', label: 'Fantacompetizione' },
  { href: '/fantacompetizione/classifica', label: 'Classifica Fanta' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setDisplayName(
          session.user.user_metadata?.display_name ??
          session.user.email?.split('@')[0] ??
          null
        )
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setDisplayName(
        session?.user?.user_metadata?.display_name ??
        session?.user?.email?.split('@')[0] ??
        null
      )
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const isLoggedIn = displayName !== null

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

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/fantacompetizione/pronostici"
                className="flex items-center gap-1.5 bg-orange-500 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-orange-400 transition-colors"
              >
                <Star size={14} />
                I miei pronostici
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <User size={14} />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm transition-colors"
              >
                <LogOut size={14} />
                Esci
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-orange-400 transition-colors"
            >
              <LogIn size={14} />
              Accedi
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-300 hover:text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pb-4 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium py-3 transition-colors hover:text-orange-400 ${
                pathname.startsWith(href) ? 'text-orange-400' : 'text-slate-300'
              }`}
            >
              {label}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link
                href="/fantacompetizione/pronostici"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-orange-500 text-slate-900 text-sm font-semibold px-4 py-3 rounded-full hover:bg-orange-400 transition-colors mt-2"
              >
                <Star size={14} />
                I miei pronostici
              </Link>
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <User size={14} />
                  <span className="truncate max-w-[160px]">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-sm transition-colors py-2"
                >
                  <LogOut size={14} />
                  Esci
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium py-3 text-slate-300 hover:text-orange-400 transition-colors mt-1 border-t border-slate-800 pt-3"
            >
              <LogIn size={14} />
              Accedi
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
