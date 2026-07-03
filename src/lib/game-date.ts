// Utility di raggruppamento per "giornata" del torneo.
// Confine giornata alle 06:00 ora di Roma: le partite dopo mezzanotte
// appartengono al giorno precedente. Fonte unica usata da /partite,
// /fantacompetizione/pronostici e /admin/partite.

export function toGameDate(iso: string): string {
  return new Date(new Date(iso).getTime() - 6 * 60 * 60 * 1000)
    .toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
}

// Indice progressivo (1-based) di una giornata rispetto alla prima.
// dateKey e firstDateKey sono stringhe 'YYYY-MM-DD' prodotte da toGameDate.
export function dayNumber(dateKey: string, firstDateKey: string): number {
  return Math.round(
    (new Date(dateKey).getTime() - new Date(firstDateKey).getTime()) / 86400000
  ) + 1
}
