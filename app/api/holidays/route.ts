import { NextResponse } from 'next/server'

// Algerian national holidays — fixed dates
const FIXED_HOLIDAYS = [
  { month: 1,  day: 1,  name: 'رأس السنة الميلادية',       emoji: '🎆', type: 'national' },
  { month: 1,  day: 12, name: 'يوم الهجرة النبوية الشريفة', emoji: '🌙', type: 'religious' },
  { month: 5,  day: 1,  name: 'عيد العمال',                emoji: '⚒️', type: 'national' },
  { month: 6,  day: 19, name: 'يوم الانتفاضة - ثورة الطلبة', emoji: '📚', type: 'national' },
  { month: 7,  day: 5,  name: 'عيد الاستقلال',             emoji: '🇩🇿', type: 'national' },
  { month: 11, day: 1,  name: 'عيد الثورة التحريرية',       emoji: '🌹', type: 'national' },
  { month: 12, day: 31, name: 'ليلة رأس السنة',             emoji: '🎇', type: 'national' },
]

// Islamic holidays (approximate dates for 2025 & 2026)
// These shift every year — we hardcode approx dates for current years
const ISLAMIC_HOLIDAYS_2025 = [
  { date: '2025-01-29', name: 'رأس السنة الهجرية 1447',     emoji: '🌙', type: 'religious' },
  { date: '2025-03-29', name: 'عيد الفطر المبارك',           emoji: '🌙', type: 'religious' },
  { date: '2025-03-30', name: 'ثاني أيام عيد الفطر',         emoji: '🌙', type: 'religious' },
  { date: '2025-04-07', name: 'المولد النبوي الشريف',        emoji: '☪️', type: 'religious' },
  { date: '2025-06-06', name: 'عيد الأضحى المبارك',         emoji: '🐑', type: 'religious' },
  { date: '2025-06-07', name: 'ثاني أيام عيد الأضحى',       emoji: '🐑', type: 'religious' },
  { date: '2025-06-27', name: 'رأس السنة الهجرية 1447',     emoji: '🌙', type: 'religious' },
]

const ISLAMIC_HOLIDAYS_2026 = [
  { date: '2026-01-17', name: 'رأس السنة الهجرية 1448',     emoji: '🌙', type: 'religious' },
  { date: '2026-03-20', name: 'عيد الفطر المبارك',           emoji: '🌙', type: 'religious' },
  { date: '2026-03-21', name: 'ثاني أيام عيد الفطر',         emoji: '🌙', type: 'religious' },
  { date: '2026-05-27', name: 'عيد الأضحى المبارك',         emoji: '🐑', type: 'religious' },
  { date: '2026-05-28', name: 'ثاني أيام عيد الأضحى',       emoji: '🐑', type: 'religious' },
  { date: '2026-09-16', name: 'المولد النبوي الشريف',        emoji: '☪️', type: 'religious' },
]

export async function GET() {
  const year = new Date().getFullYear()

  // Build fixed holidays for this year and next
  const allFixed = []
  for (const y of [year, year + 1]) {
    for (const h of FIXED_HOLIDAYS) {
      const d = String(h.day).padStart(2,'0')
      const m = String(h.month).padStart(2,'0')
      allFixed.push({
        date: `${y}-${m}-${d}`,
        name: h.name,
        emoji: h.emoji,
        type: h.type,
      })
    }
  }

  const islamic = [...ISLAMIC_HOLIDAYS_2025, ...ISLAMIC_HOLIDAYS_2026]

  const all = [...allFixed, ...islamic]
    .filter(h => h.date >= new Date().toISOString().split('T')[0].slice(0,4) + '-01-01')
    .sort((a,b) => a.date.localeCompare(b.date))

  return NextResponse.json({ holidays: all, country: 'DZ', year })
}
