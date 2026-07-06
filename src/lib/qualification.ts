export interface StandingRow {
  team_id: string
  team_name: string
  group_name: string
  tournament_id: string
  matches_played: number
  wins: number
  losses: number
  sets_won: number
  sets_lost: number
  points_scored: number  // punti segnati (per quoziente punti)
  points_conceded: number
  points: number         // punti classifica (3/2/1/0)
}

// Ordinamento girone secondo criteri ufficiali Beach Volley / Foot Volley:
// 1) Punti classifica, 2) Vittorie, 3) Quoz. set, 4) Quoz. punti, 5) Scontri diretti (non implementato nei mock), 6) Ordine originale (sorteggio)
export function sortGroup(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.wins !== a.wins) return b.wins - a.wins
    const aSetRatio = a.sets_lost === 0 ? a.sets_won : a.sets_won / a.sets_lost
    const bSetRatio = b.sets_lost === 0 ? b.sets_won : b.sets_won / b.sets_lost
    if (bSetRatio !== aSetRatio) return bSetRatio - aSetRatio
    const aPtsRatio = a.points_conceded === 0 ? a.points_scored : a.points_scored / a.points_conceded
    const bPtsRatio = b.points_conceded === 0 ? b.points_scored : b.points_scored / b.points_conceded
    return bPtsRatio - aPtsRatio
    // criterio 5 (scontri diretti) e 6 (sorteggio) gestiti dall'ordine stabile di sort
  })
}

// ——————————————————————————————————————————
// TORNEO 1: Beach Volley Amatoriale
// Prime 2 per girone (14) + 2 migliori terze = 16 qualificate
// ——————————————————————————————————————————
export function getQualifiedAmatoriale(
  standings: StandingRow[],
  groups: string[]
): { qualifiedIds: string[]; bestThirdIds: string[] } {
  const qualifiedIds: string[] = []
  const thirds: StandingRow[] = []

  for (const group of groups) {
    const sorted = sortGroup(standings.filter((s) => s.group_name === group))
    if (sorted[0]) qualifiedIds.push(sorted[0].team_id)
    if (sorted[1]) qualifiedIds.push(sorted[1].team_id)
    if (sorted[2]) thirds.push(sorted[2])
  }

  // Ordina le terze tra loro con gli stessi criteri
  const sortedThirds = sortGroup(thirds)
  const bestThirdIds = sortedThirds.slice(0, 2).map((t) => t.team_id)

  return { qualifiedIds, bestThirdIds }
}

// ——————————————————————————————————————————
// TORNEO 2: Beach Volley Pro
// Tutte e 8 ai quarti, accoppiamenti incrociati
// Ritorna array di 4 accoppiamenti [home, away]
// ——————————————————————————————————————————
export function getPairingsPro(
  standings: StandingRow[]
): { homeId: string; awayId: string }[] {
  // I nomi dei due gironi si ricavano dai dati, in ordine alfabetico:
  // "DE GIORGI" < "VELASCO", quindi groupA = De Giorgi (il "primo" girone).
  const groupNames = [...new Set(standings.map((s) => s.group_name))].sort()
  const groupA = sortGroup(standings.filter((s) => s.group_name === groupNames[0]))
  const groupB = sortGroup(standings.filter((s) => s.group_name === groupNames[1]))

  // Topologia confermata dall'organizzazione (S1 = vinc Q1 × vinc Q2):
  // Q1 = 1ª De Giorgi × 4ª Velasco
  // Q2 = 2ª Velasco  × 3ª De Giorgi
  // Q3 = 2ª De Giorgi × 3ª Velasco
  // Q4 = 4ª De Giorgi × 1ª Velasco
  return [
    { homeId: groupA[0]?.team_id, awayId: groupB[3]?.team_id },
    { homeId: groupB[1]?.team_id, awayId: groupA[2]?.team_id },
    { homeId: groupA[1]?.team_id, awayId: groupB[2]?.team_id },
    { homeId: groupA[3]?.team_id, awayId: groupB[0]?.team_id },
  ].filter((p) => p.homeId && p.awayId) as { homeId: string; awayId: string }[]
}

// ——————————————————————————————————————————
// TORNEO 3: Foot Volley
// Prime 2 per girone (8 qualificate) ai quarti
// ——————————————————————————————————————————
export function getQualifiedFootVolley(
  standings: StandingRow[],
  groups: string[]
): string[] {
  const qualifiedIds: string[] = []
  for (const group of groups) {
    const sorted = sortGroup(standings.filter((s) => s.group_name === group))
    if (sorted[0]) qualifiedIds.push(sorted[0].team_id)
    if (sorted[1]) qualifiedIds.push(sorted[1].team_id)
  }
  return qualifiedIds
}
