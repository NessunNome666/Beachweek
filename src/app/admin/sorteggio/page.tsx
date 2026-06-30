import { createClient } from '@/lib/supabase/server'
import BracketSlotForm from './BracketSlotForm'

export const revalidate = 0

const PHASE_LABEL: Record<string, string> = {
  ottavi: 'Ottavi di finale',
  quarti: 'Quarti di finale',
  semifinale: 'Semifinali',
}

// Ordine delle fasi per rilevamento dinamico della prima fase eliminatoria
const PHASE_ORDER = ['ottavi', 'quarti', 'semifinale']

export default async function SorteggioPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const { data: tournamentsRaw } = await sb
    .from('tournaments')
    .select('id, name, slug')
    .order('created_at')

  const { data: teamsRaw } = await sb
    .from('teams')
    .select('id, name, tournament_id')
    .order('name')

  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, scheduled_at')
    .in('phase', ['ottavi', 'quarti', 'semifinale'])
    .order('scheduled_at')

  const tournaments = (tournamentsRaw ?? []) as { id: string; name: string; slug: string }[]
  const teams = (teamsRaw ?? []) as { id: string; name: string; tournament_id: string }[]
  const matches = (matchesRaw ?? []) as {
    id: string; tournament_id: string; phase: string; round: number
    team_home_id: string | null; team_away_id: string | null; scheduled_at: string
  }[]

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Sorteggi</h1>
      <p className="text-slate-400 mb-10 text-sm">
        Inserisci gli accoppiamenti del primo turno eliminatorio dopo il sorteggio dal vivo.
        I turni successivi si popolano automaticamente man mano che i risultati vengono inseriti.
      </p>

      <div className="space-y-10">
        {tournaments.map((t) => {
          const allTournamentElimMatches = matches.filter((m) => m.tournament_id === t.id)
          const phases = allTournamentElimMatches.map((m) => m.phase)
          const firstPhase = PHASE_ORDER.find((p) => phases.includes(p))
          if (!firstPhase) return null

          const tournamentMatches = allTournamentElimMatches.filter((m) => m.phase === firstPhase)
          if (tournamentMatches.length === 0) return null

          const tournamentTeams = teams.filter((tm) => tm.tournament_id === t.id)

          return (
            <section key={t.id}>
              <h2 className="text-lg font-bold text-orange-400 mb-1">{t.name}</h2>
              <p className="text-xs text-slate-500 mb-4">{PHASE_LABEL[firstPhase]}</p>
              <div className="space-y-3">
                {tournamentMatches.map((m, i) => {
                  const homeTeam = tournamentTeams.find((tm) => tm.id === m.team_home_id)
                  const awayTeam = tournamentTeams.find((tm) => tm.id === m.team_away_id)
                  const isAssigned = !!m.team_home_id && !!m.team_away_id

                  if (isAssigned) {
                    return (
                      <div
                        key={m.id}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between text-sm"
                      >
                        <span className="text-xs text-slate-500 w-12">Slot {i + 1}</span>
                        <span className="flex-1 font-semibold">{homeTeam?.name ?? '—'}</span>
                        <span className="text-slate-500 px-3 text-xs">vs</span>
                        <span className="flex-1 font-semibold text-right">{awayTeam?.name ?? '—'}</span>
                        <span className="ml-4 text-xs text-green-400 font-semibold">✓</span>
                      </div>
                    )
                  }

                  return (
                    <BracketSlotForm
                      key={m.id}
                      matchId={m.id}
                      slotLabel={`Slot ${i + 1}`}
                      teams={tournamentTeams}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
