'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface MatchItem {
  id: string
  homeTeamName: string
  awayTeamName: string
  matchStatus: string
  initialPrediction?: string
}

interface Props {
  matches: MatchItem[]
}

export default function PredictionsBatchForm({ matches }: Props) {
  // Solo partite senza pronostico esistente sono modificabili
  const lockedMatches = new Set(matches.filter((m) => m.initialPrediction).map((m) => m.id))
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const openMatches = matches.filter((m) => !lockedMatches.has(m.id))
  const pendingCount = openMatches.filter((m) => selections[m.id]).length

  function select(matchId: string, score: string) {
    if (lockedMatches.has(matchId)) return
    setSelections((prev) => ({ ...prev, [matchId]: score }))
    setDone(false)
    setError('')
  }

  async function handleSaveAll() {
    // Invia solo partite non bloccate con una selezione
    const entries = openMatches
      .filter((m) => selections[m.id])
      .map((m) => [m.id, selections[m.id]] as [string, string])
    if (entries.length === 0) return
    setLoading(true)
    setError('')
    setSavedCount(0)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non sei autenticato.'); setLoading(false); return }

    let saved = 0
    for (const [matchId, score] of entries) {
      const [predictedHome, predictedAway] = score.split('-').map(Number)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('predictions_match')
        .insert({ user_id: user.id, match_id: matchId, predicted_home: predictedHome, predicted_away: predictedAway })
      if (!dbError) saved++
    }

    setLoading(false)
    setSavedCount(saved)
    if (saved < entries.length) {
      setError(`${entries.length - saved} pronostici non salvati. Riprova.`)
    } else {
      setDone(true)
    }
  }

  if (matches.length === 0) return null
  const allLocked = openMatches.length === 0

  return (
    <div>
      <div className="space-y-4 mb-6">
        {matches.map((match) => {
          const isLocked = lockedMatches.has(match.id)
          const selected = isLocked ? match.initialPrediction! : (selections[match.id] ?? '')
          const isPostponed = match.matchStatus === 'postponed'

          if (isLocked) {
            return (
              <div key={match.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 opacity-70">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex-1 truncate text-slate-400">{match.homeTeamName}</span>
                  <span className="flex items-center gap-1.5 font-mono font-bold text-slate-400 px-3">
                    <Lock size={10} className="text-slate-600" />
                    {selected.replace('-', ' - ')}
                  </span>
                  <span className="flex-1 truncate text-right text-slate-400">{match.awayTeamName}</span>
                </div>
              </div>
            )
          }

          return (
            <div
              key={match.id}
              className={`bg-slate-900 border rounded-xl p-4 ${isPostponed ? 'border-orange-500/30' : 'border-slate-800'}`}
            >
              <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                <span className="flex-1 truncate">{match.homeTeamName}</span>
                {selected ? (
                  <span className="font-mono font-bold text-amber-400 px-3">{selected.replace('-', ' - ')}</span>
                ) : (
                  <span className="text-slate-600 px-3 text-xs">non scelto</span>
                )}
                <span className="flex-1 truncate text-right">{match.awayTeamName}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {VALID_VOLLEYBALL_SCORES.map(([h, a]) => {
                  const key = `${h}-${a}`
                  return (
                    <button
                      key={key}
                      onClick={() => select(match.id, key)}
                      className={`py-2.5 rounded-lg text-sm font-mono font-bold transition-colors ${
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
            </div>
          )
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mb-3">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {!allLocked && <button
        onClick={handleSaveAll}
        disabled={pendingCount === 0 || loading}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-colors ${
          done
            ? 'bg-green-500/20 text-green-400'
            : 'bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Salvataggio in corso…</>
        ) : done ? (
          <><Check size={16} /> {savedCount} pronostici salvati!</>
        ) : (
          `Conferma tutti (${pendingCount} pronostici)`
        )}
      </button>}
    </div>
  )
}
