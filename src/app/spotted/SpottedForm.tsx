'use client'

import { useState } from 'react'
import { Check, Loader2, AlertCircle, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const MAX_LEN = 300

export default function SpottedForm() {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const trimmed = content.trim()
  const canSend = trimmed.length >= 3 && status !== 'saving'

  async function handleSubmit() {
    if (!canSend) return
    setStatus('saving')
    setErrorMsg('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStatus('error'); setErrorMsg('Non sei autenticato.'); return }

    const { error } = await supabase
      .from('spotted_posts')
      .insert({ user_id: user.id, content: trimmed })

    if (error) {
      setStatus('error')
      setErrorMsg(error.code === '42501' ? 'Limite giornaliero raggiunto.' : 'Errore di rete — riprova.')
    } else {
      setContent('')
      setStatus('sent')
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (status === 'sent' || status === 'error') setStatus('idle')
        }}
        rows={3}
        maxLength={MAX_LEN}
        placeholder="Spotted: …"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400 transition-colors resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500 font-mono">{content.length}/{MAX_LEN}</span>
        {status === 'sent' ? (
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/20 text-green-400">
            <Check size={14} /> Inviato
          </span>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-400 text-slate-900 hover:bg-orange-300 disabled:opacity-40 transition-colors"
          >
            {status === 'saving'
              ? <><Loader2 size={14} className="animate-spin" /> Invio…</>
              : <><Send size={14} /> Invia</>}
          </button>
        )}
      </div>
      {status === 'sent' && (
        <p className="text-xs text-slate-500 mt-2">Comparirà dopo l&apos;approvazione.</p>
      )}
      {status === 'error' && errorMsg && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
          <AlertCircle size={12} /> {errorMsg}
        </p>
      )}
    </div>
  )
}
