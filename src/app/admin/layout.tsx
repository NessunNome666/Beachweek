import { Shield, CalendarDays, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single() as unknown as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) redirect('/auth/unauthorized')

  return (
    <div>
      <div className="bg-red-900/20 border-b border-red-800/40 px-4 py-2 flex items-center justify-between text-sm text-red-400">
        <span className="flex items-center gap-2">
          <Shield size={14} />
          Area Amministrazione — accesso riservato
        </span>
        <div className="flex items-center gap-4">
          <Link href="/admin/calendario" className="flex items-center gap-1.5 hover:text-red-300 transition-colors">
            <CalendarDays size={13} />
            Calendario
          </Link>
          <Link href="/admin/partite" className="flex items-center gap-1.5 hover:text-red-300 transition-colors">
            <ClipboardList size={13} />
            Risultati
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}
