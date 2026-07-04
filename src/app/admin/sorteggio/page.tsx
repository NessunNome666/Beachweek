import { createClient } from '@/lib/supabase/server'
import { sortGroup } from '@/lib/qualification'
import type { StandingRow } from '@/lib/qualification'
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
  const sb = await createClient()

  const { data: tournamentsRaw } = await sb
    .from('tournaments')
    .select('id, name, slug')
    .order('created_at')

  const { data: teamsRaw } = await sb
    .from('teams')
    .select('id, name, tournament_id, group_name')
    .order('name')

  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, scheduled_at')
    .in('phase', ['ottavi', 'quarti', 'semifinale'])
    .order('scheduled_at')

  const { data: standingsRaw } = await sb.from('standings_view').select('*')

  const tournaments = (tournamentsRaw ?? []) as { id: string; name: string; slug: string }[]
  const teams = (teamsRaw ?? []) as { id: string; name: string; tournament_id: string; group_name: string | null }[]
  const matches = (matchesRaw ?? []) as {
    id: string; tournament_id: string; phase: string; round: number
    team_home_id: string | null; team_away_id: string | null; scheduled_at: string
  }[]

  const standings: StandingRow[] = (standingsRaw ?? []).map((r) => ({
    team_id: r.team_id ?? '',
    team_name: r.team_name ?? '',
    group_name: r.group_name ?? '',
    tournament_id: r.tournament_id ?? '',
    matches_played: r.matches_played ?? 0,
    wins: r.wins ?? 0,
    losses: r.losses ?? 0,
    sets_won: r.sets_won ?? 0,
    sets_lost: r.sets_lost ?? 0,
    points_scored: r.points_scored ?? 0,
    points_conceded: r.points_conceded ?? 0,
    points: r.points ?? 0,
  }))

  // Etichetta "Girone A · 1°" per ogni squadra, per dare contesto di qualificazione nel dropdown
  const teamLabels: Record<string, string> = {}
  for (const t of tournaments) {
    const tGroups = [...new Set(
      teams.filter((tm) => tm.tournament_id === t.id).map((tm) => tm.group_name).filter(Boolean)
    )] as string[]
    for (const g of tGroups) {
      const sorted = sortGroup(standings.filter((s) => s.tournament_id === t.id && s.group_name === g))
      sorted.forEach((row, i) => { teamLabels[row.team_id] = `${g} · ${i + 1}°` })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Sorteggi</h1>

      <div className="space-y-10">
        {tournaments.map((t) => {
          const allTournamentElimMatches = matches.filter((m) => m.tournament_id === t.id)
          const phases = allTournamentElimMatches.map((m) => m.phase)
          const firstPhase = PHASE_ORDER.find((p) => phases.includes(p))
          if (!firstPhase) return null

          const tournamentMatches = allTournamentElimMatches.filter((m) => m.phase === firstPhase)
          if (tournamentMatches.length === 0) return null

          const tournamentTeams = teams.filter((tm) => tm.tournament_id === t.id)

          // Squadre già assegnate a un altro slot della stessa fase — da escludere per evitare doppioni
          const usedTeamIds = new Set(
            tournamentMatches.flatMap((m) => [m.team_home_id, m.team_away_id]).filter(Boolean) as string[]
          )

          return (
            <section key={t.id}>
              <h2 className="text-lg font-bold text-orange-400 mb-1">{t.name}</h2>
              <p className="text-xs text-slate-500 mb-4">{PHASE_LABEL[firstPhase]}</p>
              <div className="space-y-3">
                {tournamentMatches.map((m, i) => {
                  const excludeIds = [...usedTeamIds].filter(
                    (id) => id !== m.team_home_id && id !== m.team_away_id
                  )
                  return (
                    <BracketSlotForm
                      key={m.id}
                      matchId={m.id}
                      slotLabel={`Slot ${i + 1}`}
                      teams={tournamentTeams}
                      initialHomeId={m.team_home_id}
                      initialAwayId={m.team_away_id}
                      excludeIds={excludeIds}
                      teamLabels={teamLabels}
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
