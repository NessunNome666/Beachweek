'use client'

import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface Props {
  selected: string                    // pronostico corrente, es. "2-0"
  onSelect: (score: string) => void
  columns?: 2 | 3 | 4                  // layout griglia (2 = griglia 2x2 con bottoni grandi)
  spaced?: boolean                     // etichetta "2 - 0" (true) vs "2-0" (false)
  compact?: boolean                    // padding py-2.5 (true) vs py-3 (false)
  className?: string                   // classi extra sul wrapper (es. margini)
}

export default function ScoreButtons({
  selected,
  onSelect,
  columns = 4,
  spaced = false,
  compact = false,
  className = '',
}: Props) {
  const gridCols = columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'
  const sizing = columns === 2 ? 'py-4 text-base' : compact ? 'py-2.5 text-sm' : 'py-3 text-sm'

  return (
    <div className={`grid ${gridCols} gap-2 ${className}`}>
      {VALID_VOLLEYBALL_SCORES.map(([h, a]) => {
        const key = `${h}-${a}`
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`${sizing} rounded-lg font-mono font-bold transition-colors ${
              selected === key
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {spaced ? `${h} - ${a}` : `${h}-${a}`}
          </button>
        )
      })}
    </div>
  )
}
