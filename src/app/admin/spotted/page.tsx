import { createClient } from '@/lib/supabase/server'
import AdminSpottedManager from './AdminSpottedManager'

export const revalidate = 0

interface PostRow { id: string; content: string; status: string; created_at: string }
interface FeedRow { id: string; likes: number }

export default async function AdminSpottedPage() {
  const supabase = await createClient()

  // La policy admin dà visibilità completa; user_id volutamente NON selezionato
  // (l'anonimato vale anche nella UI admin)
  const { data: postsRaw } = await supabase
    .from('spotted_posts')
    .select('id, content, status, created_at')
    .order('created_at', { ascending: false })
  const posts = (postsRaw ?? []) as PostRow[]

  const { data: feedRaw } = await supabase
    .from('spotted_feed')
    .select('id, likes')
  const likesById = Object.fromEntries(
    ((feedRaw ?? []) as FeedRow[]).map((f) => [f.id, f.likes])
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-2">Spotted Beach</h1>
      <p className="text-slate-400 text-sm mb-6">Moderazione segnalazioni.</p>
      <AdminSpottedManager posts={posts} likesById={likesById} />
    </div>
  )
}
