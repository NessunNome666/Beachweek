'use client'

import { Fragment, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { StandingRow } from '@/lib/qualification'
import { sortGroup } from '@/lib/qualification'

interface Props {
  standings: StandingRow[]
  qualifiedIds?: string[]
  allQualified?: boolean
  playersByTeamId?: Record<string, string[]>
}

export default function GironeTable({ standings, qualifiedIds = [], allQualified = false, playersByTeamId }: Props) {
  const sorted = sortGroup(standings)
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)

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
          —
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
          {sorted.map((row, i) => {
            const players = playersByTeamId?.[row.team_id]
            const expandable = !!players?.length
            const open = expandable && openTeamId === row.team_id
            const toggle = () => setOpenTeamId(open ? null : row.team_id)
            return (
              <Fragment key={row.team_id}>
                <tr
                  className={`border-t border-slate-700/60 hover:bg-slate-700/20 transition-colors ${expandable ? 'cursor-pointer' : ''}`}
                  onClick={expandable ? toggle : undefined}
                  onKeyDown={
                    expandable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggle()
                          }
                        }
                      : undefined
                  }
                  tabIndex={expandable ? 0 : undefined}
                  aria-expanded={expandable ? open : undefined}
                >
                  <td className="px-3 py-2.5 font-medium text-white">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      {row.team_name}
                      {badge(row.team_id, i)}
                      {expandable && (
                        <ChevronDown
                          size={12}
                          className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      )}
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
                {open && (
                  <tr>
                    {/* Sotto-riga rosa: senza border-t si legge come parte della riga sopra */}
                    <td colSpan={6} className="px-3 pb-2.5 pl-8 text-xs text-slate-400">
                      {players!.join(', ')}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
