'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Tiene fresche le pagine senza ricaricamenti manuali, su tre canali:
// 1) la pagina torna visibile (riapertura PWA/scheda, ritorno da background)
// 2) push istantaneo via Supabase Realtime su matches/tournaments
//    (richiede le tabelle nella publication supabase_realtime)
// 3) polling di sicurezza finché la pagina è visibile, se il push si perde
//
// I refresh ravvicinati vengono raggruppati: mai più di uno ogni MIN_INTERVAL_MS
// (es. il trigger advance_bracket può generare più eventi per un solo risultato).
const MIN_INTERVAL_MS = 3000
// 120s: col Realtime attivo il polling è solo rete di sicurezza — dimezza l'egress
const POLL_MS = 120000

export default function AutoRefresh() {
  const router = useRouter()
  const lastRefresh = useRef(0)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      const elapsed = Date.now() - lastRefresh.current
      if (elapsed < MIN_INTERVAL_MS) {
        if (!pending.current) {
          pending.current = setTimeout(() => {
            pending.current = null
            lastRefresh.current = Date.now()
            router.refresh()
          }, MIN_INTERVAL_MS - elapsed)
        }
        return
      }
      lastRefresh.current = Date.now()
      router.refresh()
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onVisible)

    const poll = setInterval(refresh, POLL_MS)

    const supabase = createClient()
    const channel = supabase
      .channel('auto-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, refresh)
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onVisible)
      clearInterval(poll)
      if (pending.current) clearTimeout(pending.current)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
