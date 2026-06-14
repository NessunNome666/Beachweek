'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  phase: string
  round: number
  team_home_id: string | null
  team_away_id: string | null
  scheduled_at: string
  status: string
  court: string | null
  notes: string | null
}

interface Props {
  match: Match
  homeTeamName: string
  awayTeamName: string
}

const PHASE_LABEL: Record<string, string> = {
  girone: 'Girone',
  quarti: 'Quarti',
  semifinale: 'Semifinale',
  finale: 'Finale',
  terzo_posto: '3° Posto',
}

// Converte timestamptz UTC in stringa locale per <input type="datetime-local">
function toLocalDatetimeInput(utcStr: string): string {
  const d = new Date(utcStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Converte stringa locale in ISO per Supabase
function fromLocalDatetimeInput(local: string): string {
  return new Date(local).toISOString()
}

export default function AdminCalendarioForm({ match, homeTeamName, awayTeamName }: Props) {
  const [open, setOpen] = useState(false)
  const [scheduledAt, setScheduledAt] = useState(toLocalDatetimeInput(match.scheduled_at))
  const [status, setStatus] = useState<'scheduled' | 'postponed'>(
    match.status === 'postponed' ? 'postponed' : 'scheduled'
  )
  const [notes, setNotes] = useState(match.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    setError('')

    const supabase = createClient()
    const { error: dbError } = await (supabase as any)
      .from('matches')
      .update({
        scheduled_at: fromLocalDatetimeInput(scheduledAt),
        status,
        notes: notes || null,
      })
      .eq('id', match.id)

    setLoading(false)
    if (dbError) {
      setError('Errore nel salvataggio. Riprova.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const isPostponed = status === 'postponed'

  return (
    <div className={`bg-slate-900 border rounded-xl overflow-hidden ${
      isPostponed ? 'border-orange-500/40' : saved ? 'border-green-800/50' : 'border-slate-800'
    }`}>
      {/* Header — sempre visibile */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 shrink-0">
              {PHASE_LABEL[match.phase] ?? match.phase} R{match.round}
            </span>
            {isPostponed && (
              <span className="text-xs font-bold text-orange-400">RINVIATA</span>
            )}
          </div>
          <span className="font-medium text-sm truncate">{homeTeamName}</span>
          <span className="font-medium text-sm text-slate-400 truncate">vs {awayTeamName}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0 ml-3">
          <span className="text-xs text-slate-600">
            {new Date(match.scheduled_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
            {' '}
            {new Date(match.scheduled_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {open ? <ChevronUp size={14} className="text-slate-500 mt-1" /> : <ChevronDown size={14} className="text-slate-500 mt-1" />}
        </div>
      </button>

      {/* Form espandibile */}
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Data e ora</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => { setScheduledAt(e.target.value); setSaved(false) }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stato */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Stato partita</label>
            <div className="flex gap-2">
              {(['scheduled', 'postponed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setSaved(false) }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === s
                      ? s === 'postponed'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-amber-400 text-slate-900'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s === 'scheduled' ? 'In programma' : 'Rinviata'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Note (visibili a tutti)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
              placeholder="Es. Rinviata per pioggia, nuovo orario TBD"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              saved
                ? 'bg-green-500/20 text-green-400 cursor-default'
                : 'bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-40'
            }`}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Salvataggio…</>
            ) : saved ? (
              <><Check size={14} /> Salvato</>
            ) : (
              'Salva modifiche'
            )}
          </button>
        </div>
      )}
    </div>
  )
}