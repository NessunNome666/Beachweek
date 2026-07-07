'use client'

import { useSyncExternalStore } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Store minimale condiviso tra la pillola nell'header di pagina e il deck:
// evita di avvolgere la pagina server in un provider client solo per un boolean.
let visible = false
const listeners = new Set<() => void>()

function setVisible(v: boolean) {
  visible = v
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function usePlayersVisible(): boolean {
  return useSyncExternalStore(subscribe, () => visible, () => false)
}

export function PlayersToggle() {
  const show = usePlayersVisible()
  return (
    <button
      type="button"
      onClick={() => setVisible(!visible)}
      aria-pressed={show}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
        show ? 'bg-orange-500/15 border-orange-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}
    >
      {show ? <Eye size={15} className="text-orange-400" /> : <EyeOff size={15} />}
      Giocatori
    </button>
  )
}
