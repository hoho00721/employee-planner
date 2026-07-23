'use client'
import { useState, useEffect } from 'react'

type Holiday = {
  date: string
  name: string
  emoji: string
  type: 'national' | 'religious'
}

const MONTHS_AR = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
]

function daysUntil(dateStr: string) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  return diff
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`
}

export default function NationalHolidays({ isLight = false, isFr = false }: { isLight?: boolean; isFr?: boolean }) {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<'all' | 'national' | 'religious'>('all')

  useEffect(() => {
    setLoading(true)
    fetch('/api/holidays')
      .then(r => r.json())
      .then(d => {
        setHolidays(d.holidays || [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const filtered = holidays.filter(h => {
    if (filter === 'national') return h.type === 'national'
    if (filter === 'religious') return h.type === 'religious'
    return true
  })

  // Separate upcoming vs passed
  const upcoming = filtered.filter(h => h.date >= today)
  const passed   = filtered.filter(h => h.date <  today).reverse()

  // Next holiday countdown
  const next = upcoming[0]
  const daysToNext = next ? daysUntil(next.date) : null

  return (
    <div className="space-y-3 animate-slide-up">

      {/* Header card */}
      <div
        className="rounded-[20px] p-5 relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,#1B5E20 0%,#2E7D32 60%,#388E3C 100%)', boxShadow:'0 8px 32px rgba(46,125,50,0.35)' }}
      >
        {/* BG decoration */}
        <div style={{ position:'absolute', right:-20, top:-20, fontSize:80, opacity:0.12, lineHeight:1 }}>🇩🇿</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🇩🇿</span>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">المناسبات الوطنية</h2>
              <p className="text-white/60 text-xs">الجمهورية الجزائرية الديمقراطية الشعبية</p>
            </div>
          </div>
          {daysToNext !== null && (
            <div
              className="mt-3 rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background:'rgba(0,0,0,0.2)' }}
            >
              <div>
                <p className="text-white/60 text-xs mb-0.5">المناسبة القادمة</p>
                <p className="text-white font-bold text-sm">{next.emoji} {next.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{formatDate(next.date)}</p>
              </div>
              <div className="text-center">
                {daysToNext === 0 ? (
                  <div>
                    <div className="text-yellow-300 font-black text-lg leading-none">اليوم!</div>
                    <div className="text-white/60 text-xs">🎉</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-yellow-300 font-black text-3xl leading-none">{daysToNext}</div>
                    <div className="text-white/60 text-xs">يوم</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="glass-card p-1.5 flex gap-1">
        {([
          { key:'all',       label:'الكل',           count: filtered.length },
          { key:'national',  label:'وطنية 🇩🇿',       count: holidays.filter(h=>h.type==='national').length },
          { key:'religious', label:'دينية ☪️',         count: holidays.filter(h=>h.type==='religious').length },
        ] as { key: typeof filter; label: string; count: number }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filter === f.key ? (f.key==='religious' ? '#7B1FA2' : '#1565C0') : 'transparent',
              color: filter === f.key ? '#fff' : 'rgba(255,255,255,0.45)',
            }}
          >
            {f.label}
            <span
              className="mr-1 px-1.5 py-0.5 rounded-full text-xs"
              style={{ background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
          <p className="text-white/40 text-sm">جار التحميل...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-white font-semibold text-sm mb-1">خطأ في التحميل</p>
          <p className="text-white/40 text-xs">تحقق من الاتصال بالإنترنت</p>
          <button
            onClick={() => { setError(false); setLoading(true); fetch('/api/holidays').then(r=>r.json()).then(d=>{setHolidays(d.holidays||[]);setLoading(false)}).catch(()=>{setError(true);setLoading(false)}) }}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background:'#1565C0' }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Upcoming Holidays */}
      {!loading && !error && upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-1">المناسبات القادمة</p>
          {upcoming.map((h, i) => {
            const days = daysUntil(h.date)
            const isToday = days === 0
            const isSoon  = days > 0 && days <= 7

            return (
              <div
                key={h.date + h.name}
                className="list-row"
                style={{
                  borderColor: isToday ? '#F9A825' : isSoon ? '#1976D2' : 'rgba(255,255,255,0.07)',
                  background:  isToday ? 'rgba(249,168,37,0.10)' : isSoon ? 'rgba(25,118,210,0.10)' : 'rgba(255,255,255,0.04)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: h.type==='religious' ? 'rgba(123,31,162,0.25)' : 'rgba(21,101,192,0.25)' }}
                >
                  {h.emoji}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-tight truncate">{h.name}</p>
                  <p className="text-white/45 text-xs mt-0.5">{formatDate(h.date)}</p>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
                    style={{
                      background: h.type==='religious' ? 'rgba(123,31,162,0.3)' : 'rgba(21,101,192,0.3)',
                      color: h.type==='religious' ? '#CE93D8' : '#90CAF9',
                    }}
                  >
                    {h.type === 'religious' ? 'ديني' : 'وطني'}
                  </span>
                </div>

                {/* Countdown */}
                <div className="text-center flex-shrink-0 min-w-[44px]">
                  {isToday ? (
                    <div>
                      <p className="text-yellow-400 font-black text-sm">اليوم</p>
                      <p className="text-yellow-400/60 text-xs">🎉</p>
                    </div>
                  ) : (
                    <div>
                      <p
                        className="font-black text-xl leading-none"
                        style={{ color: isSoon ? '#60A5FA' : 'rgba(255,255,255,0.5)' }}
                      >
                        {days}
                      </p>
                      <p className="text-white/35 text-xs">يوم</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Past Holidays */}
      {!loading && !error && passed.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-white/25 text-xs font-semibold uppercase tracking-wider px-1">مناسبات سابقة</p>
          {passed.slice(0, 5).map(h => (
            <div
              key={h.date + h.name}
              className="list-row"
              style={{ opacity:0.5 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:'rgba(255,255,255,0.06)' }}
              >
                {h.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 font-medium text-sm truncate">{h.name}</p>
                <p className="text-white/30 text-xs">{formatDate(h.date)}</p>
              </div>
              <span className="text-white/25 text-xs">مضت</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-white/40 text-sm">لا توجد مناسبات</p>
        </div>
      )}

      {/* Note */}
      <div className="glass-card p-3 flex items-center gap-2.5 mt-2">
        <span className="text-xl">ℹ️</span>
        <p className="text-white/40 text-xs leading-relaxed">
          المناسبات الدينية تواريخ تقريبية استناداً إلى التقويم الهجري.
          تتغير المواعيد الفعلية حسب إعلان الجهات الرسمية في الجزائر.
        </p>
      </div>

    </div>
  )
}
