import { Lock, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { toGameDate, dayNumber } from '@/lib/game-date'
import PredictionForm from './PredictionForm'
import PredictionsDeck from './PredictionsDeck'
import WinnerPredictionForm from './WinnerPredictionForm'
import WinnerPredictionResult from './WinnerPredictionResult'
import ResultsCollapse from './ResultsCollapse'
import NotificationOptIn from '@/components/NotificationOptIn'
import { PlayersToggle } from './PlayersVisibility'

export const revalidate = 0

interface Match {
  id: string; tournament_id: string; phase: string; round: number
  team_home_id: string | null; team_away_id: string | null; status: string
  score_home: number | null; score_away: number | null; scheduled_at: string
}
interface Team { id: string; name: string; tournament_id: string; players: string[] | null }
interface Tournament { id: string; name: string; slug: string; predictions_locked: boolean; status: string }
interface PredictionMatch { match_id: string; predicted_home: number; predicted_away: number }
interface PredictionWinner { tournament_id: string; placement: number; predicted_team_id: string; points_awarded: number | null }

const PHASE_LABEL: Record<string, string> = {
  ottavi: 'Ottavi', quarti: 'Quarti', semifinale: 'Semifinale',
  finale: 'Finale', terzo_posto: '3° Posto',
}

// Etichetta corta del torneo per la card del deck: nel deck convivono partite di tornei
// diversi (stessa serata, unico campo), quindi serve dire a quale torneo si riferisce.
// Chiave = slug (stabile nel DB); fallback al nome esteso se lo slug non è mappato.
const TOURNAMENT_SHORT: Record<string, string> = {
  'beach-volley-amatoriale': 'Amatoriale',
  'beach-volley-pro': 'Pro',
  'foot-volley-2v2': 'Foot Volley',
}

export default async function PronosticiPage() {
  const supabase = await createClient()
  const sb = supabase

  const { data: { user } } = await supabase.auth.getUser()

  // Tutte le fasi: anche l'eliminazione è pronosticabile una volta assegnate le squadre
  const { data: matchesRaw } = await sb
    .from('matches')
    .select('id, tournament_id, phase, round, team_home_id, team_away_id, status, score_home, score_away, scheduled_at')
    .order('scheduled_at')

  const { data: teamsRaw } = await sb.from('teams').select('id, name, tournament_id, players')
  const { data: tournamentsRaw } = await sb.from('tournaments').select('id, name, slug, predictions_locked, status').order('created_at')

  const matches = (matchesRaw ?? []) as Match[]
  const teams = (teamsRaw ?? []) as Team[]
  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const teamsMap = Object.fromEntries(teams.map((t) => [t.id, t.name]))
  const playersMap = Object.fromEntries(teams.map((t) => [t.id, t.players ?? []]))
  const tournamentLabelMap = Object.fromEntries(
    tournaments.map((t) => [t.id, TOURNAMENT_SHORT[t.slug] ?? t.name])
  )

  let existingPredictions: PredictionMatch[] = []
  let existingWinnerPredictions: PredictionWinner[] = []

  if (user) {
    const { data: predsRaw } = await sb.from('predictions_match').select('match_id, predicted_home, predicted_away').eq('user_id', user.id)
    const { data: winnerPredsRaw } = await sb.from('predictions_winner').select('tournament_id, placement, predicted_team_id, points_awarded').eq('user_id', user.id)
    existingPredictions = (predsRaw ?? []) as PredictionMatch[]
    existingWinnerPredictions = (winnerPredsRaw ?? []) as PredictionWinner[]
  }

  const predMap = Object.fromEntries(
    existingPredictions.map((p) => [p.match_id, `${p.predicted_home}-${p.predicted_away}`])
  )
  const winnerPredMap = Object.fromEntries(
    existingWinnerPredictions.map((p) => [`${p.tournament_id}-${p.placement}`, p.predicted_team_id])
  )
  const winnerPointsMap = Object.fromEntries(
    existingWinnerPredictions.map((p) => [`${p.tournament_id}-${p.placement}`, p.points_awarded ?? 0])
  )

  // Podio reale per torneo concluso: 1°/2° dalla finale, 3° dalla finalina.
  // Stessa logica di award_podium_points (migration 009), qui solo per la UI.
  const podiumActualMap: Record<string, Partial<Record<1 | 2 | 3, string>>> = {}
  for (const t of tournaments) {
    const finale = matches.find((m) => m.tournament_id === t.id && m.phase === 'finale' && m.status === 'completed')
    const terzo = matches.find((m) => m.tournament_id === t.id && m.phase === 'terzo_posto' && m.status === 'completed')
    const entry: Partial<Record<1 | 2 | 3, string>> = {}
    if (finale && finale.score_home != null && finale.score_away != null) {
      const homeWon = finale.score_home > finale.score_away
      if (finale.team_home_id && finale.team_away_id) {
        entry[1] = homeWon ? finale.team_home_id : finale.team_away_id
        entry[2] = homeWon ? finale.team_away_id : finale.team_home_id
      }
    }
    if (terzo && terzo.score_home != null && terzo.score_away != null) {
      const homeWon = terzo.score_home > terzo.score_away
      const winnerId = homeWon ? terzo.team_home_id : terzo.team_away_id
      if (winnerId) entry[3] = winnerId
    }
    podiumActualMap[t.id] = entry
  }

  // Pronosticabile = entrambe le squadre assegnate (l'eliminazione lo diventa dopo il sorteggio)
  const hasTeams = (m: Match) => !!m.team_home_id && !!m.team_away_id

  const completedMatches = matches.filter((m) => m.status === 'completed' && hasTeams(m))

  // Giornata attiva = la prima giornata con almeno una partita pronosticabile non ancora conclusa.
  // Resta visibile (anche con partite in corso) finché TUTTE le sue partite non sono completate.
  const liveMatches = matches.filter((m) => hasTeams(m) && m.status !== 'completed')
  const firstGameDate = matches.length > 0 ? toGameDate(matches[0].scheduled_at) : null
  const activeDay = liveMatches.length > 0 ? toGameDate(liveMatches[0].scheduled_at) : null
  const activeDayMatches = activeDay
    ? liveMatches.filter((m) => toGameDate(m.scheduled_at) === activeDay)
    : []
  const activeDayIndex = firstGameDate && activeDay
    ? dayNumber(activeDay, firstGameDate)
    : null

  // Server Component reso per-richiesta (revalidate=0): l'orario corrente serve solo a
  // marcare come "iniziate" le partite già cominciate (hint UI; il vero cutoff è nella RLS).
  // Lettura legittima lato server, non una violazione di purezza React.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const batchMatches = activeDayMatches.map((m) => ({
    id: m.id,
    homeTeamName: m.team_home_id ? (teamsMap[m.team_home_id] ?? 'Da definire') : 'Da definire',
    awayTeamName: m.team_away_id ? (teamsMap[m.team_away_id] ?? 'Da definire') : 'Da definire',
    homePlayers: m.team_home_id ? playersMap[m.team_home_id] : undefined,
    awayPlayers: m.team_away_id ? playersMap[m.team_away_id] : undefined,
    // Congelata quando la partita è iniziata (cutoff = orario d'inizio) o è in corso/rinviata
    locked: new Date(m.scheduled_at).getTime() <= now || m.status === 'in_progress',
    postponed: m.status === 'postponed',
    initialPrediction: predMap[m.id],
    tournamentLabel: tournamentLabelMap[m.tournament_id],
    phaseLabel: m.phase !== 'girone' ? (PHASE_LABEL[m.phase] ?? m.phase) : undefined,
    // Formattato lato server: niente deriva di fuso/idratazione sul client
    timeLabel: new Date(m.scheduled_at).toLocaleTimeString('it-IT', {
      timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit',
    }),
  }))

  // Pillola "Giocatori" mostrata solo se almeno una squadra nel deck ha la rosa nel DB
  const deckHasPlayers = batchMatches.some(
    (m) => (m.homePlayers?.length ?? 0) > 0 || (m.awayPlayers?.length ?? 0) > 0
  )

  // Lock podio automatico per torneo: tutti i gironi di quel torneo completati
  const isPodioLocked = (t: Tournament) => {
    const gm = matches.filter((m) => m.tournament_id === t.id && m.phase === 'girone')
    return t.predictions_locked || (gm.length > 0 && gm.every((m) => m.status === 'completed'))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">I miei pronostici</h1>

      <div className="flex items-start gap-2 mb-6">
        <NotificationOptIn variant="compact" />
        {deckHasPlayers && (
          <div className="flex-1 min-w-0">
            <PlayersToggle />
          </div>
        )}
      </div>

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

      {batchMatches.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            {`Partite${activeDayIndex !== null ? ` - Giorno ${activeDayIndex}` : ''}`}
          </h2>
          <PredictionsDeck matches={batchMatches} />
        </section>
      ) : completedMatches.length === 0 ? (
        <div className="text-center py-16 text-slate-500 mb-12">
          <p>Nessuna partita in programma al momento.</p>
        </div>
      ) : null}

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
          Pronostica il podio finale
        </h2>
        <div className="space-y-6">
          {tournaments.map((t) => {
            const tournamentTeams = teams.filter((team) => team.tournament_id === t.id)
            const locked = isPodioLocked(t)
            const finished = t.status === 'completed'
            return (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold">{t.name}</h3>
                  {finished ? (
                    <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                      <Trophy size={10} />
                      Concluso
                    </span>
                  ) : locked && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                      <Lock size={10} />
                      Bloccato
                    </span>
                  )}
                </div>
                {finished ? (
                  <div className="space-y-3">
                    {([1, 2, 3] as const).map((placement) => {
                      const predictedTeamId = winnerPredMap[`${t.id}-${placement}`]
                      const actualTeamId = podiumActualMap[t.id]?.[placement]
                      return (
                        <WinnerPredictionResult
                          key={placement}
                          placement={placement}
                          predictedTeamName={predictedTeamId ? teamsMap[predictedTeamId] : undefined}
                          actualTeamName={actualTeamId ? teamsMap[actualTeamId] : undefined}
                          points={winnerPointsMap[`${t.id}-${placement}`] ?? 0}
                        />
                      )
                    })}
                  </div>
                ) : locked ? (
                  <p className="text-slate-500 text-sm">Gironi conclusi: i pronostici sul podio sono chiusi.</p>
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
