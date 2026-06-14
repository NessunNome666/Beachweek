import { notFound } from 'next/navigation'
import { Trophy, Shuffle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getQualifiedAmatoriale, getPairingsPro, getQualifiedFootVolley, sortGroup,
} from '@/lib/qualification'
import type { StandingRow } from '@/lib/qualification'
import GironeTable from '@/components/GironeTable'
import MatchCard from '@/components/MatchCard'
import GroupMatchesAccordion from '@/components/GroupMatchesAccordion'

const PHASE_ORDER = ['girone', 'quarti', 'semifinale', 'terzo_posto', 'finale']
const PHASE_LABEL: Record<string, string> = {
  quarti: 'Quarti di finale',
  semifinale: 'Semifinali',
  terzo_posto: '3° Posto',
  finale: 'Finale',
}

const SLUG_TO_TID: Record<string, 'ama' | 'pro' | 'fv'> = {
  'beach-volley-amatoriale': 'ama',
  'beach-volley-pro': 'pro',
  'foot-volley-2v2': 'fv',
}

export default async function TorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tid = SLUG_TO_TID[slug]
  if (!tid) notFound()

  const supabase = await createClient()

  // Step 1: ottieni il torneo per slug
  const { data: torneo } = await (supabase as any)
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
    (supabase as any)
      .from('teams')
      .select('*')
      .eq('tournament_id', torneo.id)
      .order('group_name')
      .order('name'),
    (supabase as any)
      .from('matches')
      .select('*')
      .eq('tournament_id', torneo.id)
      .order('phase')
      .order('round'),
    (supabase as any)
      .from('standings_view')
      .select('*')
      .eq('tournament_id', torneo.id),
  ])

  const safeTeams: Array<{
    id: string; name: string; tournament_id: string
    group_name: string | null; created_at: string
  }> = teamsRaw ?? []

  const safeMatches: Array<{
    id: string; tournament_id: string; phase: string; round: number
    team_home_id: string | null; team_away_id: string | null
    score_home: number | null; score_away: number | null
    scheduled_at: string; status: string; court: string | null
  }> = matchesRaw ?? []

  // Mappa a StandingRow — il DB traccia solo set, non punti individuali
  const standings: StandingRow[] = (standingsRaw ?? []).map((r: any) => ({
    team_id: r.team_id,
    team_name: r.team_name,
    group_name: r.group_name ?? '',
    tournament_id: r.tournament_id,
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
  const gironeMatches = safeMatches.filter((m) => m.phase === 'girone')
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <Trophy size={36} className="text-amber-400 shrink-0" />
        <div>
          <h1 className="text-3xl font-extrabold">{torneo.name}</h1>
          <p className="text-slate-400 mt-1">{torneo.description}</p>
        </div>
      </div>

      {/* ── FASE GIRONI ── */}
      {groups.length > 0 && (
        <section className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-6">
            Fase a Gironi
          </h2>
          <div className={`grid ${gridCols} gap-8`}>
            {groups.map((group) => {
              const groupStandings = standings.filter((s) => s.group_name === group)
              const groupMatches = gironeMatches.filter((m) => {
                const home = safeTeams.find((t) => t.id === m.team_home_id)
                const away = safeTeams.find((t) => t.id === m.team_away_id)
                return home?.group_name === group || away?.group_name === group
              })
              return (
                <div key={group} className="space-y-3">
                  <h3 className="font-bold text-lg">{group}</h3>
                  <GironeTable
                    standings={groupStandings}
                    qualifiedIds={allQualifiedIds}
                    allQualified={allQualified}
                  />
                  <GroupMatchesAccordion>
                    {groupMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m as any}
                        homeTeam={safeTeams.find((t) => t.id === m.team_home_id) as any}
                        awayTeam={safeTeams.find((t) => t.id === m.team_away_id) as any}
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
        <section className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4">
            Classifica terze piazzate
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Le 2 migliori terze tra tutti i gironi si qualificano al tabellone finale.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-w-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Squadra</th>
                  <th className="px-3 py-3 font-medium">Girone</th>
                  <th className="px-3 py-3 font-medium">Pt</th>
                  <th className="px-3 py-3 font-medium">Set</th>
                  <th className="px-3 py-3 font-medium">Stato</th>
                </tr>
              </thead>
              <tbody>
                {sortedThirds.map((row, i) => (
                  <tr key={row.team_id} className="border-t border-slate-800 text-slate-300">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      {row.team_name}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-400">{row.group_name}</td>
                    <td className="px-3 py-3 text-center font-bold text-amber-400">{row.points}</td>
                    <td className="px-3 py-3 text-center text-slate-400">{row.sets_won}-{row.sets_lost}</td>
                    <td className="px-3 py-3 text-center">
                      {i < 2 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">Q</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-500 border border-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── SQUADRE QUALIFICATE ── */}
      {(allQualifiedIds.length > 0 || allQualified) && (
        <section className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4">
            Squadre qualificate
          </h2>
          <div className="flex flex-wrap gap-2">
            {allQualified
              ? safeTeams.map((t) => (
                  <span key={t.id} className="flex items-center gap-1.5 text-sm bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={13} />
                    {t.name}
                  </span>
                ))
              : allQualifiedIds.map((id) => {
                  const t = safeTeams.find((x) => x.id === id)
                  return t ? (
                    <span key={id} className="flex items-center gap-1.5 text-sm bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                      <CheckCircle2 size={13} />
                      {t.name}
                    </span>
                  ) : null
                })}
          </div>
        </section>
      )}

      {/* ── ACCOPPIAMENTI PRO (calcolati) ── */}
      {tid === 'pro' && pairings.length > 0 && (
        <section className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-4">
            Quarti di finale — Accoppiamenti
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Accoppiamenti incrociati: 1°A vs 4°B, 2°A vs 3°B, 3°A vs 2°B, 4°A vs 1°B
          </p>
          <div className="space-y-2 max-w-lg">
            {pairings.map(({ homeId, awayId }, i) => {
              const home = safeTeams.find((t) => t.id === homeId)
              const away = safeTeams.find((t) => t.id === awayId)
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
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-6">
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
                      match={m as any}
                      homeTeam={safeTeams.find((t) => t.id === m.team_home_id) as any}
                      awayTeam={safeTeams.find((t) => t.id === m.team_away_id) as any}
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>
      ) : tid === 'ama' ? (
        <section className="mt-4">
          <div className="flex items-center gap-3 bg-slate-900 border border-amber-400/20 rounded-2xl px-6 py-5 max-w-lg">
            <Shuffle size={24} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold">Sorteggio non ancora effettuato</p>
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
