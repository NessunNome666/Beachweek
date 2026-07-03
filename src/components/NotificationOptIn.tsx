'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing, Share, Loader2 } from 'lucide-react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// La chiave VAPID va convertita in Uint8Array per pushManager.subscribe.
// Buffer allocato esplicitamente su ArrayBuffer per soddisfare il tipo BufferSource.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

type State = 'loading' | 'hidden' | 'need-install' | 'prompt' | 'granted' | 'denied' | 'working'

export default function NotificationOptIn() {
  const [state, setState] = useState<State>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    // Rilevazione ambiente al mount tramite API browser (navigator, matchMedia,
    // Notification.permission) non disponibili in SSR: va fatta in effect.
    // Su iPhone le push funzionano SOLO se la PWA è installata sulla Home.
    if (isIos && !isStandalone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('need-install')
      return
    }
    if (!supported || !VAPID_PUBLIC_KEY) {
      setState('hidden')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }

    // Registra il SW (idempotente) e verifica se c'è già una subscription attiva
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'granted' : 'prompt'))
      .catch(() => setState('prompt'))
  }, [])

  async function enable() {
    setError('')
    if (!VAPID_PUBLIC_KEY) return
    setState('working')
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'prompt')
        return
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      if (!res.ok) throw new Error('subscribe failed')
      setState('granted')
    } catch {
      setError('Non è stato possibile attivare le notifiche. Riprova.')
      setState('prompt')
    }
  }

  async function disable() {
    setState('working')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
        await sub.unsubscribe()
      }
      setState('prompt')
    } catch {
      setState('granted')
    }
  }

  if (state === 'loading' || state === 'hidden') return null

  const base = 'rounded-xl border px-4 py-3 mb-6 text-sm'

  if (state === 'need-install') {
    return (
      <div className={`${base} bg-slate-900 border-slate-800 text-slate-300`}>
        <p className="flex items-center gap-2 font-semibold text-white mb-1">
          <Bell size={15} className="text-orange-400" /> Vuoi i promemoria?
        </p>
        <p className="text-xs text-slate-400 leading-snug">
          Su iPhone le notifiche arrivano solo dopo aver aggiunto l&apos;app alla schermata Home:
          tocca <Share size={12} className="inline -mt-0.5" /> <strong>Condividi</strong> →{' '}
          <strong>&quot;Aggiungi alla schermata Home&quot;</strong>, poi riapri l&apos;app da lì.
        </p>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className={`${base} bg-slate-900 border-slate-800 text-slate-400`}>
        <p className="flex items-center gap-2 text-xs leading-snug">
          <Bell size={14} className="text-slate-500 shrink-0" />
          Notifiche bloccate. Per riattivarle, abilitale per questo sito dalle impostazioni del
          browser.
        </p>
      </div>
    )
  }

  if (state === 'granted') {
    return (
      <div
        className={`${base} bg-orange-500/10 border-orange-400/40 flex items-center justify-between gap-3`}
      >
        <p className="flex items-center gap-2 font-semibold text-orange-300">
          <BellRing size={15} /> Promemoria attivi
        </p>
        <button
          onClick={disable}
          className="text-xs text-slate-400 hover:text-white transition-colors underline"
        >
          Disattiva
        </button>
      </div>
    )
  }

  // prompt / working
  return (
    <div className={`${base} bg-slate-900 border-slate-800`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-white">
            <Bell size={15} className="text-orange-400" /> Attiva i promemoria
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Un avviso per ricordarti i pronostici e le novità del torneo.
          </p>
        </div>
        <button
          onClick={enable}
          disabled={state === 'working'}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-400 text-slate-900 hover:bg-orange-300 disabled:opacity-50 transition-colors shrink-0"
        >
          {state === 'working' ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
          Attiva
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
