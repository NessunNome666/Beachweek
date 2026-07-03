'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Team { id: string; name: string }

interface Props {
  tournamentId: string
  placement: 1 | 2 | 3
  teams: Team[]
  initialTeamId?: string
}

const PLACEMENT_LABEL: Record<number, string> = {
  1: '1° posto — Vincitore',
  2: '2° posto — Finalista',
  3: '3° posto',
}

const PLACEMENT_PLACEHOLDER: Record<number, string> = {
  1: '— Chi vincerà il torneo? —',
  2: '— Chi arriverà 2°? —',
  3: '— Chi arriverà 3°? —',
}

export default function WinnerPredictionForm({ tournamentId, placement, teams, initialTeamId }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(!!initialTeamId)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!selectedTeamId) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non sei autenticato.'); setLoading(false); return }

    const { error: dbError } = await supabase
      .from('predictions_winner')
      .upsert(
        { user_id: user.id, tournament_id: tournamentId, placement, predicted_team_id: selectedTeamId },
        { onConflict: 'user_id,tournament_id,placement' }
      )

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400">{PLACEMENT_LABEL[placement]}</p>
      <select
        value={selectedTeamId}
        onChange={(e) => { setSelectedTeamId(e.target.value); setSaved(false); setError('') }}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
      >
        <option value="">{PLACEMENT_PLACEHOLDER[placement]}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!selectedTeamId || loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white'
        }`}
      >
        {loading ? (
          <><Loader2 size={14} className="animate-spin" /> Salvataggio…</>
        ) : saved ? (
          <><Check size={14} /> Salvato — 5 pt in palio</>
        ) : (
          'Conferma'
        )}
      </button>
    </div>
  )
}
