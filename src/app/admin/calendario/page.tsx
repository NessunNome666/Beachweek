import { CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AdminCalendarioForm from './AdminCalendarioForm'

export const revalidate = 0

interface Tournament { id: string; name: string; slug: string }
interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null
  scheduled_at: string; status: string; court: string | null; notes: string | null
}
interface Team { id: string; name: string }

const PHASE_ORDER = ['girone', 'quarti', 'semifinale', 'terzo_posto', 'finale']
const PHASE_LABEL: Record<string, string> = {
  girone: 'Fase a Gironi',
  quarti: 'Quarti di finale',
  semifinale: 'Semifinali',
  terzo_posto: '3° Posto',
  finale: 'Finale',
}

export default async function AdminCalendarioPage() {
  const supabase = await createClient()
  const sb = supabase as any

  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug').order('created_at')
  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, scheduled_at, status, court, notes')
    .order('scheduled_at')
    .order('round')
  const { data: teamsRaw } = await sb.from('teams').select('id, name')

  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]

  if (!matches.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
          <CalendarDays size={28} className="text-amber-400" />
          Gestione Calendario
        </h1>
        <p className="text-slate-400">Nessuna partita trovata. Esegui prima il seed dei match su Supabase.</p>
      </div>
    )
  }

  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t.name]))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold flex items-center gap-3">
          <CalendarDays size={28} className="text-amber-400" />
          Gestione Calendario
        </h1>
      </div>
      <p className="text-slate-400 mb-8 text-sm">
        Clicca su una partita per modificare data, campo, stato o aggiungere una nota. Le modifiche sono visibili subito a tutti gli utenti.
      </p>

      {tournaments.map((tournament) => {
        const tournamentMatches = matches.filter((m) => m.tournament_id === tournament.id)
        if (!tournamentMatches.length) return null

        const phases = PHASE_ORDER.filter((p) => tournamentMatches.some((m) => m.phase === p))

        return (
          <section key={tournament.id} className="mb-12">
            <h2 className="text-lg font-bold mb-5 text-amber-400">{tournament.name}</h2>

            {phases.map((phase) => {
              const phaseMatches = tournamentMatches
                .filter((m) => m.phase === phase)
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

              return (
                <div key={phase} className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    {PHASE_LABEL[phase] ?? phase}
                  </h3>
                  <div className="space-y-2">
                    {phaseMatches.map((match) => (
                      <AdminCalendarioForm
                        key={match.id}
                        match={match}
                        homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
                        awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
