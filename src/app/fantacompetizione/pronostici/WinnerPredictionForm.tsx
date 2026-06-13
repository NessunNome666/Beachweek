'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Team { id: string; name: string }

interface Props {
  tournamentId: string
  teams: Team[]
  initialTeamId?: string
}

export default function WinnerPredictionForm({ tournamentId, teams, initialTeamId }: Props) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('predictions_winner')
      .upsert(
        { user_id: user.id, tournament_id: tournamentId, predicted_team_id: selectedTeamId },
        { onConflict: 'user_id,tournament_id' }
      )

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={selectedTeamId}
        onChange={(e) => { setSelectedTeamId(e.target.value); setSaved(false); setError('') }}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors"
      >
        <option value="">— Seleziona la squadra vincitrice —</option>
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
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
          'Conferma pronostico vincitore'
        )}
      </button>
    </div>
  )
}