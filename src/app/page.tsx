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
  upcoming: { label: 'In arrivo', color: 'text-fuchsia-300 bg-fuchsia-900/30' },
  in_progress: { label: 'In corso', color: 'text-orange-300 bg-orange-900/40' },
  completed: { label: 'Concluso', color: 'text-slate-500 bg-purple-950/60' },
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-semibold bg-orange-500/15 px-3 py-1.5 rounded-full">
            <Calendar size={14} />
            Luglio 2026
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
            Tito Beach Week<br />
            <span className="bg-gradient-to-r from-orange-400 to-fuchsia-400 bg-clip-text text-transparent">2026</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Tre tornei sulla sabbia, risultati in tempo reale e la tua chance di vincere la fantacompetizione.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tornei"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-full hover:from-orange-400 hover:to-fuchsia-500 transition-all shadow-lg shadow-orange-900/40"
            >
              <Trophy size={18} />
              Vedi i tornei
            </Link>
            <Link
              href="/fantacompetizione"
              className="flex items-center gap-2 border border-orange-700/60 text-white font-semibold px-6 py-3 rounded-full hover:border-orange-400 hover:text-orange-400 transition-colors"
            >
              <Star size={18} />
              Gioca al fanta
            </Link>
          </div>
        </div>

        <div className="lg:w-80 xl:w-96">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 border border-orange-900/40 ring-1 ring-fuchsia-800/20">
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
          <Trophy className="text-orange-400" size={24} />
          I tornei dell&apos;evento
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOURNAMENTS.map((t) => {
            const status = STATUS_CONFIG[t.status]
            return (
              <Link
                key={t.id}
                href={`/tornei/${t.slug}`}
                className="group block bg-[#160a2e] border border-purple-900/50 rounded-2xl p-6 hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-900/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Trophy size={28} className="text-orange-400" />
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 bg-purple-950/60 px-2 py-1 rounded-md">
                    {FORMAT_LABEL[t.format]}
                  </span>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA Fanta */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-orange-900/20 via-fuchsia-900/20 to-purple-900/20 border border-orange-700/30 rounded-2xl p-8 text-center">
          <Star size={40} className="text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Gioca alla Fanta</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Pronostica i risultati delle partite e i vincitori dei tornei. Accumula punti e scala la classifica. Il primo classificato verrà premiato!
          </p>
          <div className="flex flex-wrap justify-center gap-10 mb-8 text-sm">
            {[
              { pts: '3 pt', label: 'Risultato esatto' },
              { pts: '1 pt', label: 'Vincitore corretto' },
              { pts: '5 pt', label: 'Podio torneo' },
            ].map(({ pts, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-orange-400">{pts}</div>
                <div className="text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/fantacompetizione"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-fuchsia-600 text-white font-bold px-8 py-3 rounded-full hover:from-orange-400 hover:to-fuchsia-500 transition-all shadow-lg shadow-orange-900/40"
          >
            <Star size={18} />
            Partecipa ora
          </Link>
        </div>
      </section>
    </div>
  )
}
