'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle, Plus, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  phase: string
  round: number
  score_home: number | null
  score_away: number | null
  score_detail: string | null
  status: string
  court: string | null
}

interface Props {
  match: Match
  homeTeamName: string
  awayTeamName: string
}

type SetScore = { home: string; away: string }

function parseDetail(detail: string | null): SetScore[] {
  if (!detail) return [{ home: '', away: '' }, { home: '', away: '' }]
  return detail.split(',').map((s) => {
    const [h, a] = s.split('-')
    return { home: h ?? '', away: a ?? '' }
  })
}

function computeResult(sets: SetScore[]): { scoreHome: number; scoreAway: number } | null {
  let h = 0, a = 0
  for (const s of sets) {
    const hp = parseInt(s.home), ap = parseInt(s.away)
    if (isNaN(hp) || isNaN(ap)) return null
    if (hp > ap) h++; else if (ap > hp) a++
  }
  return { scoreHome: h, scoreAway: a }
}

export default function AdminMatchForm({ match, homeTeamName, awayTeamName }: Props) {
  const [sets, setSets] = useState<SetScore[]>(() => parseDetail(match.score_detail))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(match.status === 'completed')
  const [error, setError] = useState('')

  const result = computeResult(sets)
  const allFilled = sets.every((s) => s.home !== '' && s.away !== '' && !isNaN(+s.home) && !isNaN(+s.away))
  const canSave = allFilled && result !== null

  function updateSet(i: number, field: 'home' | 'away', val: string) {
    setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
    setSaved(false)
    setError('')
  }

  function addSet() {
    if (sets.length < 3) setSets((prev) => [...prev, { home: '', away: '' }])
  }

  function removeSet() {
    if (sets.length > 2) setSets((prev) => prev.slice(0, -1))
  }

  async function handleSave() {
    if (!canSave || !result) return
    setLoading(true)
    setError('')

    const scoreDetail = sets.map((s) => `${s.home}-${s.away}`).join(',')
    const supabase = createClient()

    const { error: dbError } = await (supabase as any)
      .from('matches')
      .update({
        score_home: result.scoreHome,
        score_away: result.scoreAway,
        score_detail: scoreDetail,
        status: 'completed',
      })
      .eq('id', match.id)

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
    }
  }

  const phaseLabels: Record<string, string> = {
    girone: 'Girone', quarti: 'Quarti', semifinale: 'Semifinale',
    finale: 'Finale', terzo_posto: '3° Posto',
  }

  return (
    <div className={`bg-slate-900 border rounded-xl p-4 ${saved ? 'border-green-800/50' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>{phaseLabels[match.phase] ?? match.phase} — Round {match.round}</span>
        {result && allFilled && (
          <span className="font-mono font-bold text-amber-400">
            {result.scoreHome}-{result.scoreAway}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="font-semibold flex-1 truncate">{homeTeamName}</span>
        <span className="text-slate-500 text-sm">vs</span>
        <span className="font-semibold flex-1 truncate text-right">{awayTeamName}</span>
      </div>

      <div className="space-y-2 mb-3">
        {sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-10 shrink-0">Set {i + 1}</span>
            <input
              type="number"
              min={0}
              max={30}
              value={s.home}
              onChange={(e) => updateSet(i, 'home', e.target.value)}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <span className="text-slate-600 text-sm">-</span>
            <input
              type="number"
              min={0}
              max={30}
              value={s.away}
              onChange={(e) => updateSet(i, 'away', e.target.value)}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        {sets.length < 3 && (
          <button
            onClick={addSet}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <Plus size={12} /> Aggiungi 3° set
          </button>
        )}
        {sets.length > 2 && (
          <button
            onClick={removeSet}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <Minus size={12} /> Rimuovi 3° set
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave || loading}
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
