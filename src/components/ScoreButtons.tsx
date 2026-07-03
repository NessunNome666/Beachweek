'use client'

import { VALID_VOLLEYBALL_SCORES } from '@/lib/scoring'

interface Props {
  selected: string                    // pronostico corrente, es. "2-0"
  onSelect: (score: string) => void
  columns?: 3 | 4                      // layout griglia
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
  return (
    <div className={`grid ${columns === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-2 ${className}`}>
      {VALID_VOLLEYBALL_SCORES.map(([h, a]) => {
        const key = `${h}-${a}`
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`${compact ? 'py-2.5' : 'py-3'} rounded-lg text-sm font-mono font-bold transition-colors ${
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
