import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import SpottedForm from './SpottedForm'
import SpottedFeed from './SpottedFeed'

export const revalidate = 0

interface Post { id: string; content: string; created_at: string; likes: number }

export default async function SpottedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: postsRaw } = await supabase
    .from('spotted_feed')
    .select('id, content, created_at, likes')
    .order('created_at', { ascending: false })
    .limit(100)
  const posts = (postsRaw ?? []) as Post[]

  // Like già messi dall'utente (RLS: vede solo i propri)
  let likedIds: string[] = []
  if (user) {
    const { data: likesRaw } = await supabase
      .from('spotted_likes')
      .select('post_id')
      .eq('user_id', user.id)
    likedIds = (likesRaw ?? []).map((l) => l.post_id)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-2">Spotted Beach</h1>
      <p className="text-slate-400 text-sm mb-6">Scrivi qualcosa. Resta anonimo.</p>

      {user ? (
        <SpottedForm />
      ) : (
        <Link
          href="/auth/login?next=/spotted"
          className="flex items-center justify-center gap-2 w-full py-3 mb-8 rounded-full text-sm font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white hover:opacity-90 transition-opacity"
        >
          <LogIn size={16} /> Accedi per scrivere
        </Link>
      )}

      {posts.length > 0 ? (
        <SpottedFeed posts={posts} initialLikedIds={likedIds} isLoggedIn={!!user} />
      ) : (
        <div className="text-center py-16 text-slate-500">
          <p>Ancora nessuno spotted.</p>
        </div>
      )}
    </div>
  )
}
