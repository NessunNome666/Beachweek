'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface Props {
  matchId: string
  homeTeamName: string
  awayTeamName: string
}

export default function PredictionForm({ matchId, homeTeamName, awayTeamName }: Props) {
  const [selected, setSelected] = useState<string>('')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!selected) return
    // TODO: save to Supabase when connected
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 text-sm font-semibold">
        <span className="flex-1 truncate">{homeTeamName}</span>
        <span className="text-slate-500 px-3">vs</span>
        <span className="flex-1 truncate text-right">{awayTeamName}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {VALID_VOLLEYBALL_SCORES.map(([h, a]) => {
          const key = `${h}-${a}`
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`py-2 rounded-lg text-sm font-mono font-bold transition-colors ${
                selected === key
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {h} - {a}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={!selected}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white'
        }`}
      >
        {saved ? <><Check size={14} /> Salvato!</> : 'Conferma pronostico'}
      </button>
    </div>
  )
}
