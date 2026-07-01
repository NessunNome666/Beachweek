'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ResultsCollapse({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="mb-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left mb-4 group"
      >
        <h2 className="text-lg font-bold text-slate-300">Risultati pronostici ({count})</h2>
        {open
          ? <ChevronUp size={18} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          : <ChevronDown size={18} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        }
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </section>
  )
}
