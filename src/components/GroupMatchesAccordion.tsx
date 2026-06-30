'use client'

import { useState } from 'react'

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
        className="w-full flex items-center justify-between bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span>{label}</span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="space-y-2 mt-2">{children}</div>}
    </div>
  )
}
