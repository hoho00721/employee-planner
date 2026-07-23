'use client'
import { useState } from 'react'
import type { CalendarEvent, EventType } from '@/lib/types'
import { EVENT_COLORS, EVENT_ICONS, EVENT_LABELS_AR } from '@/lib/types'
import type { AddType } from './MainApp'

type Props = {
  events: CalendarEvent[]
  loading: boolean
  onAdd: (type: AddType) => void
  isLight?: boolean
  isFr?: boolean
}

// ── أسماء الأيام والأشهر الجزائرية الدارجة ──────────────────────────────────
const DAYS_AR = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']

// الأسماء الجزائرية / المغاربية الدارجة للأشهر
const MONTHS_AR = [
  'جانفي', 'فيفري', 'مارس', 'أفريل',
  'ماي', 'جوان', 'جويلية', 'أوت',
  'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril',
  'Mai', 'Juin', 'Juillet', 'Août',
  'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

// تنسيق تاريخ كامل عربي
function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const dayName = d.toLocaleDateString('ar-DZ', { weekday: 'long' })
  return `${dayName} ${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`
}

// بناء map: vacation_id → { startDate, endDate, days }
function buildVacationMeta(events: CalendarEvent[]): Map<number, { startDate: string; endDate: string }> {
  const map = new Map<number, { startDate: string; endDate: string }>()
  for (const ev of events) {
    if ((ev.type === 'vacation_annual' || ev.type === 'vacation_comp') && ev.endDate) {
      if (!map.has(ev.id)) {
        map.set(ev.id, { startDate: ev.date, endDate: ev.endDate })
      } else {
        // Keep the earliest date as startDate
        const cur = map.get(ev.id)!
        if (ev.date < cur.startDate) map.set(ev.id, { ...cur, startDate: ev.date })
      }
    }
  }
  return map
}

