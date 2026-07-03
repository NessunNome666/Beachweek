import { createClient } from '@/lib/supabase/server'
import AdminMvpManager from './AdminMvpManager'

export const revalidate = 0

interface Tournament { id: string; name: string; mvp_status: string }
interface Candidate { id: string; name: string; tournament_id: string }

export default async function AdminMvpPage() {
  const supabase = await createClient()
  const sb = supabase

  const { data: tournamentsRaw } = await sb
    .from('tournaments')
    .select('id, name, mvp_status')
    .order('created_at')
  const { data: candidatesRaw } = await sb
    .from('mvp_candidates')
    .select('id, name, tournament_id')
    .order('created_at')

  const tournaments = (tournamentsRaw ?? []) as Tournament[]
  const candidates = (candidatesRaw ?? []) as Candidate[]

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-2xl font-bold text-white mb-2">Votazione MVP</h1>
      <p className="text-slate-400 mb-8 text-sm">
        Scegli il torneo, inserisci i candidati e apri la votazione. Finché lo stato è
        &laquo;Nascosta&raquo; nessuno vede la funzionalità.
      </p>
      <AdminMvpManager tournaments={tournaments} candidates={candidates} />
    </div>
  )
}
