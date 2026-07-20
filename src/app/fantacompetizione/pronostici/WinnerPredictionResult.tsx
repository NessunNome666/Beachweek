import { CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  placement: 1 | 2 | 3
  predictedTeamName?: string
  actualTeamName?: string
  points: number
}

const PLACEMENT_LABEL: Record<number, string> = {
  1: '1° posto — Vincitore',
  2: '2° posto — Finalista',
  3: '3° posto',
}

export default function WinnerPredictionResult({ placement, predictedTeamName, actualTeamName, points }: Props) {
  const hasPrediction = !!predictedTeamName
  const correct = points > 0

  return (
    <div className={`border rounded-xl p-4 ${
      !hasPrediction
        ? 'bg-slate-900 border-slate-800'
        : correct
          ? 'bg-green-950/40 border-green-700/40'
          : 'bg-red-950/30 border-red-800/30'
    }`}>
      <p className="text-xs font-semibold text-slate-400 mb-2">{PLACEMENT_LABEL[placement]}</p>

      <div className="text-sm text-slate-400">
        {hasPrediction ? (
          <span>Il tuo pronostico: <span className="font-semibold text-white">{predictedTeamName}</span></span>
        ) : (
          <span className="text-slate-600 italic">Nessun pronostico inserito</span>
        )}
      </div>

      {actualTeamName && (
        <div className="text-sm text-slate-400 mt-1">
          Risultato reale: <span className="font-semibold text-slate-300">{actualTeamName}</span>
        </div>
      )}

      {hasPrediction && (
        <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${correct ? 'text-green-400' : 'text-red-400'}`}>
          {correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {correct ? 'Pronostico corretto' : 'Pronostico sbagliato'}
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
            correct ? 'bg-green-900/50 text-green-300' : 'bg-red-900/30 text-red-400'
          }`}>
            +{points} pt
          </span>
        </div>
      )}
    </div>
  )
}
