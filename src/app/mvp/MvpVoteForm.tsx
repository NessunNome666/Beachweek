'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, AlertCircle, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Candidate { id: string; name: string }

interface Props {
  tournamentId: string
  candidates: Candidate[]
}

export default function MvpVoteForm({ tournamentId, candidates }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleVote() {
    if (!selected) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non sei autenticato.'); setLoading(false); return }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('mvp_votes')
      .insert({ user_id: user.id, candidate_id: selected, tournament_id: tournamentId })

    setLoading(false)
    if (dbError) {
      setError('Voto non registrato. Forse hai già votato o la votazione è chiusa.')
      setConfirming(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {candidates.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelected(c.id); setConfirming(false); setError('') }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors ${
              selected === c.id
                ? 'bg-orange-500/15 border-orange-400 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-600'
            }`}
          >
            <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
              selected === c.id ? 'border-orange-400' : 'border-slate-600'
            }`}>
              {selected === c.id && <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />}
            </span>
            <span className="font-semibold">{c.name}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        >
          <Trophy size={16} /> Vota
        </button>
      ) : (
        <div className="space-y-2 bg-slate-900 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-300">
            Confermi il tuo voto? <span className="text-white font-semibold">Non potrai modificarlo.</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleVote}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Invio…</>
                : <><Check size={14} /> Conferma voto</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
