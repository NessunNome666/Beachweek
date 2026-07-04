import { createClient } from '@/lib/supabase/server'
import { toGameDate, dayNumber } from '@/lib/game-date'
import AdminMatchForm from './AdminMatchForm'
import DayAccordion from '@/components/DayAccordion'

export const revalidate = 0

interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null
  score_home: number | null; score_away: number | null
  score_detail: string | null; status: string; court: string | null
  scheduled_at: string
}
interface Team { id: string; name: string }
interface Tournament { id: string; name: string; slug: string }

export default async function AdminPartitePage() {
  const supabase = await createClient()
  const sb = supabase

  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug').order('created_at')
  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, score_home, score_away, score_detail, status, court, scheduled_at')
    .order('scheduled_at')
    .order('round')
  const { data: teamsRaw } = await sb.from('teams').select('id, name')

  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]

  if (!matches.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold text-white mb-4">Inserisci risultati</h1>
        <p className="text-slate-400">Nessuna partita trovata nel database. Esegui prima il seed dei dati.</p>
      </div>
    )
  }

  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t.name]))
  const tournamentsMap = Object.fromEntries(tournaments.map((t) => [t.id, t]))

  // Un solo campo, partite in sequenza: "in corso ora" = la prima non ancora completata
  // in ordine cronologico (i match sono già ordinati per scheduled_at sopra).
  const nextMatchId = matches.find((m) => m.status !== 'completed')?.id ?? null

  // Raggruppa per giornata (stesso criterio di /partite)
  const grouped = new Map<string, Match[]>()
  for (const m of matches) {
    const dateKey = toGameDate(m.scheduled_at)
    if (!grouped.has(dateKey)) grouped.set(dateKey, [])
    grouped.get(dateKey)!.push(m)
  }
  const days = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
  const firstDate = days[0]?.[0] ?? null
  const todayKey = toGameDate(new Date().toISOString())

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <h1 className="text-2xl font-bold text-white mb-6">Inserisci risultati</h1>

      <div className="space-y-6">
        {days.map(([dateKey, dayMatches]) => {
          const dayIndex = firstDate ? dayNumber(dateKey, firstDate) : 1
          const isToday = dateKey === todayKey
          const isPast = dateKey < todayKey

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
                {dayMatches.map((match) => {
                  const tournament = tournamentsMap[match.tournament_id]
                  return (
                    <div key={match.id}>
                      {tournament && (
                        <p className="text-xs text-slate-500 mb-1 ml-1">{tournament.name}</p>
                      )}
                      <AdminMatchForm
                        match={match}
                        homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
                        awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
                        isNext={match.id === nextMatchId}
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

