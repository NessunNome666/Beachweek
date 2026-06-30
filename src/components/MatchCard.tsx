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
  score_detail?: string | null
  scheduled_at: string
  status: string
  court: string | null
  notes?: string | null
}

const PHASE_LABEL: Record<string, string> = {
  girone: 'Girone',
  ottavi: 'Ottavi di finale',
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
  const timeStr = scheduledDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>{PHASE_LABEL[match.phase] ?? match.phase} — Round {match.round}</span>
        <div className="flex items-center gap-1.5">
          {isPostponed ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 font-medium">Rinviata</span>
            </>
          ) : isLive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400">In corso</span>
            </>
          ) : isCompleted ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-400">Conclusa</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400">In programma</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className={`font-semibold truncate ${homeWon ? 'text-white' : 'text-slate-300'}`}>
          {homeTeam?.name ?? 'Da definire'}
        </span>
        <span className="font-mono font-bold text-lg px-4 py-1.5 rounded-lg min-w-[5rem] text-center bg-slate-700/80">
          {isPostponed ? '—' : formatScore(match.score_home, match.score_away)}
        </span>
        <span className={`font-semibold truncate text-right ${awayWon ? 'text-white' : 'text-slate-300'}`}>
          {awayTeam?.name ?? 'Da definire'}
        </span>
      </div>

      {isCompleted && match.score_detail && (
        <div className="flex justify-center gap-4 mt-2">
          {match.score_detail.split(',').map((s, i) => (
            <span key={i} className="text-xs text-slate-500 font-mono">
              Set {i + 1}: {s}
            </span>
          ))}
        </div>
      )}

      {!isCompleted && !isPostponed && (
        <div className="mt-2 text-xs text-slate-500 text-center">{timeStr}</div>
      )}

      {match.notes && (
        <p className="mt-1.5 text-xs text-orange-400/80 italic">{match.notes}</p>
      )}
    </div>
  )
}
