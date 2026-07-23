/**
 * lib/api-client.ts
 * Thin fetch wrapper that:
 *   1. Tries the real server API
 *   2. On network failure → falls back to IndexedDB cache (GET) or sync queue (mutations)
 *   3. When back online → flushSyncQueue() is called automatically
 *
 * All app API calls should use apiFetch() instead of raw fetch() so they
 * work identically in the browser, PWA offline mode, and Capacitor.
 */

import { isOnline } from './platform'
import {
  getCachedEvents, setCachedEvents,
  enqueueSync, flushSyncQueue, getSyncQueueCount,
} from './offline-db'

// ─── Types ────────────────────────────────────────────────────────────────────

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  /** For GET responses — key in the JSON where the array/object lives */
  cacheKey?: 'events'
}

// ─── Core ──────────────────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  endpoint: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, cacheKey } = opts
  const online = isOnline()

  // ── GET: try network first, fall back to cache ──────────────────────────────
  if (method === 'GET') {
    if (online) {
      try {
        const res = await fetch(endpoint, { method: 'GET' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as T

        // Prime events cache
        if (cacheKey === 'events' && Array.isArray((data as Record<string, unknown>)[cacheKey])) {
          await setCachedEvents((data as Record<string, unknown[]>)[cacheKey] as never)
        }

        return data
      } catch {
        // fall through to cache
      }
    }

    // Offline or network error — return cached events
    if (cacheKey === 'events') {
      const cached = await getCachedEvents()
      if (cached) return { events: cached } as T
    }

    // Return empty payload rather than throwing
    return {} as T
  }

  // ── Mutations: try network, queue on failure ────────────────────────────────
  if (online) {
    try {
      const fetchOpts: RequestInit = {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body:    body ? JSON.stringify(body) : undefined,
      }
      const res = await fetch(endpoint, fetchOpts)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as T
    } catch {
      // fall through to queue
    }
  }

  // Queue for later sync
  await enqueueSync(method as 'POST' | 'PUT' | 'DELETE', endpoint, body ?? {})
  return { queued: true } as T
}

// ─── Online/offline event wiring ──────────────────────────────────────────────
// Called once from app root so we flush as soon as connectivity returns.

export function initNetworkWatcher(onFlushed?: (count: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = async () => {
    const count = await flushSyncQueue()
    if (count > 0) onFlushed?.(count)
  }

  window.addEventListener('online', handleOnline)
  // Also try to flush on first load (may have queued items from previous session)
  getSyncQueueCount().then(n => { if (n > 0) handleOnline() })

  return () => window.removeEventListener('online', handleOnline)
}
