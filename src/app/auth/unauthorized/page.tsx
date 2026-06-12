import { ShieldX } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <ShieldX size={56} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Accesso negato</h1>
        <p className="text-slate-400 text-sm mb-6">
          Non hai i permessi per accedere a questa pagina.
          Solo gli amministratori possono entrare nell&apos;area admin.
        </p>
        <Link
          href="/"
          className="inline-block bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-full hover:bg-amber-300 transition-colors text-sm"
        >
          Torna alla home
        </Link>
      </div>
    </main>
  )
}
