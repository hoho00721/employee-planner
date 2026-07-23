'use client'
/**
 * components/ServiceWorkerRegistrar.tsx
 * Registers /sw.js on mount (client-only).
 * Also wires up the offline sync-queue flush via initNetworkWatcher.
 */
import { useEffect } from 'react'
import { initNetworkWatcher } from '@/lib/api-client'
import { toast } from 'sonner'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[SW] registered, scope:', reg.scope)
          // Check for updates periodically
          reg.update().catch(() => {})
        })
        .catch(err => console.warn('[SW] registration failed:', err))
    }

    // Wire network watcher — flushes offline queue on reconnect
    const cleanup = initNetworkWatcher((count) => {
      toast.success(`تمت مزامنة ${count} عملية محفوظة أثناء الانقطاع ✅`)
    })

    return cleanup
  }, [])

  return null
}
