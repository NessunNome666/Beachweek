import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Star, Calendar, ArrowRight } from 'lucide-react'
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

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold bg-amber-400/10 px-3 py-1.5 rounded-full">
            <Calendar size={14} />
            Giugno 2026
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
            Torneo Volley<br />
            <span className="text-amber-400">2026</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Tre tornei di pallavolo, risultati in tempo reale e la tua chance di vincere la fantacompetizione.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tornei"
              className="flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3 rounded-full hover:bg-amber-400 transition-colors"
            >
              <Trophy size={18} />
              Vedi i tornei
            </Link>
            <Link
              href="/fantacompetizione"
              className="flex items-center gap-2 border border-slate-600 text-white font-semibold px-6 py-3 rounded-full hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              <Star size={18} />
              Gioca al fanta
            </Link>
          </div>
        </div>

        <div className="lg:w-80 xl:w-96">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-amber-400/10 border border-slate-800">
            <Image
              src="/locandina.png"
              alt="Locandina Torneo Volley 2026"
              width={600}
              height={800}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Tornei */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Trophy className="text-amber-400" size={24} />
          I tornei dell&apos;evento
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOURNAMENTS.map((t) => {
            const status = STATUS_CONFIG[t.status]
            return (
              <Link
                key={t.id}
                href={`/tornei/${t.slug}`}
                className="group block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Trophy size={28} className="text-amber-400" />
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                    {FORMAT_LABEL[t.format]}
                  </span>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA Fanta */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-8 text-center">
          <Star size={40} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Gioca alla Fantacompetizione</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Pronostica i risultati delle partite e i vincitori dei tornei. Accumula punti e scala la classifica. Il primo classificato verrà premiato!
          </p>
          <div className="flex flex-wrap justify-center gap-10 mb-8 text-sm">
            {[
              { pts: '3 pt', label: 'Risultato esatto' },
              { pts: '1 pt', label: 'Vincitore corretto' },
              { pts: '5 pt', label: 'Vincitore torneo' },
            ].map(({ pts, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-amber-400">{pts}</div>
                <div className="text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/fantacompetizione"
            className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-amber-300 transition-colors"
          >
            <Star size={18} />
            Partecipa ora
          </Link>
        </div>
      </section>
    </div>
  )
}
