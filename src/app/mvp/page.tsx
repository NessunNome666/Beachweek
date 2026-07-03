import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MvpVoteForm from './MvpVoteForm'
import MvpResults from './MvpResults'

export const revalidate = 0

interface Tournament { id: string; name: string; mvp_status: string }
interface Candidate { id: string; name: string; tournament_id: string }
interface ResultRow { candidate_id: string; name: string; votes: number; pct: number }

export default async function MvpPage() {
  const supabase = await createClient()
  const sb = supabase

  // Torneo attivo per MVP = quello non 'hidden' (il più recente se più d'uno)
  const { data: tournamentsRaw } = await sb
    .from('tournaments')
    .select('id, name, mvp_status')
    .neq('mvp_status', 'hidden')
    .order('created_at', { ascending: false })

  const tournament = ((tournamentsRaw ?? []) as Tournament[])[0]
  if (!tournament) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: candidatesRaw } = await sb
    .from('mvp_candidates')
    .select('id, name, tournament_id')
    .eq('tournament_id', tournament.id)
    .order('created_at')
  const candidates = (candidatesRaw ?? []) as Candidate[]

  // Voto dell'utente corrente (per capire se ha già votato)
  let myVoteCandidateId: string | null = null
  if (user) {
    const { data: myVote } = await sb
      .from('mvp_votes')
      .select('candidate_id')
      .eq('tournament_id', tournament.id)
      .eq('user_id', user.id)
      .maybeSingle()
    myVoteCandidateId = myVote?.candidate_id ?? null
  }

  const hasVoted = myVoteCandidateId !== null
  const isClosed = tournament.mvp_status === 'closed'

  // Risultati: la RPC svela i conteggi solo se hai votato / chiusa / admin
  let results: ResultRow[] = []
  if (hasVoted || isClosed) {
    const { data: resultsRaw } = await sb.rpc('get_mvp_results', { p_tournament_id: tournament.id })
    results = (resultsRaw ?? []) as ResultRow[]
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">
          Votazione MVP
        </p>
        <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
        <p className="text-slate-400 text-sm mt-2">
          {isClosed
            ? 'La votazione è chiusa. Ecco il verdetto del pubblico.'
            : hasVoted
              ? 'Hai già votato. Grazie! Ecco come sta andando.'
              : 'Vota il tuo MVP. Puoi votare una sola volta e il voto non è modificabile.'}
        </p>
      </div>

      {isClosed || hasVoted ? (
        <MvpResults results={results} myVoteCandidateId={myVoteCandidateId} closed={isClosed} />
      ) : candidates.length > 0 ? (
        <MvpVoteForm tournamentId={tournament.id} candidates={candidates} />
      ) : (
        <div className="text-center py-16 text-slate-500">
          <p>I candidati non sono ancora stati inseriti. Torna a breve.</p>
        </div>
      )}
    </div>
  )
}
