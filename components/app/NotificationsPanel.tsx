'use client'
import { useEffect, useRef } from 'react'
import type { AppNotification } from '@/hooks/use-notifications'
import { EVENT_COLORS, EVENT_ICONS, EVENT_LABELS_AR } from '@/lib/types'

type Props = {
  open:          boolean
  notifications: AppNotification[]
  onClose:       () => void
  isLight?:      boolean
  isFr?:         boolean
}

const URGENCY_STYLES: Record<string, { bg:string; border:string; dot:string; label:string }> = {
  today:    { bg:'rgba(239,68,68,0.09)',  border:'rgba(239,68,68,0.28)',  dot:'#EF4444', label:'اليوم'  },
  tomorrow: { bg:'rgba(245,158,11,0.09)', border:'rgba(245,158,11,0.28)', dot:'#F59E0B', label:'غداً'   },
  soon:     { bg:'rgba(59,130,246,0.07)', border:'rgba(59,130,246,0.22)', dot:'#3B82F6', label:'قريباً' },
}

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_AR[d.getMonth()]}`
}

export default function NotificationsPanel({
  open, notifications, onClose, isLight = false, isFr = false,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  /* Close on outside tap/click */
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open, onClose])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  /* ── Theme ── */
  const panelBg    = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(10,20,48,0.97)'
  const dividerClr = isLight ? 'rgba(0,0,0,0.08)'       : 'rgba(255,255,255,0.09)'
  const titleClr   = isLight ? '#1A2A4A'                 : '#ffffff'
  const subClr     = isLight ? '#5A7AAA'                 : 'rgba(255,255,255,0.45)'
  const closeBg    = isLight ? 'rgba(0,0,0,0.07)'        : 'rgba(255,255,255,0.08)'

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background:     open ? 'rgba(0,0,0,0.40)' : 'transparent',
          backdropFilter: open ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: open ? 'blur(4px)' : 'none',
          pointerEvents:  open ? 'auto' : 'none',
          opacity:        open ? 1 : 0,
          transition:     'opacity 0.25s ease',
        }}
        onClick={onClose}
      />

      {/* ── Panel ────────────────────────────────────────────────
          Position: just below the header.
          The header is 60px tall + safe-area-inset-top.
          We use a CSS custom property trick:
            top = var(--header-h) + safe-area-inset-top
          --header-h is 60px (defined in globals.css).
          maxHeight = 100dvh - top - safe-area-inset-bottom - 8px gap
      ─────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="fixed left-0 right-0 z-50 mx-3 flex flex-col rounded-[24px] overflow-hidden"
        style={{
          /* Position below app header — safe-area aware */
          top: 'calc(var(--header-h) + env(safe-area-inset-top, 0px) + 4px)',
          /* Max height: viewport – top position – safe-area-bottom – small gap */
          maxHeight: 'calc(100dvh - var(--header-h) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 24px)',
          background:     panelBg,
          border:         `1px solid ${dividerClr}`,
          boxShadow:      '0 20px 60px rgba(0,0,0,0.40)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          /* Slide-in animation */
          transform:     open ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.97)',
          opacity:       open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition:    'transform 0.24s cubic-bezier(.4,0,.2,1), opacity 0.18s ease',
        }}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ minHeight:60, borderBottom:`1px solid ${dividerClr}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ width:38, height:38, background:'rgba(239,68,68,0.14)' }}
            >
              🔔
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: titleClr }}>
                {isFr ? "Rappels d'événements" : 'تنبيهات الأحداث'}
              </p>
              <p className="text-xs" style={{ color: subClr }}>
                {notifications.length > 0
                  ? `${notifications.length} ${isFr ? 'rappel(s) actif(s)' : 'تنبيه نشط'}`
                  : (isFr ? 'Aucun rappel actif' : 'لا توجد تنبيهات')}
              </p>
            </div>
          </div>

          {/* Close — 44×44 tap target */}
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl active:scale-90 transition-all flex-shrink-0"
            style={{ width:44, height:44, background: closeBg }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke={titleClr} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto scrollbar-hide flex-1" style={{ padding:'10px 12px', paddingBottom:12 }}>

          {/* Empty state */}
          {notifications.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-5xl mb-3">🔕</p>
              <p className="font-semibold text-sm" style={{ color: titleClr }}>
                {isFr ? 'Tout est calme !' : 'لا توجد تنبيهات حالياً'}
              </p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: subClr }}>
                {isFr
                  ? 'Vos rappels apparaîtront ici quelques jours avant chaque événement.'
                  : 'ستظهر هنا تنبيهات أحداثك القريبة قبل يومين إلى ثلاثة أيام من موعدها.'}
              </p>
            </div>
          )}

          {/* Notification rows */}
          <div className="space-y-2">
            {notifications.map(n => {
              const color = EVENT_COLORS[n.type]
              const icon  = EVENT_ICONS[n.type]
              const tyLbl = EVENT_LABELS_AR[n.type]
              const urg   = URGENCY_STYLES[n.urgency]

              const displayTitle = n.isEndAlert ? `انتهاء ${n.title}` : n.title
              const subLine      = n.isEndAlert
                ? 'تنتهي الإجازة'
                : (n.eventTime ? `⏰ ${n.eventTime}` : '')

              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-[18px]"
                  style={{ background: urg.bg, border:`1px solid ${urg.border}`, padding:'12px' }}
                >
                  {/* Icon + urgency dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-2xl flex items-center justify-center text-2xl"
                      style={{ width:48, height:48, background: color+'22' }}
                    >
                      {n.isEndAlert ? '🏁' : icon}
                    </div>
                    <div
                      className="absolute rounded-full border-2"
                      style={{
                        width:14, height:14,
                        top:-2, right:-2,
                        background:   urg.dot,
                        borderColor:  isLight ? '#fff' : '#0a1628',
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:color+'22', color }}>
                        {tyLbl}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:urg.dot+'22', color:urg.dot }}>
                        {n.label}
                      </span>
                    </div>

                    <p className="font-bold text-sm leading-snug" style={{ color: titleClr }}>
                      {displayTitle}
                    </p>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs" style={{ color: subClr }}>
                        📅 {fmtDate(n.eventDate)}
                      </p>
                      {subLine && (
                        <p className="text-xs" style={{ color: subClr }}>{subLine}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Footer hint ── */}
        {notifications.length > 0 && (
          <div
            className="flex-shrink-0 px-4 py-3 text-center"
            style={{ borderTop:`1px solid ${dividerClr}` }}
          >
            <p className="text-xs leading-relaxed" style={{ color: subClr }}>
              {isFr
                ? 'Rappels affichés 2 à 3 jours avant chaque événement.'
                : 'تُعرض التنبيهات قبل ٢–٣ أيام من كل حدث تلقائياً.'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
