import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const fantaHref = user ? '/fantacompetizione/pronostici' : '/fantacompetizione'

  return (
    <div
      className="relative min-h-dvh bg-[url('/HomescreenBG.png')] bg-cover bg-center flex flex-col"
    >
      <div className="flex-1" />
      <div className="px-5 pb-8">
        <div className="flex gap-3 mb-5">
          <Link
            href="/tornei"
            className="flex-1 text-center font-bold text-white py-4 rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 transition-opacity shadow-lg"
          >
            Vedi i tornei
          </Link>
          <Link
            href={fantaHref}
            className="flex-1 text-center font-bold text-white py-4 rounded-full bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 transition-opacity shadow-lg"
          >
            Gioca al Fanta
          </Link>
        </div>
        <p className="text-center text-xs text-white/50">
          &copy; 2026 Phœbus Tito Volley &mdash; Tito Beach Week
        </p>
      </div>
    </div>
  )
}

