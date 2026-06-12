// Punti classifica per partita: 2-0 → [3,0], 2-1 → [2,1]
export function calculateStandingPoints(scoreHome: number, scoreAway: number): [number, number] {
  if (scoreHome === 2 && scoreAway === 0) return [3, 0]
  if (scoreHome === 2 && scoreAway === 1) return [2, 1]
  if (scoreHome === 0 && scoreAway === 2) return [0, 3]
  if (scoreHome === 1 && scoreAway === 2) return [1, 2]
  return [0, 0]
}

// Punti fanta per pronostico
export function calculateMatchPoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3
  const predictedWinner = predictedHome > predictedAway ? 'home' : 'away'
  const actualWinner = actualHome > actualAway ? 'home' : 'away'
  if (predictedWinner === actualWinner) return 1
  return 0
}

export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return '- : -'
  return `${home} - ${away}`
}

export const WINNER_POINTS = 5
export const EXACT_SCORE_POINTS = 3
export const CORRECT_WINNER_POINTS = 1

export const VALID_VOLLEYBALL_SCORES: [number, number][] = [
  [2, 0],
  [2, 1],
  [0, 2],
  [1, 2],
]