// ── تفاصيل حدث واحد ──────────────────────────────────────────────────────────
function EventDetail({
  ev,
  vacMeta,
  isLight,
}: {
  ev: CalendarEvent
  vacMeta: Map<number, { startDate: string; endDate: string }>
  isLight: boolean
}) {
  const color    = EVENT_COLORS[ev.type]
  const isVac    = ev.type === 'vacation_annual' || ev.type === 'vacation_comp'
  const meta     = isVac ? vacMeta.get(ev.id) : undefined
  const txtColor = isLight ? '#1A2A4A' : '#fff'
  const subColor = isLight ? '#4A6A9A' : 'rgba(255,255,255,0.50)'
  const rowBg    = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'
  const rowBdr   = isLight ? 'rgba(0,0,0,0.07)'  : 'rgba(255,255,255,0.08)'

  // حساب عدد أيام الإجازة من الـ meta
  const vacDays = meta
    ? Math.round(
        (new Date(meta.endDate).getTime() - new Date(meta.startDate).getTime()) /
          86_400_000
      ) + 1
    : 0

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${color}40`, background: rowBg }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${rowBdr}` }}
      >
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: color + '28' }}
        >
          {EVENT_ICONS[ev.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight" style={{ color: txtColor }}>
            {ev.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: color + '25', color }}
            >
              {EVENT_LABELS_AR[ev.type]}
            </span>
            {ev.completed && (
              <span className="text-xs text-green-400 font-semibold">✓ مكتمل</span>
            )}
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="px-4 py-3 space-y-2">

        {/* الوقت */}
        {ev.time && (
          <DetailRow icon="🕐" label="الوقت" value={ev.time} subColor={subColor} txtColor={txtColor} />
        )}

        {/* تاريخ البداية — للإجازات */}
        {isVac && meta && (
          <DetailRow
            icon="📅"
            label="تاريخ البداية"
            value={formatFullDate(meta.startDate)}
            subColor={subColor}
            txtColor={txtColor}
          />
        )}

        {/* تاريخ النهاية — للإجازات */}
        {isVac && meta && (
          <DetailRow
            icon="🏁"
            label="تنتهي"
            value={formatFullDate(meta.endDate)}
            highlight={color}
            subColor={subColor}
            txtColor={txtColor}
          />
        )}

        {/* عدد أيام الإجازة */}
        {isVac && vacDays > 0 && (
          <DetailRow
            icon="📆"
            label="المدة"
            value={`${vacDays} يوم`}
            subColor={subColor}
            txtColor={txtColor}
          />
        )}

        {/* تاريخ الحدث غير الإجازات */}
        {!isVac && (
          <DetailRow
            icon="📅"
            label="التاريخ"
            value={formatFullDate(ev.date)}
            subColor={subColor}
            txtColor={txtColor}
          />
        )}

        {/* الملاحظات */}
        {ev.notes && (
          <DetailRow icon="📝" label="ملاحظات" value={ev.notes} subColor={subColor} txtColor={txtColor} />
        )}
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
  subColor,
  txtColor,
}: {
  icon: string
  label: string
  value: string
  highlight?: string
  subColor: string
  txtColor: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span style={{ fontSize: 14, lineHeight: '20px', flexShrink: 0 }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold" style={{ color: subColor }}>
          {label}:{' '}
        </span>
        <span
          className="text-xs font-bold"
          style={{ color: highlight ?? txtColor }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

// ── المكوّن الرئيسي ───────────────────────────────────────────────────────────
export default function CalendarView({ events, loading, onAdd, isLight = false, isFr = false }: Props) {
  const today = new Date()
  const [year,  setYear]   = useState(today.getFullYear())
  const [month, setMonth]  = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const todayStr    = today.toISOString().split('T')[0]
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay    = new Date(year, month, 1).getDay()

  const MONTHS = isFr ? MONTHS_FR : MONTHS_AR

  const prevMonth = () => month === 0  ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)
  const nextMonth = () => month === 11 ? (setMonth(0),  setYear(y => y + 1)) : setMonth(m => m + 1)
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(todayStr) }

  // ── helpers ─────────────────────────────────────────────────────────────────
  function dayStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  // أنواع الأحداث الموجودة في يوم معيّن (للنقاط اللونية)
  function dots(d: number): EventType[] {
    const ds  = dayStr(d)
    const evs = events.filter(e => e.date === ds)
    return [...new Set(evs.map(e => e.type))].slice(0, 4) as EventType[]
  }

  // هل يوم ما هو آخر يوم إجازة ما؟ → نعرض "تنتهي"
  function isVacationEnd(d: number): boolean {
    const ds = dayStr(d)
    return events.some(
      e =>
        (e.type === 'vacation_annual' || e.type === 'vacation_comp') &&
        e.endDate === ds &&
        e.date !== ds   // ليس أول يوم الإجازة أيضاً
    )
  }

  // أحداث اليوم المختار
  const selectedEvents = selected ? events.filter(e => e.date === selected) : []

  // بناء meta الإجازات مرة واحدة
  const vacMeta = buildVacationMeta(events)

  // خلايا الشبكة
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // ألوان ثيم
  const glassCard   = isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.06)'
  const glassBorder = isLight ? 'rgba(0,0,0,0.07)'       : 'rgba(255,255,255,0.10)'
  const headerColor = isLight ? '#1A2A4A'                 : '#fff'
  const subColor    = isLight ? '#4A6A9A'                 : 'rgba(255,255,255,0.40)'
  const dayColor    = isLight ? 'rgba(30,50,90,0.80)'     : 'rgba(255,255,255,0.80)'
  const btnBg       = isLight ? 'rgba(0,0,0,0.07)'        : 'rgba(255,255,255,0.08)'
  const arrowStroke = isLight ? 'rgba(30,50,90,0.70)'     : 'white'

  return (
    <div className="space-y-3 animate-slide-up">

      {/* ── شبكة التقويم ────────────────────────────────────────────────────── */}
      <div
        className="rounded-[20px] p-4"
        style={{
          background: glassCard,
          border: `1px solid ${glassBorder}`,
          boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
        }}
      >

        {/* رأس الشهر / السنة */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition active:scale-90"
            style={{ background: btnBg }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke={arrowStroke} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="text-center">
            <h3 className="font-black text-xl leading-none" style={{ color: headerColor }}>
              {MONTHS[month]}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <button
                onClick={() => setYear(y => y - 1)}
                className="transition px-1"
                style={{ color: subColor, fontSize: 13 }}
              >◀</button>
              <span className="font-semibold text-sm" style={{ color: subColor }}>{year}</span>
              <button
                onClick={() => setYear(y => y + 1)}
                className="transition px-1"
                style={{ color: subColor, fontSize: 13 }}
              >▶</button>
            </div>
          </div>

          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition active:scale-90"
            style={{ background: btnBg }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke={arrowStroke} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* زر اليوم */}
        <button
          onClick={goToday}
          className="w-full text-center text-xs font-semibold py-1.5 rounded-xl transition mb-3"
          style={{ color: '#60A5FA', background: 'rgba(25,118,210,0.12)' }}
        >
          📍 {isFr ? "Aujourd'hui" : 'اليوم'}
        </button>

        {/* رؤوس الأيام */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_AR.map(d => (
            <div key={d} className="text-center text-xs py-1 font-bold" style={{ color: subColor }}>
              {d}
            </div>
          ))}
        </div>

        {/* الشبكة */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />
            const ds       = dayStr(day)
            const isToday  = ds === todayStr
            const isSel    = ds === selected
            const dayDots  = dots(day)
            const vacEnd   = isVacationEnd(day)

            return (
              <button
                key={idx}
                onClick={() => setSelected(isSel ? null : ds)}
                className="flex flex-col items-center rounded-xl transition-all active:scale-90 relative"
                style={{
                  paddingTop: 5,
                  paddingBottom: vacEnd ? 3 : 5,
                  background: isSel
                    ? '#1565C0'
                    : isToday
                    ? 'rgba(25,118,210,0.20)'
                    : 'transparent',
                  border: isToday && !isSel
                    ? '1.5px solid #1976D2'
                    : '1.5px solid transparent',
                }}
              >
                {/* رقم اليوم */}
                <span
                  className="text-sm font-bold leading-none"
                  style={{
                    color: isSel ? '#fff' : isToday ? '#60A5FA' : dayColor,
                  }}
                >
                  {day}
                </span>

                {/* نقاط الأحداث */}
                {dayDots.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dayDots.map((t, i) => (
                      <div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: 5,
                          height: 5,
                          background: EVENT_COLORS[t],
                          // نقطة الإجازة أكبر قليلاً
                          ...(t === 'vacation_annual' || t === 'vacation_comp'
                            ? { width: 6, height: 6 }
                            : {}),
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* نص "تنتهي" لآخر يوم إجازة */}
                {vacEnd && (
                  <span
                    className="font-bold leading-none mt-0.5"
                    style={{
                      fontSize: 7,
                      color: isSel ? 'rgba(255,255,255,0.85)' : '#EF4444',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    تنتهي
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── دليل الألوان ────────────────────────────────────────────────────── */}
      <div
        className="rounded-[18px] p-3"
        style={{
          background: glassCard,
          border: `1px solid ${glassBorder}`,
          boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <p
          className="text-xs font-bold mb-2 tracking-wider uppercase"
          style={{ color: subColor }}
        >
          {isFr ? 'Légende' : 'دليل الألوان'}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {(
            Object.entries(EVENT_LABELS_AR) as [keyof typeof EVENT_LABELS_AR, string][]
          ).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: EVENT_COLORS[type] }}
              />
              <span className="text-xs" style={{ color: subColor }}>
                {EVENT_ICONS[type]} {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── تفاصيل اليوم المختار ─────────────────────────────────────────────── */}
      {selected && (
        <div
          className="rounded-[20px] p-4 animate-slide-up"
          style={{
            background: glassCard,
            border: `1px solid ${glassBorder}`,
            boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {/* عنوان اليوم */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-black text-base" style={{ color: isLight ? '#1A2A4A' : '#fff' }}>
                {formatFullDate(selected)}
              </p>
              {selectedEvents.length > 0 && (
                <p className="text-xs font-semibold mt-0.5" style={{ color: subColor }}>
                  {selectedEvents.length}{' '}
                  {isFr ? 'événement(s)' : selectedEvents.length === 1 ? 'حدث' : 'أحداث'}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90"
              style={{
                background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)',
                color: isLight ? '#4A6A9A' : 'rgba(255,255,255,0.50)',
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          {/* قائمة الأحداث بالتفاصيل الكاملة */}
          {selectedEvents.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm" style={{ color: subColor }}>
                {isFr ? 'Aucun événement ce jour.' : 'لا يوجد أي حدث مسجل في هذا اليوم.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(ev => (
                <EventDetail
                  key={ev.id + ev.type + ev.date}
                  ev={ev}
                  vacMeta={vacMeta}
                  isLight={isLight}
                />
              ))}
            </div>
          )}

          {/* زر إضافة حدث */}
          <button
            onClick={() => onAdd('task')}
            className="w-full mt-4 py-2.5 rounded-2xl text-sm font-semibold transition"
            style={{
              border: `1.5px dashed ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`,
              color: isLight ? '#4A6A9A' : 'rgba(255,255,255,0.40)',
            }}
          >
            + {isFr ? 'Ajouter un événement' : 'إضافة حدث في هذا اليوم'}
          </button>
        </div>
      )}
    </div>
  )
}
