import { Clock, MapPin, AlertTriangle } from 'lucide-react'
import { formatScore } from '@/lib/scoring'

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  phase: string
  round: number
  team_home_id: string | null
  team_away_id: string | null
  score_home: number | null
  score_away: number | null
  scheduled_at: string
  status: string
  court: string | null
  notes?: string | null
}

const PHASE_LABEL: Record<string, string> = {
  girone: 'Girone',
  quarti: 'Quarti di finale',
  semifinale: 'Semifinale',
  finale: 'Finale',
  terzo_posto: '3° Posto',
}

export default function MatchCard({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match
  homeTeam?: Team
  awayTeam?: Team
}) {
  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'in_progress'
  const isPostponed = match.status === 'postponed'
  const homeWon = isCompleted && match.score_home !== null && match.score_away !== null && match.score_home > match.score_away
  const awayWon = isCompleted && match.score_home !== null && match.score_away !== null && match.score_away > match.score_home

  const scheduledDate = new Date(match.scheduled_at)
  const dateStr = scheduledDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = scheduledDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`bg-slate-900 border rounded-xl px-4 py-3 ${
      isLive ? 'border-green-500/50' :
      isPostponed ? 'border-orange-500/40' :
      'border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
        <span>{PHASE_LABEL[match.phase] ?? match.phase} — Round {match.round}</span>
        <div className="flex items-center gap-3">
          {match.court && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {match.court}
            </span>
          )}
          {isPostponed ? (
            <span className="flex items-center gap-1 text-orange-400 font-semibold">
              <AlertTriangle size={10} />
              RINVIATA
            </span>
          ) : isLive ? (
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              In corso
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              Terminata
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              In programma
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className={`font-semibold truncate ${homeWon ? 'text-white' : isPostponed ? 'text-slate-500' : 'text-slate-300'}`}>
          {homeTeam?.name ?? 'Da definire'}
        </span>
        <span className={`font-mono font-bold text-lg px-3 py-1 rounded-lg min-w-[5rem] text-center ${
          isPostponed ? 'bg-orange-900/20 text-orange-400/60' : 'bg-slate-800'
        }`}>
          {isPostponed ? '— —' : formatScore(match.score_home, match.score_away)}
        </span>
        <span className={`font-semibold truncate text-right ${awayWon ? 'text-white' : isPostponed ? 'text-slate-500' : 'text-slate-300'}`}>
          {awayTeam?.name ?? 'Da definire'}
        </span>
      </div>

      {!isCompleted && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <Clock size={10} />
          {dateStr} · {timeStr}
        </div>
      )}

      {match.notes && (
        <p className="mt-1.5 text-xs text-orange-400/80 italic">{match.notes}</p>
      )}
    </div>
  )
}