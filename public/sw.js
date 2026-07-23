/**
 * public/sw.js
 * Service Worker — Cache-first strategy for static assets,
 * network-first for API routes, offline fallback page.
 *
 * Also handles SHOW_NOTIFICATION messages from the app.
 */

const CACHE_VERSION = 'ep-v1'
const STATIC_CACHE  = `${CACHE_VERSION}-static`
const API_CACHE     = `${CACHE_VERSION}-api`

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/app-icon.png',
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('ep-') && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET and cross-origin
  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // API routes: network-first, cache fallback (5 min TTL enforced in api-client)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone()
          caches.open(API_CACHE).then(c => c.put(event.request, clone))
          return res
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached
      return fetch(event.request).then(res => {
        if (!res || res.status !== 200) return res
        const clone = res.clone()
        caches.open(STATIC_CACHE).then(c => c.put(event.request, clone))
        return res
      })
    })
  )
})

// ─── Push / postMessage notification ─────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, id } = event.data
    self.registration.showNotification(title, {
      body,
      icon:  '/app-icon.png',
      badge: '/app-icon.png',
      tag:   String(id),
      data:  { id },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  }

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus()
      } else {
        self.clients.open('/')
      }
    })
  )
})
