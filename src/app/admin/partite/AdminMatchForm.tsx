'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface Match {
  id: string
  phase: string
  round: number
  score_home: number | null
  score_away: number | null
  status: string
  court: string | null
}

interface Props {
  match: Match
  homeTeamName: string
  awayTeamName: string
}

export default function AdminMatchForm({ match, homeTeamName, awayTeamName }: Props) {
  const initialScore = match.score_home !== null ? `${match.score_home}-${match.score_away}` : ''
  const [selected, setSelected] = useState(initialScore)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(match.status === 'completed')
  const [error, setError] = useState('')

  async function handleSave() {
    if (!selected) return
    setLoading(true)
    setError('')

    const [scoreHome, scoreAway] = selected.split('-').map(Number)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('matches')
      .update({ score_home: scoreHome, score_away: scoreAway, status: 'completed' })
      .eq('id', match.id)

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
    }
  }

  const phaseLabels: Record<string, string> = {
    girone: 'Girone',
    quarti: 'Quarti',
    semifinale: 'Semifinale',
    finale: 'Finale',
    terzo_posto: '3° Posto',
  }

  return (
    <div className={`bg-slate-900 border rounded-xl p-4 ${saved ? 'border-green-800/50' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>{phaseLabels[match.phase] ?? match.phase} — Round {match.round}</span>
        {match.court && <span>{match.court}</span>}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="font-semibold flex-1 truncate">{homeTeamName}</span>
        <span className="text-slate-500 text-sm">vs</span>
        <span className="font-semibold flex-1 truncate text-right">{awayTeamName}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        {VALID_VOLLEYBALL_SCORES.map(([h, a]) => {
          const key = `${h}-${a}`
          return (
            <button
              key={key}
              onClick={() => { setSelected(key); setSaved(false); setError('') }}
              className={`py-3 rounded-lg text-sm font-mono font-bold transition-colors ${
                selected === key
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {h}-{a}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!selected || loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-500/20 text-green-400 cursor-default'
            : 'bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-40'
        }`}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Salvataggio…</>
        ) : saved ? (
          <><Check size={14} /> Risultato salvato</>
        ) : (
          'Salva risultato'
        )}
      </button>
    </div>
  )
}
