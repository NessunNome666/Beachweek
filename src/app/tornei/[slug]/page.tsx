import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getQualifiedAmatoriale, getPairingsPro, getQualifiedFootVolley, sortGroup,
} from '@/lib/qualification'
import type { StandingRow } from '@/lib/qualification'
import GironeTable from '@/components/GironeTable'
import MatchCard from '@/components/MatchCard'
import GroupMatchesAccordion from '@/components/GroupMatchesAccordion'

export const revalidate = 0

const PHASE_ORDER = ['girone', 'ottavi', 'quarti', 'semifinale', 'terzo_posto', 'finale']
const PHASE_LABEL: Record<string, string> = {
  ottavi: 'Ottavi di finale',
  quarti: 'Quarti di finale',
  semifinale: 'Semifinali',
  terzo_posto: '3° Posto',
  finale: 'Finale',
}

const SLUG_TO_TID: Record<string, 'ama' | 'pro' | 'fv'> = {
  'beach-volley-amatoriale': 'ama',
  'beach-volley-pro': 'pro',
  'foot-volley-2v2': 'fv',
  'test-cup-2026': 'ama',
}

export default async function TorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tid = SLUG_TO_TID[slug]
  if (!tid) notFound()

  const supabase = await createClient()

  // Step 1: ottieni il torneo per slug
  const { data: torneo } = await supabase
    .from('tournaments')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!torneo) notFound()

  // Step 2: query parallele usando l'id del torneo
  const [
    { data: teamsRaw },
    { data: matchesRaw },
    { data: standingsRaw },
  ] = await Promise.all([
    supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', torneo.id)
      // Ordine di inserimento = ordine ufficiale dei gironi sulla locandina
      // (i nomi reali non sono alfabetici: BRASILE '10 finirebbe prima di BRASILE '90)
      .order('created_at')
      .order('name'),
    supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', torneo.id)
      .order('phase')
      .order('round'),
    supabase
      .from('standings_view')
      .select('*')
      .eq('tournament_id', torneo.id),
  ])

  const safeTeams: Array<{
    id: string; name: string; tournament_id: string
    group_name: string | null; created_at: string
    players: string[] | null
  }> = teamsRaw ?? []

  const teamsById = new Map(safeTeams.map((t) => [t.id, t]))
  const playersByTeamId = Object.fromEntries(
    safeTeams.filter((t) => t.players?.length).map((t) => [t.id, t.players!])
  )

  const safeMatches: Array<{
    id: string; tournament_id: string; phase: string; round: number
    team_home_id: string | null; team_away_id: string | null
    score_home: number | null; score_away: number | null; score_detail: string | null
    scheduled_at: string; status: string; court: string | null
  }> = matchesRaw ?? []

  // Mappa a StandingRow — il DB traccia solo set, non punti individuali
  const standings: StandingRow[] = (standingsRaw ?? []).map((r) => ({
    team_id: r.team_id ?? '',
    team_name: r.team_name ?? '',
    group_name: r.group_name ?? '',
    tournament_id: r.tournament_id ?? '',
    matches_played: r.matches_played ?? 0,
    wins: r.wins ?? 0,
    losses: r.losses ?? 0,
    sets_won: r.sets_won ?? 0,
    sets_lost: r.sets_lost ?? 0,
    points_scored: r.points_scored ?? 0,
    points_conceded: r.points_conceded ?? 0,
    points: r.points ?? 0,
  }))

  const groups = [...new Set(safeTeams.map((t) => t.group_name).filter(Boolean))] as string[]
  // Ordine cronologico esplicito: la query ordina per (phase, round) e dentro
  // lo stesso round l'ordine non è garantito; copre anche le partite rinviate
  const gironeMatches = safeMatches
    .filter((m) => m.phase === 'girone')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const elimMatches = safeMatches.filter((m) => m.phase !== 'girone')

  // ── Calcolo qualificati ───────────────────────────────────
  let qualifiedIds: string[] = []
  let bestThirdIds: string[] = []
  let allQualified = false
  let pairings: { homeId: string; awayId: string }[] = []

  if (tid === 'ama') {
    const result = getQualifiedAmatoriale(standings, groups)
    qualifiedIds = result.qualifiedIds
    bestThirdIds = result.bestThirdIds
  } else if (tid === 'pro') {
    allQualified = true
    pairings = getPairingsPro(standings)
  } else if (tid === 'fv') {
    qualifiedIds = getQualifiedFootVolley(standings, groups)
  }

  const allQualifiedIds = [...qualifiedIds, ...bestThirdIds]

  const gridCols =
    groups.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
    groups.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' :
    groups.length <= 6 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                         'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  const hasRealElimMatches = elimMatches.some((m) => m.team_home_id && m.team_away_id)

  const elimPhases = hasRealElimMatches
    ? PHASE_ORDER.filter((p) => p !== 'girone' && elimMatches.some((m) => m.phase === p && m.team_home_id && m.team_away_id))
    : []

  const thirds = groups.map((g) => {
    const sorted = sortGroup(standings.filter((s) => s.group_name === g))
    return sorted[2]
  }).filter(Boolean) as StandingRow[]
  const sortedThirds = sortGroup(thirds)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">{torneo.name}</h1>

      {/* ── FASE GIRONI ── */}
      {groups.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            Fase a Gironi
          </h2>
          <div className={`grid ${gridCols} gap-8`}>
            {groups.map((group) => {
              const groupStandings = standings.filter((s) => s.group_name === group)
              const groupMatches = gironeMatches.filter((m) => {
                const home = m.team_home_id ? teamsById.get(m.team_home_id) : undefined
                const away = m.team_away_id ? teamsById.get(m.team_away_id) : undefined
                return home?.group_name === group || away?.group_name === group
              })
              return (
                <div key={group} className="space-y-3">
                  <h3 className="font-heading font-bold text-lg text-slate-300">{group}</h3>
                  <GironeTable
                    standings={groupStandings}
                    qualifiedIds={allQualifiedIds}
                    allQualified={allQualified}
                    playersByTeamId={playersByTeamId}
                  />
                  <GroupMatchesAccordion>
                    {groupMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        homeTeam={(m.team_home_id ? teamsById.get(m.team_home_id) : undefined)}
                        awayTeam={(m.team_away_id ? teamsById.get(m.team_away_id) : undefined)}
                      />
                    ))}
                  </GroupMatchesAccordion>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── MIGLIORI TERZE (solo Amatoriale) ── */}
      {tid === 'ama' && sortedThirds.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            Classifica terze piazzate
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-w-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-3 py-2.5 font-medium">Squadra</th>
                  <th className="px-2 py-2.5 font-medium">Girone</th>
                  <th className="px-2 py-2.5 font-medium text-orange-400">Pt</th>
                  <th className="px-2 py-2.5 font-medium">Set</th>
                </tr>
              </thead>
              <tbody>
                {sortedThirds.map((row, i) => (
                  <tr
                    key={row.team_id}
                    className={`border-t text-slate-300 ${i <= 2 ? 'border-orange-400/50' : 'border-slate-800'} ${
                      i < 2 ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      {row.team_name}
                    </td>
                    <td className="px-2 py-2.5 text-center">{row.group_name}</td>
                    <td className="px-2 py-2.5 text-center font-bold text-orange-400">{row.points}</td>
                    <td className="px-2 py-2.5 text-center">{row.sets_won}-{row.sets_lost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── ACCOPPIAMENTI PRO (proiezione, nascosta quando i quarti reali esistono) ── */}
      {tid === 'pro' && pairings.length > 0 && !hasRealElimMatches && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            Quarti di finale
          </h2>
          <div className="space-y-2 max-w-lg">
            {pairings.map(({ homeId, awayId }, i) => {
              const home = teamsById.get(homeId)
              const away = teamsById.get(awayId)
              return (
                <div key={i} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold">
                  <span className="text-slate-500 text-xs w-5">Q{i + 1}</span>
                  <span className="flex-1">{home?.name ?? '—'}</span>
                  <span className="text-slate-500 text-xs">vs</span>
                  <span className="flex-1 text-right">{away?.name ?? '—'}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── FASE ELIMINAZIONE ── */}
      {elimPhases.length > 0 ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
            Fase a Eliminazione
          </h2>
          {elimPhases.map((phase) => (
            <div key={phase} className="mb-8">
              <h3 className="font-bold text-lg mb-3">{PHASE_LABEL[phase] ?? phase}</h3>
              <div className="space-y-2 max-w-2xl">
                {elimMatches
                  .filter((m) => m.phase === phase)
                  .map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      homeTeam={(m.team_home_id ? teamsById.get(m.team_home_id) : undefined)}
                      awayTeam={(m.team_away_id ? teamsById.get(m.team_away_id) : undefined)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>
      ) : (tid === 'ama' || tid === 'fv') ? (
        <section className="mt-4">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-6 py-5 max-w-lg">
            <div>
              <p className="font-semibold text-white">Sorteggio non ancora effettuato</p>
              <p className="text-slate-400 text-sm mt-1">
                Il tabellone finale verrà generato dopo il sorteggio dal vivo al termine dei gironi.
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
