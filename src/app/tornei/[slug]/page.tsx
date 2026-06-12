import { notFound } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { TOURNAMENTS, TEAMS, MATCHES, STANDINGS } from '@/lib/mock-data'
import GironeTable from '@/components/GironeTable'
import MatchCard from '@/components/MatchCard'

export default async function TorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const torneo = TOURNAMENTS.find((t) => t.slug === slug)
  if (!torneo) notFound()

  const teams = TEAMS.filter((t) => t.tournament_id === torneo.id)
  const matches = MATCHES.filter((m) => m.tournament_id === torneo.id)
  const standings = STANDINGS.filter((s) => s.tournament_id === torneo.id)

  const groups = [...new Set(teams.map((t) => t.group_name).filter(Boolean))] as string[]

  const gironeMatches = matches.filter((m) => m.phase === 'girone')
  const eliminazioneMatches = matches.filter((m) => m.phase !== 'girone')

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Trophy size={36} className="text-amber-400 shrink-0" />
        <div>
          <h1 className="text-3xl font-extrabold">{torneo.name}</h1>
          <p className="text-slate-400 mt-1">{torneo.description}</p>
        </div>
      </div>

      {/* Fase gironi */}
      {groups.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 text-amber-400 uppercase tracking-wide text-sm">
            Fase a Gironi
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {groups.map((group) => {
              const groupStandings = standings.filter((s) => s.group_name === group)
              const groupMatches = gironeMatches.filter((m) => {
                const homeTeam = teams.find((t) => t.id === m.team_home_id)
                return homeTeam?.group_name === group
              })
              return (
                <div key={group} className="space-y-4">
                  <h3 className="font-bold text-lg">{group}</h3>
                  <GironeTable standings={groupStandings} />
                  <div className="space-y-2">
                    {groupMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        homeTeam={teams.find((t) => t.id === m.team_home_id)}
                        awayTeam={teams.find((t) => t.id === m.team_away_id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Fase eliminazione */}
      {eliminazioneMatches.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6 text-amber-400 uppercase tracking-wide text-sm">
            Fase a Eliminazione
          </h2>
          <div className="space-y-3">
            {eliminazioneMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                homeTeam={teams.find((t) => t.id === m.team_home_id)}
                awayTeam={teams.find((t) => t.id === m.team_away_id)}
              />
            ))}
          </div>
        </section>
      )}

      {groups.length === 0 && eliminazioneMatches.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p>Il calendario non è ancora disponibile.</p>
        </div>
      )}
    </div>
  )
}
