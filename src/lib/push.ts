import webpush from 'web-push'

/** Configurazione VAPID lazy (una volta per processo). */
let configured = false
function configure() {
  if (configured) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:fgiuzio04@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  configured = true
}

export interface PushSub {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Invia il payload a tutte le subscription passate. Ritorna gli `id` delle
 * subscription non più valide (HTTP 404/410) così il chiamante può eliminarle.
 */
export async function sendPushToAll(subs: PushSub[], payload: PushPayload): Promise<string[]> {
  configure()
  const body = JSON.stringify(payload)
  const dead: string[] = []

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        )
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        // 404/410 = subscription scaduta o revocata → va rimossa
        if (status === 404 || status === 410) dead.push(s.id)
      }
    })
  )

  return dead
}
