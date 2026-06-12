import type { StandingRow } from '@/lib/qualification'
import { sortGroup } from '@/lib/qualification'

interface Props {
  standings: StandingRow[]
  qualifiedIds?: string[]      // IDs sicuramente qualificati (1°, 2°, migliori terze)
  allQualified?: boolean       // true = tutti qualificati (es. Torneo Pro)
}

export default function GironeTable({ standings, qualifiedIds = [], allQualified = false }: Props) {
  const sorted = sortGroup(standings)

  function badge(teamId: string, position: number) {
    if (allQualified || qualifiedIds.includes(teamId)) {
      return (
        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
          Q
        </span>
      )
    }
    // 3° posto non qualificato: badge grigio interrogativo
    if (position === 2) {
      return (
        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 border border-slate-600">
          ?
        </span>
      )
    }
    return null
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-medium">Squadra</th>
            <th className="px-3 py-3 font-medium">G</th>
            <th className="px-3 py-3 font-medium">V</th>
            <th className="px-3 py-3 font-medium">P</th>
            <th className="px-3 py-3 font-medium">Set</th>
            <th className="px-3 py-3 font-medium text-amber-400">Pt</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.team_id}
              className={`border-t border-slate-800 transition-colors hover:bg-slate-800/30 ${
                i === 0 ? 'text-white' : 'text-slate-300'
              }`}
            >
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                  {row.team_name}
                  {badge(row.team_id, i)}
                </div>
              </td>
              <td className="px-3 py-3 text-center text-slate-400">{row.matches_played}</td>
              <td className="px-3 py-3 text-center text-green-400">{row.wins}</td>
              <td className="px-3 py-3 text-center text-red-400">{row.losses}</td>
              <td className="px-3 py-3 text-center text-slate-400">
                {row.sets_won}-{row.sets_lost}
              </td>
              <td className="px-3 py-3 text-center font-bold text-amber-400">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
