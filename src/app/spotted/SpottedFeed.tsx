'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Post { id: string; content: string; created_at: string; likes: number }

interface Props {
  posts: Post[]
  initialLikedIds: string[]
  isLoggedIn: boolean
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Rome' })
  const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })
  return `${date} · ${time}`
}

export default function SpottedFeed({ posts, initialLikedIds, isLoggedIn }: Props) {
  const [liked, setLiked] = useState<Set<string>>(new Set(initialLikedIds))
  // Correzione ottimistica rispetto al conteggio arrivato dal server
  const [delta, setDelta] = useState<Record<string, number>>({})
  const [busy, setBusy] = useState<Set<string>>(new Set())

  async function toggleLike(postId: string) {
    if (!isLoggedIn || busy.has(postId)) return
    const wasLiked = liked.has(postId)

    setBusy((prev) => new Set(prev).add(postId))
    setLiked((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.delete(postId)
      else next.add(postId)
      return next
    })
    setDelta((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + (wasLiked ? -1 : 1) }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let failed = !user
    if (user) {
      if (wasLiked) {
        const { error } = await supabase
          .from('spotted_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        failed = !!error
      } else {
        const { error } = await supabase
          .from('spotted_likes')
          .insert({ post_id: postId, user_id: user.id })
        // 23505 = like già presente (stato disallineato): il toggle resta valido
        failed = !!error && error.code !== '23505'
      }
    }

    if (failed) {
      setLiked((prev) => {
        const next = new Set(prev)
        if (wasLiked) next.add(postId)
        else next.delete(postId)
        return next
      })
      setDelta((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + (wasLiked ? 1 : -1) }))
    }
    setBusy((prev) => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const isLiked = liked.has(post.id)
        const count = Math.max(0, post.likes + (delta[post.id] ?? 0))
        return (
          <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <p className="text-slate-300 text-sm whitespace-pre-line break-words mb-2">
              {post.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">{formatWhen(post.created_at)}</span>
              {isLoggedIn ? (
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 p-2 -m-2 transition-colors ${
                    isLiked ? 'text-orange-400' : 'text-slate-500 hover:text-orange-400'
                  }`}
                  aria-label={isLiked ? 'Togli il like' : 'Metti like'}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  <span className="text-xs font-mono">{count}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Heart size={16} />
                  <span className="text-xs font-mono">{count}</span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
