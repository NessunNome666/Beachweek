import Link from 'next/link'
import { Star, Trophy, Lock, Award, ArrowRight } from 'lucide-react'

export default function FantaLandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Star size={56} className="text-amber-400 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold mb-4">Fanta</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Metti alla prova le tue previsioni. Pronostica i risultati delle partite e i vincitori dei tornei per scalare la classifica.
        </p>
      </div>

      {/* Come funziona */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Come funziona</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Star size={24} className="text-amber-400" />,
              title: 'Registrati',
              desc: 'Crea un account con la tua email. Nessuna password necessaria — usiamo un link magico.',
            },
            {
              icon: <Trophy size={24} className="text-amber-400" />,
              title: 'Fai i pronostici',
              desc: 'Ogni mattina dell\'evento, inserisci i punteggi che prevedi per le partite del giorno.',
            },
            {
              icon: <Award size={24} className="text-amber-400" />,
              title: 'Accumula punti',
              desc: 'Guadagni punti per ogni pronostico corretto. Il primo in classifica vince il premio!',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-3">{icon}</div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sistema punteggio */}
      <section className="mb-12 bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Trophy size={20} className="text-amber-400" />
          Sistema di punteggio
        </h2>
        <div className="space-y-4">
          {[
            { pts: '+3', label: 'Risultato esatto', desc: 'Hai indovinato esattamente 2-0, 2-1, 1-2, o 0-2' },
            { pts: '+1', label: 'Vincitore corretto', desc: 'Hai indovinato chi vince ma sbagliato il parziale dei set' },
            { pts: '+5', label: 'Vincitore del torneo', desc: 'Hai indovinato la squadra campione di un torneo' },
          ].map(({ pts, label, desc }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-amber-400 w-12 shrink-0">{pts}</span>
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-slate-400 text-sm">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl flex items-start gap-3 text-sm text-slate-400">
          <Lock size={16} className="text-amber-400 mt-0.5 shrink-0" />
          I pronostici sul vincitore finale si bloccano automaticamente all&apos;inizio della fase a eliminazione di ogni torneo.
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/fantacompetizione/pronostici"
          className="flex items-center justify-center gap-2 bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-amber-300 transition-colors"
        >
          <Star size={18} />
          Inserisci i pronostici
        </Link>
        <Link
          href="/fantacompetizione/classifica"
          className="flex items-center justify-center gap-2 border border-slate-600 text-white font-semibold px-8 py-3 rounded-full hover:border-amber-400 hover:text-amber-400 transition-colors"
        >
          Vedi la classifica
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
