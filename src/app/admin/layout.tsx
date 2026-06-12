import { Shield } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-red-900/20 border-b border-red-800/40 px-4 py-2 flex items-center gap-2 text-sm text-red-400">
        <Shield size={14} />
        Area Amministrazione — accesso riservato
      </div>
      {children}
    </div>
  )
}
