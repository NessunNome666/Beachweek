import { Star, Lock } from 'lucide-react'
import { MATCHES, TEAMS, TOURNAMENTS } from '@/lib/mock-data'
import PredictionForm from './PredictionForm'

export default function PronosticiPage() {
  const todayMatches = MATCHES.filter((m) => m.status === 'scheduled')
  const teams = TEAMS

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Star className="text-amber-400" size={32} />
        I miei pronostici
      </h1>
      <p className="text-slate-400 mb-10">Inserisci i punteggi che prevedi per le partite di oggi.</p>

      {/* Partite del giorno */}
      {todayMatches.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Partite di oggi</h2>
          <div className="space-y-4">
            {todayMatches.map((match) => {
              const homeTeam = teams.find((t) => t.id === match.team_home_id)
              const awayTeam = teams.find((t) => t.id === match.team_away_id)
              return (
                <PredictionForm
                  key={match.id}
                  matchId={match.id}
                  homeTeamName={homeTeam?.name ?? 'Da definire'}
                  awayTeamName={awayTeam?.name ?? 'Da definire'}
                />
              )
            })}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 text-slate-500 mb-12">
          <Star size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna partita in programma oggi.</p>
        </div>
      )}

      {/* Vincitori finali */}
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Pronostica il vincitore finale
          <span className="text-xs text-slate-500 font-normal">(si bloccano all&apos;inizio dell&apos;eliminazione)</span>
        </h2>
        <div className="space-y-4">
          {TOURNAMENTS.map((t) => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{t.name}</h3>
                {t.predictions_locked && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                    <Lock size={10} />
                    Bloccato
                  </span>
                )}
              </div>
              {t.predictions_locked ? (
                <p className="text-slate-500 text-sm">I pronostici per questo torneo sono chiusi.</p>
              ) : (
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors">
                  <option value="">— Seleziona la squadra vincitrice —</option>
                  {TEAMS.filter((team) => team.tournament_id === t.id).map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
        <button className="mt-6 w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-full hover:bg-amber-300 transition-colors">
          Salva tutti i pronostici
        </button>
      </section>
    </div>
  )
}
