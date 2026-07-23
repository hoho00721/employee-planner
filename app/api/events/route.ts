import { NextResponse } from 'next/server'
import { db } from '@/db'
import { tasks, appointments, occasions, vacations, notes, userProfile } from '@/db/schemas/schema'
import type { CalendarEvent } from '@/lib/types'

function eachDayOfRange(start: string, end: string): string[] {
  const days: string[] = []
  const s = new Date(start)
  const e = new Date(end)
  const cur = new Date(s)
  while (cur <= e) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export async function GET() {
  try {
    const [allTasks, allAppts, allOcc, allVac, allNotes, profiles] = await Promise.all([
      db.select().from(tasks),
      db.select().from(appointments),
      db.select().from(occasions),
      db.select().from(vacations),
      db.select().from(notes),
      db.select().from(userProfile).limit(1),
    ])

    const events: CalendarEvent[] = []

    for (const t of allTasks) {
      events.push({ id: t.id, type: 'task', title: t.title, date: t.date, time: t.time ?? undefined, notes: t.notes ?? undefined, completed: t.completed ?? false })
    }
    for (const a of allAppts) {
      events.push({ id: a.id, type: 'appointment', title: a.title, date: a.date, time: a.time ?? undefined, notes: a.notes ?? undefined })
    }
    for (const o of allOcc) {
      events.push({ id: o.id, type: 'occasion', title: o.title, date: o.date, time: o.time ?? undefined, notes: o.notes ?? undefined })
      // If recurring, generate next occurrences for the next 5 years
      if (o.recurring) {
        for (let y = 1; y <= 5; y++) {
          const d = new Date(o.date)
          d.setFullYear(d.getFullYear() + y)
          events.push({ id: o.id * 1000 + y, type: 'occasion', title: o.title, date: d.toISOString().split('T')[0] })
        }
      }
    }
    for (const v of allVac) {
      const days = eachDayOfRange(v.startDate, v.endDate)
      for (const day of days) {
        events.push({ id: v.id, type: v.type === 'annual' ? 'vacation_annual' : 'vacation_comp', title: v.title, date: day, endDate: v.endDate })
      }
    }
    for (const n of allNotes) {
      events.push({ id: n.id, type: 'note', title: n.title, date: n.date, time: n.time ?? undefined, notes: n.content ?? undefined })
    }

    // Add birthday from profile
    if (profiles.length > 0 && profiles[0].birthDate) {
      const bd = profiles[0].birthDate
      const bdDate = new Date(bd)
      const currentYear = new Date().getFullYear()
      for (let y = currentYear - 1; y <= currentYear + 5; y++) {
        const d = new Date(bdDate)
        d.setFullYear(y)
        events.push({
          id: 99999 + y,
          type: 'birthday',
          title: `🎂 عيد ميلاد ${profiles[0].fullName}`,
          date: d.toISOString().split('T')[0],
        })
      }
    }

    return NextResponse.json({ events })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
