'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  label?: string
  children: React.ReactNode
}

export default function GroupMatchesAccordion({ label = 'Partite', children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-2 mt-2">{children}</div>}
    </div>
  )
}
