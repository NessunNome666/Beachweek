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
  const [mvpActive, setMvpActive] = useState(false)

  const isHome = pathname === '/'
  // Match esatto per tutte le voci, tranne "/tornei" che ha sotto-pagine dinamiche (/tornei/[slug])
  const isActive = (href: string) => pathname === href || (href === '/tornei' && pathname.startsWith('/tornei/'))
  const navLinkClass = (href: string) =>
    `text-base py-4 border-t border-slate-700/60 transition-colors ${
      isActive(href) ? 'text-orange-400 font-semibold' : 'text-white hover:text-orange-400'
    }`

  useEffect(() => {
    const supabase = createClient()

    async function loadUser(userId: string, meta: Record<string, string>) {
      setDisplayName(meta?.display_name ?? meta?.email?.split('@')[0] ?? null)
      const { data } = await supabase.from('users').select('is_admin').eq('id', userId).single()
      setIsAdmin(data?.is_admin ?? false)
    }

    // Votazione MVP: link visibile se esiste almeno un torneo non 'hidden'
    supabase
      .from('tournaments')
      .select('id')
      .neq('mvp_status', 'hidden')
      .limit(1)
      .then(({ data }) => setMvpActive((data?.length ?? 0) > 0))

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
            className="text-white p-2"
            aria-label="Apri menu"
          >
            <Menu size={28} />
          </button>
        </nav>
      </header>

      {/* Overlay panel */}
      {open && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#0d0520]/97 backdrop-blur-sm">
          {/* Header row */}
          <div className="px-5 h-16 flex items-center justify-between">
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
              onClick={() => setOpen(false)}
              className="text-white p-2"
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
              className={navLinkClass('/tornei')}
            >
              Vedi i tornei
            </Link>
            <Link
              href="/partite"
              onClick={() => setOpen(false)}
              className={navLinkClass('/partite')}
            >
              Calendario partite
            </Link>
            <Link
              href="/fantacompetizione/classifica"
              onClick={() => setOpen(false)}
              className={navLinkClass('/fantacompetizione/classifica')}
            >
              Classifica Fanta
            </Link>
            {mvpActive && (
              <Link
                href="/mvp"
                onClick={() => setOpen(false)}
                className={navLinkClass('/mvp')}
              >
                Vota l&apos;MVP
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href="/fantacompetizione/pronostici"
                onClick={() => setOpen(false)}
                className={navLinkClass('/fantacompetizione/pronostici')}
              >
                I miei pronostici
              </Link>
            ) : (
              <Link
                href="/fantacompetizione"
                onClick={() => setOpen(false)}
                className={navLinkClass('/fantacompetizione')}
              >
                Regolamento Fanta
              </Link>
            )}

            {isAdmin && (
              <>
                <p className="pt-4 -mb-1 border-t border-slate-700/60 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Admin
                </p>
                <Link
                  href="/admin/calendario"
                  onClick={() => setOpen(false)}
                  className={navLinkClass('/admin/calendario')}
                >
                  Modifica calendario
                </Link>
                <Link
                  href="/admin/partite"
                  onClick={() => setOpen(false)}
                  className={navLinkClass('/admin/partite')}
                >
                  Inserisci risultati
                </Link>
                <Link
                  href="/admin/sorteggio"
                  onClick={() => setOpen(false)}
                  className={navLinkClass('/admin/sorteggio')}
                >
                  Sorteggi
                </Link>
                <Link
                  href="/admin/mvp"
                  onClick={() => setOpen(false)}
                  className={navLinkClass('/admin/mvp')}
                >
                  Votazione MVP
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
                    <LogOut size={18} />
                    Esci
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-white text-base hover:text-orange-400 transition-colors"
                >
                  <LogIn size={18} />
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
