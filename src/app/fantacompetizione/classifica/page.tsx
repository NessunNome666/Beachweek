import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

interface LeaderboardRow {
  user_id: string
  display_name: string
  total_points: number
  match_points: number
  winner_points: number
  correct_exact: number
  correct_winner: number
}

const MEDALS = ['🥇', '🥈', '🥉']

export default async function FantaClassificaPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from('fanta_leaderboard').select('*')
  const sorted = (data ?? []) as LeaderboardRow[]

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-3xl font-bold text-white mb-4">Classifica Fanta</h1>

      <div className="flex flex-col gap-3">
        {sorted.map((row, i) => (
          <div
            key={row.user_id}
            className={`flex items-center gap-4 bg-slate-800/60 border rounded-xl px-5 py-4 ${
              i === 0 ? 'border-yellow-500/60' : 'border-slate-700'
            }`}
          >
            <span className="text-xl font-bold text-white w-6 text-center">{i + 1}</span>
            {i < 3 && <span className="text-xl">{MEDALS[i]}</span>}
            <span className="flex-1 font-semibold text-white">{row.display_name}</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-400">{row.total_points}</div>
              <div className="text-xs text-slate-500">punti</div>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>Nessun punteggio ancora. Sii il primo a partecipare!</p>
        </div>
      )}
    </div>
  )
}

