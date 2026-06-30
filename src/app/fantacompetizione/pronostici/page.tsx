import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PredictionForm from './PredictionForm'
import PredictionsBatchForm from './PredictionsBatchForm'
import WinnerPredictionForm from './WinnerPredictionForm'
import ResultsCollapse from './ResultsCollapse'

export const revalidate = 0

interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null; status: string
  score_home: number | null; score_away: number | null; scheduled_at: string
}
interface Team { id: string; name: string; tournament_id: string }
interface Tournament { id: string; name: string; slug: string; predictions_locked: boolean }
interface PredictionMatch { match_id: string; predicted_home: number; predicted_away: number }
interface PredictionWinner { tournament_id: string; placement: number; predicted_team_id: string }

export default async function PronosticiPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, status, score_home, score_away, scheduled_at')
    .eq('phase', 'girone')
    .order('scheduled_at')

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
    const { data: winnerPredsRaw } = await sb.from('predictions_winner').select('tournament_id, placement, predicted_team_id').eq('user_id', user.id)
    existingPredictions = (predsRaw ?? []) as PredictionMatch[]
    existingWinnerPredictions = (winnerPredsRaw ?? []) as PredictionWinner[]
  }

  const predMap = Object.fromEntries(
    existingPredictions.map((p) => [p.match_id, `${p.predicted_home}-${p.predicted_away}`])
  )
  // Key: "tournamentId-placement"
  const winnerPredMap = Object.fromEntries(
    existingWinnerPredictions.map((p) => [`${p.tournament_id}-${p.placement}`, p.predicted_team_id])
  )

  const completedMatches = matches.filter((m) => m.status === 'completed')

  // Confine giornata a 06:00 Roma â€” partite dopo mezzanotte appartengono al giorno precedente
  const toGameDate = (iso: string) =>
    new Date(new Date(iso).getTime() - 6 * 60 * 60 * 1000)
      .toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })

  // Solo partite ancora schedulabili: in_progress e completed non si possono pronosticare
  // Esclude anche partite con orario giÃ  passato (anche se status non Ã¨ ancora aggiornato)
  const now = new Date()
  const allPending = matches.filter((m) => m.status === 'scheduled' && new Date(m.scheduled_at) > now)
  const firstGameDate = matches.length > 0 ? toGameDate(matches[0].scheduled_at) : null
  const nextGameDay = allPending.length > 0 ? toGameDate(allPending[0].scheduled_at) : null
  const pendingMatches = nextGameDay
    ? allPending.filter((m) => toGameDate(m.scheduled_at) === nextGameDay)
    : []
  const nextDayIndex = firstGameDate && nextGameDay
    ? Math.round((new Date(nextGameDay).getTime() - new Date(firstGameDate).getTime()) / 86400000) + 1
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-4">I miei pronostici</h1>

      {/* Completed matches â€” collapsible results */}
      {completedMatches.length > 0 && (
        <ResultsCollapse count={completedMatches.length}>
          {completedMatches.map((match) => (
            <PredictionForm
              key={match.id}
              matchId={match.id}
              homeTeamName={match.team_home_id ? (teamsMap[match.team_home_id] ?? 'Da definire') : 'Da definire'}
              awayTeamName={match.team_away_id ? (teamsMap[match.team_away_id] ?? 'Da definire') : 'Da definire'}
              initialPrediction={predMap[match.id]}
              matchStatus={match.status}
              actualHome={match.score_home}
              actualAway={match.score_away}
            />
          ))}
        </ResultsCollapse>
      )}

      {/* Pending matches â€” batch form, solo il prossimo giorno di gioco */}
      {pendingMatches.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-lg font-bold text-orange-400 mb-4">
            Partite da pronosticare{nextDayIndex !== null ? ` — Giorno ${nextDayIndex}` : ''}
          </h2>
          <PredictionsBatchForm
            matches={pendingMatches.map((m) => ({
              id: m.id,
              homeTeamName: m.team_home_id ? (teamsMap[m.team_home_id] ?? 'Da definire') : 'Da definire',
              awayTeamName: m.team_away_id ? (teamsMap[m.team_away_id] ?? 'Da definire') : 'Da definire',
              matchStatus: m.status,
              initialPrediction: predMap[m.id],
            }))}
          />
        </section>
      ) : completedMatches.length === 0 ? (
        <div className="text-center py-16 text-slate-500 mb-12">
          <p>Nessuna partita in programma al momento.</p>
        </div>
      ) : null}

      {/* Winner / placement predictions */}
      <section>
        <h2 className="text-lg font-bold text-orange-400 mb-1">
          Pronostica il podio finale
        </h2>
        <p className=”text-xs text-slate-500 mb-5”>5 pt per ogni piazzamento indovinato — si bloccano all&apos;inizio dell&apos;eliminazione</p>
        <div className="space-y-6">
          {tournaments.map((t) => {
            const tournamentTeams = teams.filter((team) => team.tournament_id === t.id)
            return (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
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
                  <div className="space-y-5">
                    {([1, 2, 3] as const).map((placement) => (
                      <WinnerPredictionForm
                        key={placement}
                        tournamentId={t.id}
                        placement={placement}
                        teams={tournamentTeams}
                        initialTeamId={winnerPredMap[`${t.id}-${placement}`]}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

