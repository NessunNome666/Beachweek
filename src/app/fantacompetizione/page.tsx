export default function FantaLandingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-3xl font-bold text-white mb-4">Fanta</h1>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-orange-400 mb-4">Come funziona</h2>
        <div className="flex flex-col gap-3">
          {[
            {
              title: 'Registrati',
              desc: 'Crea un account con la tua email. Nessuna password necessaria — usiamo un link magico.',
            },
            {
              title: 'Fai i pronostici',
              desc: "Inserisci i risultati che prevedi prima dell'inizio di ogni partita. Pronostica il podio prima della fine dei gironi.",
            },
            {
              title: 'Accumula punti',
              desc: 'Guadagni punti per ogni pronostico corretto. Il primo in classifica vince il premio!',
            },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-slate-300 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-orange-400 mb-6">Sistema di punteggio</h2>
        <div className="flex flex-col gap-6">
          {[
            { pts: '+3', label: 'Risultato esatto', desc: 'Hai indovinato esattamente 2-0, 2-1, 1-2, o 0-2' },
            { pts: '+1', label: 'Vincitore corretto', desc: 'Hai indovinato chi vince ma sbagliato il parziale' },
            { pts: '+5', label: '1° posto torneo', desc: 'Hai indovinato il campione del torneo' },
            { pts: '+5', label: '2° posto torneo', desc: 'Hai indovinato il 2° classificato del torneo' },
            { pts: '+5', label: '3° posto torneo', desc: 'Hai indovinato il 3° classificato del torneo' },
          ].map(({ pts, label, desc }) => (
            <div key={label} className="flex items-start gap-5">
              <span className="text-4xl font-bold text-orange-400 w-14 shrink-0">{pts}</span>
              <div>
                <div className="font-bold text-white">{label}</div>
                <div className="text-slate-300 text-sm mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

