'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchPoints } from '@/lib/scoring'
import ScoreButtons from '@/components/ScoreButtons'

interface Props {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  initialPrediction?: string
  matchStatus: string
  actualHome?: number | null
  actualAway?: number | null
}

export default function PredictionForm({
  matchId,
  homeTeamName,
  awayTeamName,
  initialPrediction,
  matchStatus,
  actualHome,
  actualAway,
}: Props) {
  const [selected, setSelected] = useState(initialPrediction ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(!!initialPrediction)
  const [error, setError] = useState('')

  const isCompleted = matchStatus === 'completed'

  // Show result view for completed matches
  if (isCompleted) {
    const hasPrediction = !!initialPrediction
    let points = 0
    let correct = false

    if (hasPrediction && actualHome != null && actualAway != null) {
      const [ph, pa] = initialPrediction!.split('-').map(Number)
      points = calculateMatchPoints(ph, pa, actualHome, actualAway)
      correct = points > 0
    }

    return (
      <div className={`border rounded-xl p-4 ${
        !hasPrediction
          ? 'bg-slate-900 border-slate-800'
          : correct
            ? 'bg-green-950/40 border-green-700/40'
            : 'bg-red-950/30 border-red-800/30'
      }`}>
        <div className="flex items-center justify-between mb-3 text-sm font-semibold">
          <span className="flex-1 truncate">{homeTeamName}</span>
          <span className="text-slate-500 px-3">vs</span>
          <span className="flex-1 truncate text-right">{awayTeamName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            {hasPrediction ? (
              <span>Il tuo pronostico: <span className="font-mono font-bold text-white">{initialPrediction!.replace('-', ' - ')}</span></span>
            ) : (
              <span className="text-slate-600 italic">Nessun pronostico inserito</span>
            )}
          </div>
          {actualHome != null && actualAway != null && (
            <span className="font-mono font-bold text-slate-300">{actualHome} - {actualAway}</span>
          )}
        </div>

        {hasPrediction && (
          <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {points === 3 ? 'Risultato esatto' : points === 1 ? 'Vincitore corretto' : 'Pronostico sbagliato'}
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
              correct ? 'bg-green-900/50 text-green-300' : 'bg-red-900/30 text-red-400'
            }`}>
              +{points} pt
            </span>
          </div>
        )}
      </div>
    )
  }

  // Scheduled/in_progress: show form
  async function handleSave() {
    if (!selected) return
    setLoading(true)
    setError('')

    const [predictedHome, predictedAway] = selected.split('-').map(Number)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non sei autenticato.'); setLoading(false); return }

    const { error: dbError } = await supabase
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

  const isPostponed = matchStatus === 'postponed'

  return (
    <div className={`bg-slate-900 border rounded-xl p-5 ${isPostponed ? 'border-orange-500/30' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-1 text-sm font-semibold">
        <span className="flex-1 truncate">{homeTeamName}</span>
        <span className="text-slate-500 px-3">vs</span>
        <span className="flex-1 truncate text-right">{awayTeamName}</span>
      </div>

      {isPostponed && (
        <p className="flex items-center gap-1 text-xs text-orange-400 mb-3">
          <Clock size={11} /> Partita rinviata — il pronostico potrebbe non essere valutato
        </p>
      )}

      <ScoreButtons
        selected={selected}
        onSelect={(key) => { setSelected(key); setSaved(false); setError('') }}
        columns={3}
        spaced
        className="mb-4 mt-3"
      />

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
