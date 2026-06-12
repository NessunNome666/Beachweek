import { Shield } from 'lucide-react'
import { MATCHES, TEAMS, TOURNAMENTS } from '@/lib/mock-data'
import AdminMatchForm from './AdminMatchForm'

export default function AdminPartitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold mb-2 flex items-center gap-3">
        <Shield size={28} className="text-red-400" />
        Inserimento risultati
      </h1>
      <p className="text-slate-400 mb-8 text-sm">
        Clicca su una partita, inserisci il punteggio e salva. Le classifiche si aggiornano automaticamente.
      </p>

      {TOURNAMENTS.map((tournament) => {
        const tournamentMatches = MATCHES.filter((m) => m.tournament_id === tournament.id)
        if (tournamentMatches.length === 0) return null
        return (
          <section key={tournament.id} className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-amber-400">{tournament.name}</h2>
            <div className="space-y-3">
              {tournamentMatches.map((match) => {
                const homeTeam = TEAMS.find((t) => t.id === match.team_home_id)
                const awayTeam = TEAMS.find((t) => t.id === match.team_away_id)
                return (
                  <AdminMatchForm
                    key={match.id}
                    match={match}
                    homeTeamName={homeTeam?.name ?? 'Da definire'}
                    awayTeamName={awayTeam?.name ?? 'Da definire'}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
