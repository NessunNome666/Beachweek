'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { display_name: displayName || email.split('@')[0] },
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <p className="font-semibold text-lg mb-2">Email inviata!</p>
        <p className="text-slate-400 text-sm">
          Controlla la tua casella di posta e clicca il link per accedere.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="name">
          Nome visualizzato
        </label>
        <input
          id="name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Come ti chiamano?"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="email">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="la-tua@email.com"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-400 text-slate-900 font-bold py-3 rounded-full hover:bg-amber-300 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
        {loading ? 'Invio in corso…' : 'Invia link magico'}
      </button>
    </form>
  )
}
