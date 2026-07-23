/**
 * lib/notifications.ts
 * Unified local notification interface.
 *
 * • Web / PWA:  uses the browser Notification API + service worker
 *               (scheduleLocalNotification stores to IDB, SW fires on next check).
 * • Capacitor:  delegates to @capacitor/local-notifications (installed when
 *               Capacitor is added; the dynamic import is a no-op in web mode).
 *
 * Usage example:
 *   await requestNotificationPermission()
 *   await scheduleNotification({
 *     id: 1,
 *     title: 'موعد',
 *     body: 'اجتماع الفريق بعد 30 دقيقة',
 *     at: new Date(Date.now() + 30 * 60 * 1000),
 *   })
 */

import { isNative } from './platform'

export type NotificationPayload = {
  id: number          // must be unique; used to cancel
  title: string
  body: string
  at: Date            // when to fire
  extra?: Record<string, unknown>
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const { display } = await LocalNotifications.requestPermissions()
      return display === 'granted'
    } catch {
      return false
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) return false

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied')  return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function getNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  return Notification.permission
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function scheduleNotification(payload: NotificationPayload): Promise<void> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.schedule({
        notifications: [{
          id:       payload.id,
          title:    payload.title,
          body:     payload.body,
          schedule: { at: payload.at, allowWhileIdle: true },
          extra:    payload.extra ?? null,
          sound:    undefined, // use system default
          smallIcon:'ic_stat_icon_config_sample',
          channelId:'employee-planner',
        }],
      })
    } catch (e) {
      console.warn('[notifications] Capacitor schedule failed:', e)
    }
    return
  }

  // Web PWA: store in IDB; service worker picks up on next registration
  // For immediate / near-term: fire via SW postMessage if supported
  try {
    await storeWebNotification(payload)
    // If SW is active and notification is < 60s away, fire immediately
    if (payload.at.getTime() - Date.now() < 60_000) {
      fireWebNotificationNow(payload)
    }
  } catch {}
}

export async function cancelNotification(id: number): Promise<void> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.cancel({ notifications: [{ id }] })
    } catch {}
    return
  }
  await removeWebNotification(id)
}

// ─── Web helpers ──────────────────────────────────────────────────────────────

async function storeWebNotification(payload: NotificationPayload): Promise<void> {
  const { getDB } = await import('./offline-db')
  const db = await getDB()
  // Reuse sync_queue store shape — stored with a special endpoint marker
  await db.put('events_cache', {
    key: `notif_${payload.id}`,
    events: [],
    cachedAt: payload.at.getTime(),
    // @ts-expect-error extra fields for notification
    _notif: payload,
  })
}

async function removeWebNotification(id: number): Promise<void> {
  try {
    const { getDB } = await import('./offline-db')
    const db = await getDB()
    await db.delete('events_cache', `notif_${id}`)
  } catch {}
}

function fireWebNotificationNow(payload: NotificationPayload): void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: payload.title,
        body: payload.body,
        id: payload.id,
      })
    } else {
      new Notification(payload.title, { body: payload.body, icon: '/app-icon.png' })
    }
  } catch {}
}

// ─── Helper: schedule all event reminders ────────────────────────────────────

import type { CalendarEvent } from './types'
import { EVENT_LABELS_AR } from './types'

export async function scheduleEventReminder(
  event: CalendarEvent,
  minutesBefore: number
): Promise<void> {
  if (minutesBefore === 0) return
  if (!event.date) return

  const [y, m, d] = event.date.split('-').map(Number)
  const [hh, mm] = (event.time ?? '08:00').split(':').map(Number)

  const eventDate = new Date(y, m - 1, d, hh, mm, 0)
  const fireAt    = new Date(eventDate.getTime() - minutesBefore * 60 * 1000)
  if (fireAt <= new Date()) return

  const label = EVENT_LABELS_AR[event.type as keyof typeof EVENT_LABELS_AR] ?? 'حدث'

  await scheduleNotification({
    id:    event.id + (event.type.charCodeAt(0) * 1000),
    title: `تذكير: ${label}`,
    body:  `${event.title} — بعد ${minutesBefore < 60 ? `${minutesBefore} دقيقة` : `${minutesBefore / 60} ساعة`}`,
    at:    fireAt,
    extra: { type: event.type, eventId: event.id },
  })
}
