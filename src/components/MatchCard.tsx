import { Clock, MapPin } from 'lucide-react'
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
}

const PHASE_LABEL: Record<string, string> = {
  girone: 'Girone',
  quarti: 'Quarti di finale',
  semifinale: 'Semifinale',
  finale: 'Finale',
  terzo_posto: '3° Posto',
}

const STATUS_DOT: Record<string, string> = {
  scheduled: 'bg-slate-500',
  in_progress: 'bg-green-400 animate-pulse',
  completed: 'bg-slate-600',
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
  const homeWon = isCompleted && match.score_home !== null && match.score_away !== null && match.score_home > match.score_away
  const awayWon = isCompleted && match.score_home !== null && match.score_away !== null && match.score_away > match.score_home

  return (
    <div className={`bg-slate-900 border rounded-xl px-4 py-3 ${isLive ? 'border-green-500/50' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
        <span>{PHASE_LABEL[match.phase] ?? match.phase} — Round {match.round}</span>
        <div className="flex items-center gap-3">
          {match.court && (
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {match.court}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[match.status]}`} />
            {isLive ? 'In corso' : isCompleted ? 'Terminata' : 'In programma'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className={`font-semibold truncate ${homeWon ? 'text-white' : 'text-slate-300'}`}>
          {homeTeam?.name ?? 'Da definire'}
        </span>
        <span className="font-mono font-bold text-lg px-3 py-1 bg-slate-800 rounded-lg min-w-[5rem] text-center">
          {formatScore(match.score_home, match.score_away)}
        </span>
        <span className={`font-semibold truncate text-right ${awayWon ? 'text-white' : 'text-slate-300'}`}>
          {awayTeam?.name ?? 'Da definire'}
        </span>
      </div>

      {!isCompleted && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <Clock size={10} />
          {new Date(match.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}
