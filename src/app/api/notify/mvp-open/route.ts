import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushToAll, type PushSub } from '@/lib/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Notifica "è aperta la votazione MVP". Chiamata dall'admin quando apre la
// votazione. Idempotente: invia una sola volta per apertura (mvp_notified_at).
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Solo admin
  const { data: profile } = await admin
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!(profile as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const tournamentId = body?.tournamentId
  if (!tournamentId) return NextResponse.json({ error: 'missing tournamentId' }, { status: 400 })

  const { data: t } = await admin
    .from('tournaments')
    .select('id, name, mvp_status, mvp_notified_at')
    .eq('id', tournamentId)
    .single()
  const tour = t as { name: string; mvp_status: string; mvp_notified_at: string | null } | null

  if (!tour) return NextResponse.json({ error: 'not found' }, { status: 404 })
  if (tour.mvp_status !== 'open') return NextResponse.json({ error: 'not open' }, { status: 400 })
  if (tour.mvp_notified_at) return NextResponse.json({ ok: true, skipped: 'already notified' })

  const { data: subData } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
  const subs = (subData ?? []) as PushSub[]

  const dead = subs.length
    ? await sendPushToAll(subs, {
        title: '⭐ Vota il tuo MVP!',
        body: `È aperta la votazione MVP per ${tour.name}. Tocca per votare.`,
        url: '/mvp',
        tag: 'mvp-open',
      })
    : []

  if (dead.length) await admin.from('push_subscriptions').delete().in('id', dead)

  // Marca come notificato (il trigger azzera il flag quando la votazione si chiude/nasconde)
  await admin
    .from('tournaments')
    .update({ mvp_notified_at: new Date().toISOString() })
    .eq('id', tournamentId)

  return NextResponse.json({ ok: true, sent: subs.length - dead.length })
}
