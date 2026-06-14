'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  dayLabel: string
  badge?: React.ReactNode
  isToday: boolean
  isPast: boolean
  defaultOpen: boolean
  children: React.ReactNode
}

export default function DayAccordion({ dayLabel, badge, isToday, isPast, defaultOpen, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 mb-4 group"
      >
        <h2 className={`text-base font-bold ${isToday ? 'text-orange-400' : isPast ? 'text-slate-600' : 'text-white'}`}>
          {dayLabel}
        </h2>
        {badge}
        <span className={`ml-auto ${isPast ? 'text-slate-700' : 'text-slate-500'} group-hover:text-slate-300 transition-colors`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && children}
    </section>
  )
}
