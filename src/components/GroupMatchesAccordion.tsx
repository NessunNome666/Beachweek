'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  label?: string
  children: React.ReactNode
}

export default function GroupMatchesAccordion({ label = 'Partite', children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-1 font-medium uppercase tracking-wide"
      >
        {label}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  )
}
