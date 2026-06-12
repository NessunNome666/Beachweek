import Link from 'next/link'
import { Trophy, ArrowRight } from 'lucide-react'
import { TOURNAMENTS } from '@/lib/mock-data'

const FORMAT_LABEL: Record<string, string> = {
  mixed: 'Gironi + Eliminazione',
  round_robin: 'Girone unico',
  single_elim: 'Eliminazione diretta',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: 'In arrivo', color: 'text-slate-400 bg-slate-800' },
  in_progress: { label: 'In corso', color: 'text-green-400 bg-green-900/40' },
  completed: { label: 'Concluso', color: 'text-slate-500 bg-slate-800' },
}

export default function TorneiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Trophy className="text-amber-400" size={32} />
        I Tornei
      </h1>
      <p className="text-slate-400 mb-10">Seleziona un torneo per vedere gironi, partite e classifiche.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOURNAMENTS.map((t) => {
          const status = STATUS_CONFIG[t.status]
          return (
            <Link
              key={t.id}
              href={`/tornei/${t.slug}`}
              className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <Trophy size={32} className="text-amber-400" />
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                {t.name}
              </h2>
              <p className="text-slate-400 text-sm flex-1 mb-6">{t.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                  {FORMAT_LABEL[t.format]}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-400 group-hover:text-amber-400 transition-colors">
                  Vai al torneo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
