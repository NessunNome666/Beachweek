'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Team { id: string; name: string }

interface Props {
  matchId: string
  slotLabel: string
  teams: Team[]
}

export default function BracketSlotForm({ matchId, slotLabel, teams }: Props) {
  const [homeId, setHomeId] = useState('')
  const [awayId, setAwayId] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!homeId || !awayId) { setError('Seleziona entrambe le squadre.'); return }
    if (homeId === awayId) { setError('Le due squadre devono essere diverse.'); return }
    setLoading(true)
    setError('')
    const { error: dbError } = await createClient()
      .from('matches')
      .update({ team_home_id: homeId, team_away_id: awayId })
      .eq('id', matchId)
    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setDone(true)
    }
  }

  if (done) {
    const home = teams.find((t) => t.id === homeId)
    const away = teams.find((t) => t.id === awayId)
    return (
      <div className="bg-slate-900 border border-green-700/40 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-xs text-slate-500 w-12">{slotLabel}</span>
        <span className="flex-1 font-semibold">{home?.name}</span>
        <span className="text-slate-500 px-3 text-xs">vs</span>
        <span className="flex-1 font-semibold text-right">{away?.name}</span>
        <span className="ml-4 text-xs text-green-400 font-semibold">✓</span>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-500 mb-3 font-semibold">{slotLabel}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
        <select
          value={homeId}
          onChange={(e) => { setHomeId(e.target.value); setError('') }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white w-full"
        >
          <option value="">— Casa —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === awayId}>{t.name}</option>
          ))}
        </select>
        <span className="text-slate-600 text-xs px-1">vs</span>
        <select
          value={awayId}
          onChange={(e) => { setAwayId(e.target.value); setError('') }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white w-full"
        >
          <option value="">— Ospite —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === homeId}>{t.name}</option>
          ))}
        </select>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mb-2">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={!homeId || !awayId || loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <><Loader2 size={14} className="animate-spin" /> Salvataggio…</> : <><Check size={14} /> Conferma accoppiamento</>}
      </button>
    </div>
  )
}
