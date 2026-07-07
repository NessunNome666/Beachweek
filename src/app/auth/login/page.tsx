import LoginForm from './LoginForm'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  const title = next?.startsWith('/mvp') ? "Accedi per votare l'MVP" : 'Accedi al Fanta'
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400 text-sm mb-6">
        Inserisci la tua email. Ti invieremo un link magico per accedere &mdash; nessuna password necessaria.
      </p>
      {error === 'auth_callback_error' && (
        <p className="text-red-400 text-sm mb-6 bg-red-400/10 px-4 py-3 rounded-lg">
          Il link è scaduto o non valido. Richiedi un nuovo link.
        </p>
      )}
      <LoginForm next={next} />
    </div>
  )
}

