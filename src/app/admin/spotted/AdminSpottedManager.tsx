'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Trash2, Loader2, AlertCircle, Heart, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Post { id: string; content: string; status: string; created_at: string }

interface Props {
  posts: Post[]
  likesById: Record<string, number>
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' })
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
  return `${date} · ${time}`
}

export default function AdminSpottedManager({ posts, likesById }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [cleanupCount, setCleanupCount] = useState(50)
  const [cleanupBusy, setCleanupBusy] = useState(false)
  const [cleanupDone, setCleanupDone] = useState<number | null>(null)

  const pending = posts.filter((p) => p.status === 'pending')
  const approved = posts.filter((p) => p.status === 'approved')
  const rejected = posts.filter((p) => p.status === 'rejected')

  async function setStatus(id: string, status: 'approved' | 'rejected') {
    setBusyId(id)
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('spotted_posts')
      .update({ status })
      .eq('id', id)
    setBusyId(null)
    if (dbError) { setError('Errore nel cambio stato. Riprova.'); return }
    router.refresh()
  }

  async function remove(id: string) {
    if (!window.confirm('Eliminare definitivamente questo spotted?')) return
    setBusyId(id)
    setError('')
    const supabase = createClient()
    const { error: dbError } = await supabase.from('spotted_posts').delete().eq('id', id)
    setBusyId(null)
    if (dbError) { setError('Errore nell’eliminazione. Riprova.'); return }
    router.refresh()
  }

  async function emergencyCleanup() {
    const n = Math.max(1, cleanupCount)
    if (!window.confirm(
      `Eliminare definitivamente ${n} spotted? Partono i più vecchi con meno like, qualunque stato.`
    )) {
      return
    }
    setCleanupBusy(true)
    setError('')
    setCleanupDone(null)
    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .rpc('spotted_emergency_cleanup', { delete_count: n })
    setCleanupBusy(false)
    if (dbError) { setError('Errore nella pulizia. Riprova.'); return }
    setCleanupDone(data ?? 0)
    router.refresh()
  }

  function renderRow(post: Post) {
    const busy = busyId === post.id
    return (
      <div
        key={post.id}
        className={`flex items-start gap-3 bg-slate-900 border rounded-xl px-4 py-3 ${
          post.status === 'pending' ? 'border-orange-400/40' : 'border-slate-800'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className={`text-sm whitespace-pre-line break-words mb-1.5 ${
            post.status === 'rejected' ? 'text-slate-500 line-through' : 'text-slate-300'
          }`}>
            {post.content}
          </p>
          <span className="text-xs text-slate-500 font-mono">
            {formatWhen(post.created_at)}
            {post.status === 'approved' && (
              <span className="ml-3 inline-flex items-center gap-1">
                <Heart size={10} /> {likesById[post.id] ?? 0}
              </span>
            )}
          </span>
        </div>
        <div className="flex shrink-0">
          {busy ? (
            <span className="p-2 text-slate-500"><Loader2 size={16} className="animate-spin" /></span>
          ) : (
            <>
              {post.status !== 'approved' && (
                <button
                  onClick={() => setStatus(post.id, 'approved')}
                  className="text-slate-500 hover:text-green-400 transition-colors p-2"
                  aria-label="Approva"
                >
                  <Check size={16} />
                </button>
              )}
              {post.status === 'pending' && (
                <button
                  onClick={() => setStatus(post.id, 'rejected')}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2"
                  aria-label="Rifiuta"
                >
                  <X size={16} />
                </button>
              )}
              {post.status !== 'pending' && (
                <button
                  onClick={() => remove(post.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2"
                  aria-label="Elimina"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p>Nessuno spotted.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">In attesa ({pending.length})</p>
          <div className="space-y-2">{pending.map(renderRow)}</div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">Approvati ({approved.length})</p>
          <div className="space-y-2">{approved.map(renderRow)}</div>
        </div>
      )}

      {rejected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">Rifiutati ({rejected.length})</p>
          <div className="space-y-2">{rejected.map(renderRow)}</div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            Pulizia d&apos;emergenza
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={cleanupCount}
              onChange={(e) => setCleanupCount(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-400 transition-colors"
            />
            <button
              onClick={emergencyCleanup}
              disabled={cleanupBusy || cleanupCount < 1}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
            >
              {cleanupBusy
                ? <><Loader2 size={14} className="animate-spin" /> Pulizia…</>
                : <><Flame size={14} /> Elimina i meno rilevanti</>}
            </button>
          </div>
          {cleanupDone !== null && (
            <p className="text-xs text-slate-500 mt-2">Eliminati {cleanupDone}.</p>
          )}
        </div>
      )}
    </div>
  )
}
