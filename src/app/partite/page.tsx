import { CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import MatchCard from '@/components/MatchCard'

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
  scheduled_at: string
  status: string
  court: string | null
  notes: string | null
}
interface Team { id: string; name: string }
interface Tournament { id: string; name: string; slug: string }

function localDateKey(isoString: string): string {
  // Group by Italian date (CEST = UTC+2 in summer)
  return new Date(isoString).toLocaleDateString('it-IT', {
    timeZone: 'Europe/Rome',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function isoToDateOnly(isoString: string): string {
  // Returns "YYYY-MM-DD" in Rome timezone for sorting
  return new Date(isoString).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
}

export default async function PartitePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, score_home, score_away, scheduled_at, status, court, notes')
    .order('scheduled_at')

  const { data: teamsRaw } = await sb.from('teams').select('id, name')
  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug')

  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]
  const tournaments = (tournamentsRaw ?? []) as Tournament[]

  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, { id: t.id, name: t.name }]))
  const tournamentsMap = Object.fromEntries(tournaments.map((t) => [t.id, t]))

  // Group matches by date
  const grouped = new Map<string, { label: string; dateKey: string; matches: Match[] }>()
  for (const m of matches) {
    const dateKey = isoToDateOnly(m.scheduled_at)
    const label = localDateKey(m.scheduled_at)
    if (!grouped.has(dateKey)) grouped.set(dateKey, { label, dateKey, matches: [] })
    grouped.get(dateKey)!.matches.push(m)
  }

  const today = isoToDateOnly(new Date().toISOString())
  const groups = Array.from(grouped.values())

  if (groups.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
        <p>Nessuna partita in calendario al momento.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
        <CalendarDays className="text-orange-400" size={32} />
        Calendario partite
      </h1>
      <p className="text-slate-400 mb-10">Tutte le partite dei tornei, in ordine cronologico.</p>

      <div className="space-y-10">
        {groups.map(({ label, dateKey, matches: dayMatches }) => {
          const isToday = dateKey === today
          const isPast = dateKey < today
          return (
            <section key={dateKey}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className={`text-base font-bold capitalize ${isToday ? 'text-orange-400' : isPast ? 'text-slate-600' : 'text-white'}`}>
                  {label}
                </h2>
                {isToday && (
                  <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                    Oggi
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {dayMatches.map((match) => {
                  const tournament = tournamentsMap[match.tournament_id]
                  return (
                    <div key={match.id}>
                      {tournament && (
                        <p className="text-xs text-slate-600 mb-1 ml-1">{tournament.name}</p>
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
            </section>
          )
        })}
      </div>
    </div>
  )
}
