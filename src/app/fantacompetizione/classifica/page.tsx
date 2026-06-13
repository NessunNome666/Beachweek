import { Trophy, Medal } from 'lucide-react'
import { FANTA_LEADERBOARD } from '@/lib/mock-data'

export default function FantaClassificaPage() {
  const sorted = [...FANTA_LEADERBOARD].sort((a, b) => b.total_points - a.total_points)

  const podiumColors = ['text-amber-400', 'text-slate-300', 'text-amber-600']

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Trophy className="text-amber-400" size={32} />
        Classifica Fanta
      </h1>
      <p className="text-slate-400 mb-10">Aggiornata in tempo reale dopo ogni partita.</p>

      <div className="space-y-3">
        {sorted.map((row, i) => (
          <div
            key={row.user_id}
            className={`flex items-center gap-4 bg-slate-900 border rounded-xl px-5 py-4 ${
              i === 0
                ? 'border-amber-400/50 shadow-lg shadow-amber-400/10'
                : 'border-slate-800'
            }`}
          >
            <span className={`text-xl font-extrabold w-8 text-center ${podiumColors[i] ?? 'text-slate-500'}`}>
              {i + 1}
            </span>
            {i < 3 && <Medal size={20} className={podiumColors[i]} />}
            <div className="flex-1">
              <div className="font-semibold">{row.display_name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {row.correct_exact} esatti · {row.correct_winner} vincitori · {row.winner_points > 0 ? `+${row.winner_points}pt torneo` : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-400">{row.total_points}</div>
              <div className="text-xs text-slate-500">punti</div>
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessun punteggio ancora. Sii il primo a partecipare!</p>
        </div>
      )}
    </div>
  )
}
