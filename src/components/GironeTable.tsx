interface StandingRow {
  team_id: string
  team_name: string
  matches_played: number
  wins: number
  losses: number
  sets_won: number
  sets_lost: number
  points: number
}

export default function GironeTable({ standings }: { standings: StandingRow[] }) {
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const aDiff = a.sets_won - a.sets_lost
    const bDiff = b.sets_won - b.sets_lost
    return bDiff - aDiff
  })

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
              <td className="px-4 py-3 font-medium flex items-center gap-2">
                <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                {row.team_name}
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
