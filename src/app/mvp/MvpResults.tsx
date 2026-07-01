import { Trophy, Check } from 'lucide-react'

interface ResultRow { candidate_id: string; name: string; votes: number; pct: number }

interface Props {
  results: ResultRow[]
  myVoteCandidateId: string | null
  closed: boolean
}

export default function MvpResults({ results, myVoteCandidateId, closed }: Props) {
  const totalVotes = results.reduce((sum, r) => sum + Number(r.votes), 0)
  const topVotes = results.length > 0 ? Number(results[0].votes) : 0

  return (
    <div className="space-y-3">
      {results.map((r, i) => {
        const votes = Number(r.votes)
        const isLeader = closed && votes > 0 && votes === topVotes
        const isMine = r.candidate_id === myVoteCandidateId
        return (
          <div
            key={r.candidate_id}
            className={`relative overflow-hidden rounded-xl border px-4 py-3 ${
              isLeader ? 'border-orange-400 bg-orange-500/5' : 'border-slate-800 bg-slate-900'
            }`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600/25 to-orange-500/25"
              style={{ width: `${r.pct}%` }}
            />
            <div className="relative flex items-center gap-3">
              <span className="text-xs text-slate-500 w-4 shrink-0">{i + 1}</span>
              <span className="font-semibold text-white flex-1 flex items-center gap-2">
                {r.name}
                {isLeader && <Trophy size={14} className="text-orange-400" />}
                {isMine && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/15 px-1.5 py-0.5 rounded-full">
                    <Check size={9} /> Il tuo voto
                  </span>
                )}
              </span>
              <span className="font-mono font-bold text-slate-200 shrink-0">{r.pct}%</span>
            </div>
          </div>
        )
      })}
      <p className="text-center text-xs text-slate-500 pt-1">
        {totalVotes} {totalVotes === 1 ? 'voto' : 'voti'} totali
        {!closed && ' — la votazione è ancora aperta'}
      </p>
    </div>
  )
}
