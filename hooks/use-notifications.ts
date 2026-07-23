'use client'
/**
 * hooks/use-notifications.ts
 *
 * منطق التنبيهات:
 * ─────────────────────────────────────────────────────────────
 * لكل حدث غير مكتمل / غير مؤرشف يتم توليد تنبيه واحد أو اثنين:
 *
 * 1. تنبيه "اقتراب الحدث":
 *    - يُعرض عندما يكون الحدث خلال الـ N يوم القادمة (حسب النوع)
 *    - يبقى معروضاً حتى يمر يوم الحدث كاملاً
 *
 * 2. تنبيه "انتهاء الإجازة" (للإجازات فقط):
 *    - يُعرض عندما يكون تاريخ نهاية الإجازة خلال يومين
 *    - يبقى معروضاً حتى يمر يوم الانتهاء
 *
 * نافذة الظهور لكل نوع:
 *   - موعد / مهمة / ملاحظة → 2 يوم قبل
 *   - مناسبة                → 3 أيام قبل
 *   - إجازة (البداية)       → 3 أيام قبل
 *   - إجازة (النهاية)       → 2 يوم قبل
 *   - عيد ميلاد             → 3 أيام قبل
 * ─────────────────────────────────────────────────────────────
 */
import { useMemo } from 'react'
import type { CalendarEvent } from '@/lib/types'

export type NotificationUrgency = 'today' | 'tomorrow' | 'soon'

export type AppNotification = {
  id:         string
  eventId:    number
  type:       CalendarEvent['type']
  title:      string
  eventDate:  string   // YYYY-MM-DD  (start for vacations, end for end-alert)
  eventTime?: string
  urgency:    NotificationUrgency
  daysLeft:   number   // 0 = today, 1 = tomorrow, 2+ = soon
  label:      string
  isEndAlert: boolean  // true = this is the "إجازة تنتهي" alert
}

// How many days ahead to start showing the notification (per type)
const AHEAD_DAYS: Record<string, number> = {
  task:            2,
  appointment:     2,
  occasion:        3,
  vacation_annual: 3,
  vacation_comp:   3,
  note:            2,
  birthday:        3,
}

function daysBetween(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function urgencyLabel(daysLeft: number): string {
  if (daysLeft === 0)  return 'اليوم'
  if (daysLeft === 1)  return 'غداً'
  if (daysLeft === 2)  return 'بعد يومين'
  return `بعد ${daysLeft} أيام`
}

function urgencyLevel(daysLeft: number): NotificationUrgency {
  if (daysLeft === 0) return 'today'
  if (daysLeft === 1) return 'tomorrow'
  return 'soon'
}

export function useNotifications(events: CalendarEvent[]): {
  notifications: AppNotification[]
  unreadCount:   number
} {
  return useMemo(() => {
    // De-duplicate vacations: keep only unique (id, type) combinations
    // because vacations are expanded to one row per day in the events array
    const seen = new Set<string>()
    const deduped: CalendarEvent[] = []
    for (const ev of events) {
      const isVac = ev.type === 'vacation_annual' || ev.type === 'vacation_comp'
      if (isVac) {
        // Only keep the first occurrence (start date) and track endDate
        const key = `${ev.type}-${ev.id}`
        if (seen.has(key)) continue
        seen.add(key)
      }
      deduped.push(ev)
    }

    const list: AppNotification[] = []

    for (const ev of deduped) {
      if (ev.archived || ev.completed) continue

      const isVac  = ev.type === 'vacation_annual' || ev.type === 'vacation_comp'
      const ahead  = AHEAD_DAYS[ev.type] ?? 2

      // ── Alert 1: event start date ──────────────────────────
      const startDays = daysBetween(ev.date)
      // Show if: 0 <= daysLeft <= ahead  (today through ahead)
      if (startDays >= 0 && startDays <= ahead) {
        list.push({
          id:         `start-${ev.type}-${ev.id}`,
          eventId:    ev.id,
          type:       ev.type,
          title:      ev.title,
          eventDate:  ev.date,
          eventTime:  ev.time,
          urgency:    urgencyLevel(startDays),
          daysLeft:   startDays,
          label:      urgencyLabel(startDays),
          isEndAlert: false,
        })
      }

      // ── Alert 2: vacation END date ─────────────────────────
      if (isVac && ev.endDate) {
        const endDays = daysBetween(ev.endDate)
        if (endDays >= 0 && endDays <= 2) {
          list.push({
            id:         `end-${ev.type}-${ev.id}`,
            eventId:    ev.id,
            type:       ev.type,
            title:      ev.title,
            eventDate:  ev.endDate,
            urgency:    urgencyLevel(endDays),
            daysLeft:   endDays,
            label:      urgencyLabel(endDays),
            isEndAlert: true,
          })
        }
      }
    }

    // Sort: today → tomorrow → soon; within group by daysLeft asc
    const order: Record<NotificationUrgency, number> = { today: 0, tomorrow: 1, soon: 2 }
    list.sort((a, b) => {
      const od = order[a.urgency] - order[b.urgency]
      return od !== 0 ? od : a.daysLeft - b.daysLeft
    })

    return { notifications: list, unreadCount: list.length }
  }, [events])
}
