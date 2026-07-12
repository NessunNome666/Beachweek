'use client'

import { useState } from 'react'
import { Trophy, CalendarDays } from 'lucide-react'

// Barra sticky sotto la navbar (h-16): niente colore di fondo (una tinta piena
// stona sul gradiente radiale fisso della pagina), solo backdrop-blur che
// sfuma le card in scorrimento; -mx-4/px-4 estende il blur oltre il padding
// pagina, così le card non sbucano nitide ai lati delle pillole.
export default function LeaderboardTabs({ general, daily }: {
  general: React.ReactNode
  daily: React.ReactNode
}) {
  const [tab, setTab] = useState<'generale' | 'giornata'>('generale')

  const pill = (active: boolean) =>
    `w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
      active ? 'bg-orange-500/15 border-orange-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
    }`

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 mb-3 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('generale')}
            aria-pressed={tab === 'generale'}
            className={pill(tab === 'generale')}
          >
            <Trophy size={15} className={tab === 'generale' ? 'text-orange-400' : undefined} />
            Generale
          </button>
          <button
            type="button"
            onClick={() => setTab('giornata')}
            aria-pressed={tab === 'giornata'}
            className={pill(tab === 'giornata')}
          >
            <CalendarDays size={15} className={tab === 'giornata' ? 'text-orange-400' : undefined} />
            Giornata
          </button>
        </div>
      </div>
      {tab === 'generale' ? general : daily}
    </>
  )
}
