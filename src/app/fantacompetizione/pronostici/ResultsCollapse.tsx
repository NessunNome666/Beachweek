'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ResultsCollapse({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="mb-12">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <h2 className={`text-lg font-bold ${open ? 'text-orange-400' : 'text-slate-400'}`}>
          Risultati pronostici ({count})
        </h2>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? 'rotate-180 text-orange-400' : 'text-slate-500'}`}
        />
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </section>
  )
}
