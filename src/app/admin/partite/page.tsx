import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AdminMatchForm from './AdminMatchForm'

export const revalidate = 0

interface Tournament { id: string; name: string; slug: string }
interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null
  score_home: number | null; score_away: number | null
  status: string; court: string | null
}
interface Team { id: string; name: string }

export default async function AdminPartitePage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug').order('created_at')
  const { data: matchesRaw } = await sb.from('matches').select('id, tournament_id, phase, round, team_home_id, team_away_id, score_home, score_away, status, court').order('round')
  const { data: teamsRaw } = await sb.from('teams').select('id, name')

  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]

  if (!tournaments.length || !matches.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
          <Shield size={28} className="text-red-400" />
          Inserimento risultati
        </h1>
        <p className="text-slate-400">Nessuna partita trovata nel database. Esegui prima il seed dei dati.</p>
      </div>
    )
  }

  const teamsMap = Object.fromEntries((teams ?? []).map((t) => [t.id, t.name]))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-2 flex items-center gap-3">
        <Shield size={28} className="text-red-400" />
        Inserimento risultati
      </h1>
      <p className="text-slate-400 mb-8 text-sm">
        Clicca su una partita, inserisci il punteggio e salva. Le classifiche si aggiornano automaticamente.
      </p>

      {tournaments.map((tournament) => {
        const tournamentMatches = matches.filter((m) => m.tournament_id === tournament.id)
        if (tournamentMatches.length === 0) return null
        return (
          <section key={tournament.id} className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-amber-400">{tournament.name}</h2>
            <div className="space-y-3">
              {tournamentMatches.map((match) => (
                <AdminMatchForm
                  key={match.id}
                  match={match}
                  homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
                  awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}