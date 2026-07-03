import { createClient } from '@/lib/supabase/server'
import { toGameDate, dayNumber } from '@/lib/game-date'
import MatchCard from '@/components/MatchCard'
import DayAccordion from '@/components/DayAccordion'

export const revalidate = 0

interface Match {
  id: string
  tournament_id: string
  phase: string
  round: number
  team_home_id: string | null
  team_away_id: string | null
  score_home: number | null
  score_away: number | null
  score_detail: string | null
  scheduled_at: string
  status: string
  court: string | null
  notes: string | null
}
interface Team { id: string; name: string }
interface Tournament { id: string; name: string; slug: string }

export default async function PartitePage() {
  const sb = await createClient()

  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, score_home, score_away, score_detail, scheduled_at, status, court, notes')
    .order('scheduled_at')

  const { data: teamsRaw } = await sb.from('teams').select('id, name')
  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug')

  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]
  const tournaments = (tournamentsRaw ?? []) as Tournament[]

  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, { id: t.id, name: t.name }]))
  const tournamentsMap = Object.fromEntries(tournaments.map((t) => [t.id, t]))

  // Group by game date
  const grouped = new Map<string, { dateKey: string; matches: Match[] }>()
  for (const m of matches) {
    const dateKey = toGameDate(m.scheduled_at)
    if (!grouped.has(dateKey)) grouped.set(dateKey, { dateKey, matches: [] })
    grouped.get(dateKey)!.matches.push(m)
  }

  const groups = Array.from(grouped.values())
  const firstGameDate = groups.length > 0 ? groups[0].dateKey : null
  const todayGameDate = toGameDate(new Date().toISOString())

  if (groups.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-slate-500">
        <p>Nessuna partita in calendario al momento.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-4">Calendario partite</h1>

      <div className="space-y-10">
        {groups.map(({ dateKey, matches: dayMatches }) => {
          const dayIndex = dayNumber(dateKey, firstGameDate!)
          const isToday = dateKey === todayGameDate
          const isPast = dateKey < todayGameDate

          // Filtra partite eliminazione senza squadre reali
          const visibleMatches = dayMatches.filter(
            (m) => m.phase === 'girone' || (m.team_home_id && m.team_away_id)
          )
          if (visibleMatches.length === 0) return null

          return (
            <DayAccordion
              key={dateKey}
              dayLabel={`Giorno ${dayIndex}`}
              isToday={isToday}
              isPast={isPast}
              defaultOpen={!isPast}
              badge={isToday ? (
                <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  Oggi
                </span>
              ) : undefined}
            >
              <div className="space-y-3 mb-4">
                {visibleMatches.map((match) => {
                  const tournament = tournamentsMap[match.tournament_id]
                  return (
                    <div key={match.id}>
                      {tournament && (
                        <p className="text-xs text-slate-500 mb-1 ml-1">{tournament.name}</p>
                      )}
                      <MatchCard
                        match={match}
                        homeTeam={match.team_home_id ? teamsMap[match.team_home_id] : undefined}
                        awayTeam={match.team_away_id ? teamsMap[match.team_away_id] : undefined}
                      />
                    </div>
                  )
                })}
              </div>
            </DayAccordion>
          )
        })}
      </div>
    </div>
  )
}

