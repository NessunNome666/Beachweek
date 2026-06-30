'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogIn, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    const supabase = createClient()

    async function loadUser(userId: string, meta: Record<string, string>) {
      setDisplayName(meta?.display_name ?? meta?.email?.split('@')[0] ?? null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from('users').select('is_admin').eq('id', userId).single()
      setIsAdmin(data?.is_admin ?? false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user.id, session.user.user_metadata as Record<string, string>)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user.id, session.user.user_metadata as Record<string, string>)
      } else {
        setDisplayName(null)
        setIsAdmin(false)
      }
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
    <>
      <header
        className={`z-40 ${
          isHome
            ? 'absolute top-0 left-0 right-0'
            : 'sticky top-0 bg-[#0d0520]/95 backdrop-blur border-b border-slate-800/50'
        }`}
      >
        <nav className="px-5 h-16 flex items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/TypeLine_1.svg"
              alt="Tito Beach Week 26"
              width={148}
              height={38}
              className="invert"
              priority
            />
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="text-white p-1"
            aria-label="Apri menu"
          >
            <Menu size={28} />
          </button>
        </nav>
      </header>

      {/* Overlay panel */}
      {open && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d2b]/97 backdrop-blur-sm">
          {/* Header row */}
          <div className="px-5 h-16 flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image
                src="/TypeLine_1.svg"
                alt="Tito Beach Week 26"
                width={148}
                height={38}
                className="invert"
              />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="text-white p-1"
              aria-label="Chiudi menu"
            >
              <X size={28} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col px-5">
            <Link
              href="/tornei"
              onClick={() => setOpen(false)}
              className="text-white text-base py-4 border-t border-slate-700/60 hover:text-orange-400 transition-colors"
            >
              Vedi i tornei
            </Link>
            <Link
              href="/partite"
              onClick={() => setOpen(false)}
              className="text-white text-base py-4 border-t border-slate-700/60 hover:text-orange-400 transition-colors"
            >
              Calendario partite
            </Link>
            <Link
              href="/fantacompetizione/classifica"
              onClick={() => setOpen(false)}
              className="text-white text-base py-4 border-t border-slate-700/60 hover:text-orange-400 transition-colors"
            >
              Classifica Fanta
            </Link>
            {isLoggedIn ? (
              <Link
                href="/fantacompetizione/pronostici"
                onClick={() => setOpen(false)}
                className="text-white text-base py-4 border-t border-slate-700/60 hover:text-orange-400 transition-colors"
              >
                I miei pronostici
              </Link>
            ) : (
              <Link
                href="/fantacompetizione"
                onClick={() => setOpen(false)}
                className="text-white text-base py-4 border-t border-slate-700/60 hover:text-orange-400 transition-colors"
              >
                Regolamento Fanta
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/admin/calendario"
                  onClick={() => setOpen(false)}
                  className="text-orange-400 text-base py-4 border-t border-slate-700/60 hover:text-orange-300 transition-colors"
                >
                  Modifica calendario
                </Link>
                <Link
                  href="/admin/partite"
                  onClick={() => setOpen(false)}
                  className="text-orange-400 text-base py-4 border-t border-slate-700/60 hover:text-orange-300 transition-colors"
                >
                  Inserisci risultati
                </Link>
                <Link
                  href="/admin/sorteggio"
                  onClick={() => setOpen(false)}
                  className="text-orange-400 text-base py-4 border-t border-slate-700/60 hover:text-orange-300 transition-colors"
                >
                  Sorteggi
                </Link>
              </>
            )}

            {/* Auth row */}
            <div className="flex items-center gap-5 py-4 border-t border-slate-700/60">
              {isLoggedIn ? (
                <>
                  <span className="text-slate-300 text-base">{displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-white text-base hover:text-orange-400 transition-colors"
                  >
                    <LogOut size={16} />
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-white text-base hover:text-orange-400 transition-colors"
                >
                  <LogIn size={20} />
                  Accedi
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
