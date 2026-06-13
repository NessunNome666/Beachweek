'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface Props {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  initialPrediction?: string
}

export default function PredictionForm({ matchId, homeTeamName, awayTeamName, initialPrediction }: Props) {
  const [selected, setSelected] = useState(initialPrediction ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(!!initialPrediction)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!selected) return
    setLoading(true)
    setError('')

    const [predictedHome, predictedAway] = selected.split('-').map(Number)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non sei autenticato.'); setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('predictions_match')
      .upsert(
        { user_id: user.id, match_id: matchId, predicted_home: predictedHome, predicted_away: predictedAway },
        { onConflict: 'user_id,match_id' }
      )

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 text-sm font-semibold">
        <span className="flex-1 truncate">{homeTeamName}</span>
        <span className="text-slate-500 px-3">vs</span>
        <span className="flex-1 truncate text-right">{awayTeamName}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
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
              {h} - {a}
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
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white'
        }`}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Salvataggio…</>
        ) : saved ? (
          <><Check size={14} /> Salvato!</>
        ) : (
          'Conferma pronostico'
        )}
      </button>
    </div>
  )
}