import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2">Accedi</h1>
          <p className="text-slate-400 text-sm mb-8">
            Inserisci la tua email. Ti invieremo un link magico per accedere senza password.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
