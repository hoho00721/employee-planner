'use client'
/**
 * hooks/use-network.ts
 * Reactive online/offline state + sync queue count.
 * Safe for SSR and Capacitor.
 */
import { useState, useEffect } from 'react'
import { getSyncQueueCount } from '@/lib/offline-db'

export function useNetwork() {
  const [online, setOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline  = () => { setOnline(true);  refreshQueue() }
    const handleOffline = () => { setOnline(false); refreshQueue() }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    refreshQueue()

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function refreshQueue() {
    const n = await getSyncQueueCount()
    setPendingSync(n)
  }

  return { online, pendingSync }
}
