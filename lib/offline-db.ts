/**
 * lib/offline-db.ts
 * IndexedDB wrapper using `idb` — mirrors the server schema locally.
 * Used as fallback cache when the network / server is unreachable, and
 * as the primary store when running inside Capacitor (native Android).
 *
 * All tables match the server schema fields exactly so sync is trivial.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CalendarEvent } from '@/lib/types'

// ─── Schema ──────────────────────────────────────────────────────────────────

interface EPSchema extends DBSchema {
  profile: {
    key: number
    value: {
      id: number
      fullName: string
      gender?: string
      birthDate?: string
      jobTitle?: string
      employer?: string
      city?: string
      language: 'ar' | 'fr'
      theme: 'dark' | 'light'
      accentColor: string
      birthdayReminderDays: number
    }
  }
  tasks: {
    key: number
    value: {
      id: number
      title: string
      date: string
      time?: string
      notes?: string
      reminderMinutesBefore: number
      completed: boolean
      archived: boolean
    }
    indexes: { 'by-date': string }
  }
  appointments: {
    key: number
    value: {
      id: number
      title: string
      date: string
      time?: string
      notes?: string
      reminderMinutesBefore: number
      archived: boolean
    }
    indexes: { 'by-date': string }
  }
  occasions: {
    key: number
    value: {
      id: number
      title: string
      date: string
      time?: string
      notes?: string
      reminderMinutesBefore: number
      recurring: boolean
      archived: boolean
    }
    indexes: { 'by-date': string }
  }
  vacations: {
    key: number
    value: {
      id: number
      title: string
      type: 'annual' | 'compensatory'
      startDate: string
      endDate: string
      days: number
      notes?: string
      reminderDaysBefore: number
      archived: boolean
    }
    indexes: { 'by-date': string }
  }
  notes: {
    key: number
    value: {
      id: number
      title: string
      content?: string
      date: string
      time?: string
      archived: boolean
    }
    indexes: { 'by-date': string }
  }
  events_cache: {
    key: string          // 'all'
    value: {
      key: string
      events: CalendarEvent[]
      cachedAt: number
    }
  }
  sync_queue: {
    key: number
    value: {
      id?: number
      action: 'POST' | 'PUT' | 'DELETE'
      endpoint: string
      body: Record<string, unknown>
      createdAt: number
    }
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const DB_NAME = 'employee-planner'
const DB_VERSION = 1

let _db: IDBPDatabase<EPSchema> | null = null

export async function getDB(): Promise<IDBPDatabase<EPSchema>> {
  if (_db) return _db
  _db = await openDB<EPSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // profile
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' })
      }
      // tasks
      if (!db.objectStoreNames.contains('tasks')) {
        const ts = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })
        ts.createIndex('by-date', 'date')
      }
      // appointments
      if (!db.objectStoreNames.contains('appointments')) {
        const as = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true })
        as.createIndex('by-date', 'date')
      }
      // occasions
      if (!db.objectStoreNames.contains('occasions')) {
        const os = db.createObjectStore('occasions', { keyPath: 'id', autoIncrement: true })
        os.createIndex('by-date', 'date')
      }
      // vacations
      if (!db.objectStoreNames.contains('vacations')) {
        const vs = db.createObjectStore('vacations', { keyPath: 'id', autoIncrement: true })
        vs.createIndex('by-date', 'startDate')
      }
      // notes
      if (!db.objectStoreNames.contains('notes')) {
        const ns = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
        ns.createIndex('by-date', 'date')
      }
      // events cache
      if (!db.objectStoreNames.contains('events_cache')) {
        db.createObjectStore('events_cache', { keyPath: 'key' })
      }
      // sync queue (for offline writes)
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
  return _db
}

// ─── Events cache ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function getCachedEvents(): Promise<CalendarEvent[] | null> {
  try {
    const db = await getDB()
    const cached = await db.get('events_cache', 'all')
    if (!cached) return null
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) return null
    return cached.events
  } catch {
    return null
  }
}

export async function setCachedEvents(events: CalendarEvent[]): Promise<void> {
  try {
    const db = await getDB()
    await db.put('events_cache', { key: 'all', events, cachedAt: Date.now() })
  } catch {
    // non-critical
  }
}

export async function invalidateEventsCache(): Promise<void> {
  try {
    const db = await getDB()
    await db.delete('events_cache', 'all')
  } catch {}
}

// ─── Sync Queue (offline writes) ──────────────────────────────────────────────

export async function enqueueSync(
  action: 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body: Record<string, unknown>
): Promise<void> {
  const db = await getDB()
  await db.add('sync_queue', { action, endpoint, body, createdAt: Date.now() })
}

export async function flushSyncQueue(): Promise<number> {
  const db = await getDB()
  const all = await db.getAll('sync_queue')
  if (all.length === 0) return 0
  let flushed = 0
  for (const item of all) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.action,
        headers: { 'Content-Type': 'application/json' },
        body: item.action !== 'DELETE' ? JSON.stringify(item.body) : undefined,
      })
      if (res.ok) {
        if (item.id !== undefined) await db.delete('sync_queue', item.id)
        flushed++
      }
    } catch {
      // keep in queue — will retry next time
    }
  }
  if (flushed > 0) await invalidateEventsCache()
  return flushed
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB()
  return db.count('sync_queue')
}
