import { createClient } from '@/lib/supabase/server'
import AdminCalendarioForm from './AdminCalendarioForm'
import DayAccordion from '@/components/DayAccordion'

export const revalidate = 0

interface Tournament { id: string; name: string; slug: string }
interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null
  scheduled_at: string; status: string; court: string | null; notes: string | null
}
interface Team { id: string; name: string }

function toGameDate(iso: string): string {
  return new Date(new Date(iso).getTime() - 6 * 60 * 60 * 1000)
    .toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
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
        <h1 className="text-2xl font-bold text-white mb-4">Gestione Calendario</h1>
        <p className="text-slate-400">Nessuna partita trovata. Esegui prima il seed dei match su Supabase.</p>
      </div>
    )
  }

  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t.name]))
  const tournamentsMap = Object.fromEntries(tournaments.map((t) => [t.id, t]))

  // Raggruppa per giornata (stesso criterio della pagina pubblica /partite)
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Gestione Calendario</h1>
      <p className="text-slate-400 mb-8 text-sm">
        Clicca su una partita per modificare data, orario, stato o aggiungere una nota. Le modifiche sono visibili subito.
      </p>

      <div className="space-y-6">
        {days.map(([dateKey, dayMatches]) => {
          const dayIndex = firstDate
            ? Math.round((new Date(dateKey).getTime() - new Date(firstDate).getTime()) / 86400000) + 1
            : 1
          const isToday = dateKey === todayKey
          const isPast = dateKey < todayKey
          return (
            <DayAccordion
              key={dateKey}
              dayLabel={`Giorno ${dayIndex}`}
              isToday={isToday}
              isPast={isPast}
              defaultOpen={!isPast}
            >
              <div className="space-y-2 mb-4">
                {dayMatches.map((match) => {
                  const tournament = tournamentsMap[match.tournament_id]
                  return (
                    <div key={match.id}>
                      {tournament && (
                        <p className="text-xs text-slate-500 mb-1 ml-1">{tournament.name}</p>
                      )}
                      <AdminCalendarioForm
                        match={match}
                        homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
                        awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
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
