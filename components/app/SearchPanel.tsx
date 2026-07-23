'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { CalendarEvent } from '@/lib/types'
import { EVENT_COLORS, EVENT_ICONS, EVENT_LABELS_AR } from '@/lib/types'

type Holiday = { date: string; name: string; emoji: string; type: 'national' | 'religious' }
type SearchResult = { kind: 'event'; data: CalendarEvent } | { kind: 'holiday'; data: Holiday }

type Props = {
  open:     boolean
  events:   CalendarEvent[]
  onClose:  () => void
  isLight?: boolean
  isFr?:    boolean
}

const MONTHS_AR = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`
}

function daysUntilLabel(dateStr: string): string {
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((new Date(dateStr + 'T00:00:00').getTime() - today.getTime()) / 86400000)
  if (diff === 0)  return 'اليوم'
  if (diff === 1)  return 'غداً'
  if (diff === -1) return 'أمس'
  if (diff > 0)    return `بعد ${diff} يوم`
  return `منذ ${Math.abs(diff)} يوم`
}

function highlight(text: string, query: string, color: string) {
  if (!query) return <span>{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark style={{ background: color + '44', color, borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  )
}

export default function SearchPanel({ open, events, onClose, isLight = false, isFr = false }: Props) {
  const [query,      setQuery]      = useState('')
  const [holidays,   setHolidays]   = useState<Holiday[]>([])
  const [holLoading, setHolLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Load holidays once */
  useEffect(() => {
    if (!open || holidays.length > 0) return
    setHolLoading(true)
    fetch('/api/holidays')
      .then(r => r.json())
      .then(d => { setHolidays(d.holidays || []); setHolLoading(false) })
      .catch(() => setHolLoading(false))
  }, [open])

  /* Focus input after animation settles — 220ms to avoid Android focus + keyboard flash */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 220)
      return () => clearTimeout(t)
    } else {
      setQuery('')
    }
  }, [open])

  /* Escape key */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  const q = query.trim()

  const results = useCallback((): SearchResult[] => {
    if (!q) return []
    const lq = q.toLowerCase()

    const evResults: SearchResult[] = events
      .filter(e =>
        e.title.toLowerCase().includes(lq) ||
        (e.notes ?? '').toLowerCase().includes(lq) ||
        e.date.includes(q) ||
        EVENT_LABELS_AR[e.type]?.toLowerCase().includes(lq)
      )
      .map(e => ({ kind: 'event' as const, data: e }))

    const holResults: SearchResult[] = holidays
      .filter(h =>
        h.name.toLowerCase().includes(lq) ||
        h.date.includes(q) ||
        (h.type === 'national'  && 'وطني وطنية'.includes(lq)) ||
        (h.type === 'religious' && 'ديني دينية'.includes(lq))
      )
      .map(h => ({ kind: 'holiday' as const, data: h }))

    return [...evResults, ...holResults].sort((a, b) => a.data.date.localeCompare(b.data.date))
  }, [q, events, holidays])

  const res = results()

  /* ── Theme tokens ─────────────────────────────────── */
  const overlayBg   = isLight ? 'rgba(232,238,248,0.99)'  : 'rgba(8,18,42,0.99)'
  const inputBg     = isLight ? 'rgba(255,255,255,0.92)'  : 'rgba(255,255,255,0.08)'
  const inputBdr    = isLight ? 'rgba(0,0,0,0.12)'        : 'rgba(255,255,255,0.14)'
  const inputText   = isLight ? '#1A2A4A'                  : '#ffffff'
  const titleColor  = isLight ? '#1A2A4A'                  : '#ffffff'
  const subColor    = isLight ? '#5A7AAA'                  : 'rgba(255,255,255,0.45)'
  const rowBg       = isLight ? 'rgba(255,255,255,0.84)'  : 'rgba(255,255,255,0.05)'
  const rowBdr      = isLight ? 'rgba(0,0,0,0.07)'        : 'rgba(255,255,255,0.08)'
  const divBdr      = isLight ? 'rgba(0,0,0,0.08)'        : 'rgba(255,255,255,0.08)'
  const chipBg      = isLight ? 'rgba(255,255,255,0.72)'  : 'rgba(255,255,255,0.06)'
  const today       = new Date().toISOString().split('T')[0]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:     overlayBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        /* Slide from top — simpler than opacity+scale for Android Chrome */
        transform:      open ? 'translateY(0)' : 'translateY(-100%)',
        opacity:        open ? 1 : 0,
        transition:     'transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.20s ease',
        pointerEvents:  open ? 'auto' : 'none',
      }}
    >
      {/* ── Search Bar ─────────────────────────────────────────
          paddingTop accounts for Android status bar so the bar
          never hides under the camera cut-out / notch.        */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 10px, 50px)',
          paddingBottom: 12,
          borderBottom: `1px solid ${divBdr}`,
        }}
      >
        {/* Input wrapper — flex-1 so it doesn't overflow */}
        <div
          className="flex-1 flex items-center gap-2 rounded-[16px] min-w-0"
          style={{
            background: inputBg,
            border: `1.5px solid ${inputBdr}`,
            /* min-height 48px for comfortable Android tap/focus */
            minHeight: 48,
            paddingInline: 14,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, opacity:0.45 }}>
            <circle cx="11" cy="11" r="8" stroke={inputText} strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke={inputText} strokeWidth="2" strokeLinecap="round"/>
          </svg>

          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isFr ? 'Rechercher événements, fêtes...' : 'ابحث عن أحداث، مناسبات، أعياد...'}
            /* Prevent Android from zooming — font-size 16px */
            style={{ fontSize: 16, color: inputText, caretColor: '#1976D2', background:'transparent', outline:'none', flex:1, fontFamily:'Cairo, sans-serif', minWidth:0 }}
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              /* 36px tap target — bigger than the visual 20px circle */
              style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
            >
              <div
                style={{ width:20, height:20, borderRadius:'50%', background:'rgba(128,128,128,0.30)', display:'flex', alignItems:'center', justifyContent:'center' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke={inputText} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Cancel — min tap area 44×44 */}
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            minHeight: 44, minWidth: 44,
            paddingInline: 12,
            borderRadius: 14,
            fontSize: 14, fontWeight: 700, fontFamily:'Cairo, sans-serif',
            color: '#1976D2',
            background: 'rgba(21,101,192,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isFr ? 'إغلاق' : 'إلغاء'}
        </button>
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide px-3 pt-3"
        style={{
          /* Keep content above gesture nav bar */
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 16px, 28px)',
        }}
      >
        {/* ── Idle state ── */}
        {!q && (
          <div className="py-12 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-base" style={{ color: titleColor }}>
              {isFr ? 'Recherche globale' : 'البحث الشامل'}
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: subColor }}>
              {isFr
                ? 'Recherchez vos tâches, RDV, congés, occasions et fêtes.'
                : 'ابحث في مهامك، مواعيدك، إجازاتك، مناسباتك والأعياد الوطنية.'}
            </p>

            {/* Quick-search chips — flex-wrap, 44px height each */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {[
                { label:'مهمة 📋',   q:'مهمة'   },
                { label:'موعد 📅',   q:'موعد'   },
                { label:'مناسبة 🎉', q:'مناسبة' },
                { label:'إجازة 🌴',  q:'إجازة'  },
                { label:'وطني 🇩🇿',  q:'وطني'   },
                { label:'ديني ☪️',   q:'ديني'   },
              ].map(chip => (
                <button
                  key={chip.q}
                  onClick={() => setQuery(chip.q)}
                  style={{
                    minHeight: 40, paddingInline: 14,
                    borderRadius: 99, fontSize: 13, fontWeight: 600,
                    background: chipBg, border:`1px solid ${rowBdr}`, color: subColor,
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {q && holLoading && (
          <div className="flex items-center gap-2 py-2 px-1 mb-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <p className="text-xs" style={{ color: subColor }}>جارٍ تحميل المناسبات الوطنية...</p>
          </div>
        )}

        {/* ── No results ── */}
        {q && !holLoading && res.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-4xl mb-3">😕</p>
            <p className="font-semibold text-sm" style={{ color: titleColor }}>
              {isFr ? 'Aucun résultat' : 'لا توجد نتائج'}
            </p>
            <p className="text-xs mt-1" style={{ color: subColor }}>
              {isFr ? `Aucun résultat pour "${q}"` : `لا توجد نتائج لـ "${q}"`}
            </p>
          </div>
        )}

        {/* ── Results count ── */}
        {q && res.length > 0 && (
          <p className="text-xs font-semibold mb-3 px-1" style={{ color: subColor }}>
            {isFr ? `${res.length} résultat(s)` : `${res.length} نتيجة`}
          </p>
        )}

        {/* ── Results list ── */}
        <div className="space-y-2">
          {res.map(r => {
            if (r.kind === 'event') {
              const ev     = r.data
              const color  = EVENT_COLORS[ev.type]
              const icon   = EVENT_ICONS[ev.type]
              const label  = EVENT_LABELS_AR[ev.type]
              const dayLbl = daysUntilLabel(ev.date)

              return (
                <div
                  key={`ev-${ev.id}-${ev.type}`}
                  className="flex items-start gap-3 rounded-[18px]"
                  style={{ background: rowBg, border:`1px solid ${rowBdr}`, padding:'12px 14px' }}
                >
                  <div
                    className="rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ width:44, height:44, background: color + '22' }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color+'22', color }}>
                        {label}
                      </span>
                      {ev.completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(34,197,94,0.15)', color:'#22C55E' }}>
                          ✓ مكتمل
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm leading-snug" style={{ color: titleColor }}>
                      {highlight(ev.title, q, color)}
                    </p>
                    {ev.notes && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: subColor }}>
                        {highlight(ev.notes, q, color)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs" style={{ color: subColor }}>
                        📅 {formatDate(ev.date)}{ev.time ? ` · ⏰ ${ev.time}` : ''}
                      </p>
                      <span className="text-xs font-semibold" style={{ color: ev.date < today ? subColor : color }}>
                        {dayLbl}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }

            /* Holiday */
            const h      = r.data
            const isNat  = h.type === 'national'
            const color  = isNat ? '#1976D2' : '#7B1FA2'
            const dayLbl = daysUntilLabel(h.date)

            return (
              <div
                key={`hol-${h.date}-${h.name}`}
                className="flex items-start gap-3 rounded-[18px]"
                style={{
                  padding: '12px 14px',
                  background: isNat ? 'rgba(21,101,192,0.07)' : 'rgba(123,31,162,0.07)',
                  border: `1px solid ${isNat ? 'rgba(21,101,192,0.20)' : 'rgba(123,31,162,0.20)'}`,
                }}
              >
                <div
                  className="rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ width:44, height:44, background: color+'22' }}
                >
                  {h.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color+'22', color }}>
                      {isNat ? '🇩🇿 وطني' : '☪️ ديني'}
                    </span>
                  </div>
                  <p className="font-bold text-sm leading-snug" style={{ color: titleColor }}>
                    {highlight(h.name, q, color)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: subColor }}>📅 {formatDate(h.date)}</p>
                    <span className="text-xs font-semibold" style={{ color }}>{dayLbl}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
