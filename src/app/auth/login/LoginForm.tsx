'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'

export default function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  // trim+lowercase: evita utenze doppie da spazi finali o maiuscole digitate
  const cleanEmail = email.trim().toLowerCase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cleanEmail) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const callbackUrl = next
      ? `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: callbackUrl,
        data: { display_name: displayName || cleanEmail.split('@')[0] },
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  // Accesso col codice a 6 cifre: verifyOtp(email+token) non dipende dal browser
  // che ha richiesto il link — funziona in WebView, browser diversi e PWA installata.
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = code.replace(/\D/g, '')
    if (cleaned.length !== 6) return
    setVerifying(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleaned,
      type: 'email',
    })
    if (error) {
      setVerifying(false)
      setError("Codice non valido o scaduto. Usa l'ultima email ricevuta o richiedi un nuovo codice.")
    } else {
      // navigazione piena: i server component rileggono la sessione dai cookie
      window.location.assign(next ?? '/fantacompetizione/pronostici')
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <p className="font-semibold text-lg mb-2">Email inviata!</p>
        <p className="text-slate-400 text-sm mb-6">
          Clicca il link nell&apos;email oppure inserisci qui il codice a 6 cifre.
        </p>
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-orange-400 transition-colors"
          />
          {error && (
            <p className="flex items-center justify-center gap-1.5 text-red-400 text-xs">
              <AlertCircle size={12} /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-4 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {verifying ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
            {verifying ? 'Verifica in corso…' : 'Accedi col codice'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="name">
          Nome visualizzato <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder="Nome Utente"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 transition-colors"
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
          placeholder="La tua email"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-4 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
        {loading ? 'Invio in corso…' : 'Invia link magico'}
      </button>
    </form>
  )
}
