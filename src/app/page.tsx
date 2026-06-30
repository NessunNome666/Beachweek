import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-[url('/HomescreenBG.png')] bg-cover bg-center flex flex-col"
    >
      <div className="flex-1" />
      <div className="px-5 pb-8">
        <div className="flex gap-3 mb-5">
          <Link
            href="/tornei"
            className="flex-1 text-center font-bold text-white py-4 rounded-full bg-gradient-to-r from-red-700 to-orange-500 hover:opacity-90 transition-opacity shadow-lg"
          >
            Vedi i Tornei
          </Link>
          <Link
            href="/fantacompetizione"
            className="flex-1 text-center font-bold text-white py-4 rounded-full bg-gradient-to-r from-red-600 to-orange-400 hover:opacity-90 transition-opacity shadow-lg"
          >
            Gioca al Fanta
          </Link>
        </div>
        <p className="text-center text-xs text-white/50">
          © 2026 Phœbus Tito Volley — Tito Beach Week
        </p>
      </div>
    </div>
  )
}

