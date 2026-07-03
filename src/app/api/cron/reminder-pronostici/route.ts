import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPushToAll, type PushSub } from '@/lib/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Promemoria giornaliero "metti i pronostici".
// Invocata dal cron di Vercel (vedi vercel.json). Vercel aggiunge in automatico
// l'header Authorization: Bearer <CRON_SECRET> quando la env CRON_SECRET è impostata.
export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
  const subs = (data ?? []) as PushSub[]

  if (subs.length === 0) return NextResponse.json({ sent: 0 })

  const dead = await sendPushToAll(subs, {
    title: '🏐 Tito Beach Week',
    body: 'Non dimenticare i pronostici di oggi! Tocca per giocare.',
    url: '/fantacompetizione/pronostici',
    tag: 'reminder-pronostici',
  })

  if (dead.length) await admin.from('push_subscriptions').delete().in('id', dead)

  return NextResponse.json({ sent: subs.length - dead.length, removed: dead.length })
}
