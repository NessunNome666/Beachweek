'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  dayLabel: string
  badge?: React.ReactNode
  isToday: boolean
  isPast: boolean
  defaultOpen: boolean
  children: React.ReactNode
}

export default function DayAccordion({ dayLabel, badge, isPast, defaultOpen, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <h2 className={`text-lg font-bold ${open ? 'text-orange-400' : isPast ? 'text-slate-600' : 'text-slate-400'}`}>
            {dayLabel}
          </h2>
          {badge}
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? 'rotate-180 text-orange-400' : isPast ? 'text-slate-700' : 'text-slate-500'}`}
        />
      </button>
      {open && children}
    </section>
  )
}
