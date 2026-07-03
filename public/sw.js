/* Service worker Tito Beach Week — solo notifiche push (nessuna cache offline). */

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Tito Beach Week 2026'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon.png',
    badge: '/favicon.png',
    tag: data.tag,
    renotify: Boolean(data.tag),
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(target) && 'focus' in client) return client.focus()
        }
        if (self.clients.openWindow) return self.clients.openWindow(target)
      })
  )
})
