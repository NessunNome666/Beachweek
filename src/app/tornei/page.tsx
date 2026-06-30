import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TOURNAMENTS } from '@/lib/mock-data'

export const revalidate = 0

const DESCRIPTION: Record<string, string> = {
  'beach-volley-amatoriale': '28 squadre, 7 gironi. Le migliori 16 accedono al tabellone finale.',
  'beach-volley-pro': '8 squadre, 2 gironi. Tutte ai quarti di finale con accoppiamenti incrociati.',
  'foot-volley-2v2': '16 squadre, 4 gironi. Le prime 2 per girone accedono ai quarti.',
}

export default async function TorneiPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any
  const { data } = await sb.from('tournaments').select('id, name, slug').order('name')
  const fromDb = (data ?? []) as { id: string; name: string; slug: string }[]

  // Fallback ai dati mock finchÃ© il DB non Ã¨ popolato
  const tournaments = fromDb.length > 0 ? fromDb : TOURNAMENTS

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <h1 className="text-3xl font-bold text-white mb-4">I Tornei</h1>

      <div className="flex flex-col gap-4">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={`/tornei/${t.slug}`}
            className="group block bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-colors"
          >
            <h2 className="text-lg font-bold text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">
              {t.name}
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              {DESCRIPTION[t.slug] ?? ''}
            </p>
            <span className="text-slate-400 text-sm">Vai al torneo â†’</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

