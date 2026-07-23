'use client'
/**
 * hooks/use-events.ts
 * Fetches events through the offline-aware api-client.
 * On network failure it serves cached data from IndexedDB automatically.
 */
import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent } from '@/lib/types'
import { apiFetch } from '@/lib/api-client'
import { getCachedEvents } from '@/lib/offline-db'

export function useEvents() {
  const [events,  setEvents]  = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  // Try cache immediately to avoid blank screen
  useEffect(() => {
    getCachedEvents().then(cached => {
      if (cached && cached.length > 0) {
        setEvents(cached)
        setLoading(false)
      }
    })
  }, [])

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ events: CalendarEvent[] }>('/api/events', { cacheKey: 'events' })
      const evs = data?.events ?? []
      setEvents(evs)
      setOffline(evs.length === 0 && !navigator.onLine)
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { events, loading, offline, refetch: fetch_ }
}

export function getEventsForDate(events: CalendarEvent[], dateStr: string): CalendarEvent[] {
  return events.filter(e => e.date === dateStr)
}

export function getEventsForMonth(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return events.filter(e => e.date.startsWith(prefix))
}
