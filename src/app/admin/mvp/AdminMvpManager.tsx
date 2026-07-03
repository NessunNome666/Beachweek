'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Tournament { id: string; name: string; mvp_status: string }
interface Candidate { id: string; name: string; tournament_id: string }
interface ResultRow { candidate_id: string; name: string; votes: number; pct: number }

interface Props {
  tournaments: Tournament[]
  candidates: Candidate[]
}

const STATUS: { value: string; label: string; icon: typeof Eye; hint: string }[] = [
  { value: 'hidden', label: 'Nascosta', icon: EyeOff, hint: 'Invisibile a tutti' },
  { value: 'open', label: 'Aperta', icon: Eye, hint: 'Gli utenti possono votare' },
  { value: 'closed', label: 'Chiusa', icon: Lock, hint: 'Risultati visibili a tutti' },
]

export default function AdminMvpManager({ tournaments, candidates }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(tournaments[0]?.id ?? '')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ResultRow[]>([])

  const selected = tournaments.find((t) => t.id === selectedId)
  const myCandidates = candidates.filter((c) => c.tournament_id === selectedId)

  function loadResults(tournamentId: string) {
    if (!tournamentId) return
    const supabase = createClient()
    supabase
      .rpc('get_mvp_results', { p_tournament_id: tournamentId })
      .then(({ data }) => setResults(data ?? []))
  }

  useEffect(() => { loadResults(selectedId) }, [selectedId])

  async function addCandidate() {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('mvp_candidates')
      .insert({ tournament_id: selectedId, name: trimmed })
    setLoading(false)
    if (dbError) { setError('Errore nel salvataggio. Riprova.'); return }
    setName('')
    router.refresh()
  }

  async function removeCandidate(id: string) {
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase.from('mvp_candidates').delete().eq('id', id)
    if (dbError) { setError('Errore nell’eliminazione. Riprova.'); return }
    router.refresh()
    loadResults(selectedId)
  }

  async function setStatus(status: string) {
    if (!selected || selected.mvp_status === status) return
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('tournaments')
      .update({ mvp_status: status })
      .eq('id', selectedId)
    if (dbError) { setError('Errore nel cambio stato. Riprova.'); return }
    router.refresh()
  }

  const votesById = Object.fromEntries(results.map((r) => [r.candidate_id, Number(r.votes)]))

  if (tournaments.length === 0) {
    return <p className="text-slate-400">Nessun torneo trovato. Esegui prima il seed dei dati.</p>
  }

  return (
    <div className="space-y-8">
      {/* Selettore torneo */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">Torneo</label>
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setError('') }}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
        >
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Stato votazione */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">Stato della votazione</label>
        <div className="grid grid-cols-3 gap-2">
          {STATUS.map((s) => {
            const Icon = s.icon
            const active = selected?.mvp_status === s.value
            return (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-orange-500/15 border-orange-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Icon size={16} />
                {s.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {STATUS.find((s) => s.value === selected?.mvp_status)?.hint}
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Candidati */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">
          Candidati ({myCandidates.length})
        </label>
        <div className="flex gap-2 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCandidate() }}
            placeholder="Nome del candidato"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
          />
          <button
            onClick={addCandidate}
            disabled={!name.trim() || loading}
            className="flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold bg-orange-400 text-slate-900 hover:bg-orange-300 disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            Aggiungi
          </button>
        </div>

        <div className="space-y-2">
          {myCandidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3"
            >
              <span className="font-semibold text-white flex-1">{c.name}</span>
              <span className="text-xs text-slate-500 font-mono">
                {votesById[c.id] ?? 0} voti
              </span>
              <button
                onClick={() => removeCandidate(c.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                aria-label="Rimuovi candidato"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {myCandidates.length === 0 && (
            <p className="text-slate-500 text-sm py-4 text-center">Nessun candidato inserito.</p>
          )}
        </div>
      </div>
    </div>
  )
}
