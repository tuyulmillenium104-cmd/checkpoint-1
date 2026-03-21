// GenLayer Event Alarm Service Worker
// This enables notifications even when the browser tab is in background

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated')
  event.waitUntil(self.clients.claim())
})

// Handle push events (for future use with push server)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'GenLayer Event Alarm'
  const body = data.body || 'Event notification'
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: '/genlayer-logo.jpg',
      badge: '/genlayer-logo.jpg',
      tag: data.tag || 'genlayer-alarm',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: data
    })
  )
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If app is already open, focus it
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
