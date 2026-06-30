import type { StandingRow } from '@/lib/qualification'
import { sortGroup } from '@/lib/qualification'

interface Props {
  standings: StandingRow[]
  qualifiedIds?: string[]
  allQualified?: boolean
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
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm min-w-[280px]">
        <thead>
          <tr className="bg-slate-700/80 text-slate-400 text-xs uppercase tracking-wide">
            <th className="text-left px-3 py-2.5 font-medium">Squadra</th>
            <th className="px-2 py-2.5 font-medium">V</th>
            <th className="px-2 py-2.5 font-medium">P</th>
            <th className="px-2 py-2.5 font-medium">Set</th>
            <th className="px-2 py-2.5 font-medium">Δpt</th>
            <th className="px-2 py-2.5 font-medium text-orange-400">Pt</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.team_id}
              className="border-t border-slate-700/60 hover:bg-slate-700/20 transition-colors"
            >
              <td className="px-3 py-2.5 font-medium text-white">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                  {row.team_name}
                  {badge(row.team_id, i)}
                </div>
              </td>
              <td className="px-2 py-2.5 text-center text-slate-300">{row.wins}</td>
              <td className="px-2 py-2.5 text-center text-slate-300">{row.losses}</td>
              <td className="px-2 py-2.5 text-center text-slate-300">
                {row.sets_won}-{row.sets_lost}
              </td>
              <td className="px-2 py-2.5 text-center text-slate-300">
                {row.points_scored ?? 0}-{row.points_conceded ?? 0}
              </td>
              <td className="px-2 py-2.5 text-center font-bold text-orange-400">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
