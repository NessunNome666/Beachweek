'use client'

import { Fragment, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPlayers, setShowPlayers] = useState(false)

  // Occhio visibile solo se almeno una squadra del girone ha la rosa nel DB
  const hasPlayers = sorted.some((r) => playersByTeamId?.[r.team_id]?.length)
  // Con tutte le squadre qualificate (Pro) l'evidenza non aggiunge informazione
  const isQualified = (teamId: string) => !allQualified && qualifiedIds.includes(teamId)

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm min-w-[280px]">
        <thead>
          <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wide">
            <th className="text-left px-3 py-2.5 font-medium">
              <span className="flex items-center gap-1.5">
                Squadra
                {hasPlayers && (
                  <button
                    type="button"
                    onClick={() => setShowPlayers((v) => !v)}
                    aria-pressed={showPlayers}
                    aria-label="Mostra i giocatori"
                    className={`transition-colors ${showPlayers ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {showPlayers ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                )}
              </span>
            </th>
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
            const q = isQualified(row.team_id)
            // Il bordo accent chiude anche il fondo del blocco qualificate (= top della riga dopo)
            const edge = q || (i > 0 && isQualified(sorted[i - 1].team_id))
            return (
              <Fragment key={row.team_id}>
                <tr
                  className={`border-t transition-colors ${edge ? 'border-orange-400/50' : 'border-slate-800'} ${
                    q ? 'bg-orange-500/10' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="px-3 py-2.5 font-medium text-white">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      {row.team_name}
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
                {showPlayers && !!players?.length && (
                  <tr className={q ? 'bg-orange-500/10' : ''}>
                    {/* Sotto-riga rosa: senza border-t si legge come parte della riga sopra */}
                    <td colSpan={6} className="px-3 pb-2.5 pl-8 text-xs text-slate-400">
                      {players.join(', ')}
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
