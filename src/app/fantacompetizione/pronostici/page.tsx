import { Star, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PredictionForm from './PredictionForm'
import WinnerPredictionForm from './WinnerPredictionForm'

export const revalidate = 0

interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null; status: string
}
interface Team { id: string; name: string; tournament_id: string }
interface Tournament { id: string; name: string; slug: string; predictions_locked: boolean }
interface PredictionMatch { match_id: string; predicted_home: number; predicted_away: number }
interface PredictionWinner { tournament_id: string; predicted_team_id: string }

export default async function PronosticiPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  const { data: matchesRaw } = await sb.from('matches').select('id, tournament_id, phase, round, team_home_id, team_away_id, status').eq('status', 'scheduled').eq('phase', 'girone')
  const { data: teamsRaw } = await sb.from('teams').select('id, name, tournament_id')
  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug, predictions_locked').order('created_at')

  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]
  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t.name]))

  let existingPredictions: PredictionMatch[] = []
  let existingWinnerPredictions: PredictionWinner[] = []

  if (user) {
    const { data: predsRaw } = await sb.from('predictions_match').select('match_id, predicted_home, predicted_away').eq('user_id', user.id)
    const { data: winnerPredsRaw } = await sb.from('predictions_winner').select('tournament_id, predicted_team_id').eq('user_id', user.id)
    existingPredictions = (predsRaw ?? []) as PredictionMatch[]
    existingWinnerPredictions = (winnerPredsRaw ?? []) as PredictionWinner[]
  }

  const predMap = Object.fromEntries(
    existingPredictions.map((p) => [p.match_id, `${p.predicted_home}-${p.predicted_away}`])
  )
  const winnerPredMap = Object.fromEntries(
    existingWinnerPredictions.map((p) => [p.tournament_id, p.predicted_team_id])
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Star className="text-amber-400" size={32} />
        I miei pronostici
      </h1>
      <p className="text-slate-400 mb-10">Inserisci i punteggi che prevedi per le partite di oggi.</p>

      {matches.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Partite in programma</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <PredictionForm
                key={match.id}
                matchId={match.id}
                homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
                awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
                initialPrediction={predMap[match.id]}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-16 text-slate-500 mb-12">
          <Star size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna partita in programma al momento.</p>
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Pronostica il vincitore finale
          <span className="text-xs text-slate-500 font-normal">(si bloccano all&apos;inizio dell&apos;eliminazione)</span>
        </h2>
        <div className="space-y-4">
          {tournaments.map((t) => (
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
                <WinnerPredictionForm
                  tournamentId={t.id}
                  teams={teams.filter((team) => team.tournament_id === t.id)}
                  initialTeamId={winnerPredMap[t.id]}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}