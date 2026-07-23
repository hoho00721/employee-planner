'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { CalendarEvent } from '@/lib/types'
import type { ActivePage, AddType } from './MainApp'
import { EVENT_COLORS, EVENT_ICONS } from '@/lib/types'

type Props = {
  events: CalendarEvent[]
  loading: boolean
  onAdd: (type: AddType) => void
  onNavigate: (page: ActivePage) => void
  isLight?: boolean
  isFr?: boolean
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = time.getHours().toString().padStart(2,'0')
  const m = time.getMinutes().toString().padStart(2,'0')
  const s = time.getSeconds().toString().padStart(2,'0')
  const dayName = time.toLocaleDateString('ar-DZ',{ weekday:'long' })
  const dateStr = time.toLocaleDateString('ar-DZ',{ day:'numeric', month:'long', year:'numeric' })

  return (
    <div
      className="rounded-[20px] p-5 relative overflow-hidden"
      style={{ background:'linear-gradient(135deg,#1565C0 0%,#1976D2 50%,#0D47A1 100%)', boxShadow:'0 8px 32px rgba(21,101,192,0.40)' }}
    >
      {/* BG decoration */}
      <div style={{ position:'absolute', left:-20, bottom:-20, fontSize:120, opacity:0.06, lineHeight:1 }}>🕐</div>
      <div className="relative z-10">
        <p className="text-white/60 text-sm mb-1">{dayName}</p>
        <div className="flex items-end gap-2">
          <span className="font-black text-white leading-none" style={{ fontSize:52, fontVariantNumeric:'tabular-nums' }}>
            {h}:{m}
          </span>
          <span className="font-bold text-white/50 pb-1" style={{ fontSize:22, fontVariantNumeric:'tabular-nums' }}>
            :{s}
          </span>
        </div>
        <p className="text-white/55 text-sm mt-2">{dateStr}</p>
      </div>
    </div>
  )
}

function Countdown({ events }: { events: CalendarEvent[] }) {
  const today = new Date()
  today.setHours(0,0,0,0)
  const future = events
    .filter(e => new Date(e.date) > today)
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (future.length === 0) return null
  const next = future[0]
  const diff = Math.ceil((new Date(next.date).getTime() - today.getTime()) / 86400000)

  return (
    <div
      className="rounded-[18px] p-4 flex items-center gap-3"
      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: EVENT_COLORS[next.type] + '33' }}
      >
        {EVENT_ICONS[next.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/45 text-xs font-semibold mb-0.5">⏳ العد التنازلي</p>
        <p className="text-white font-bold text-sm truncate">{next.title}</p>
        <p className="text-white/40 text-xs">{next.date}</p>
      </div>
      <div className="text-center flex-shrink-0">
        <p className="font-black text-3xl leading-none" style={{ color: EVENT_COLORS[next.type] }}>{diff}</p>
        <p className="text-white/40 text-xs">يوم</p>
      </div>
    </div>
  )
}

function TodaySection({ events }: { events: CalendarEvent[] }) {
  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => e.date === today)
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-sm">أحداث اليوم</p>
        {todayEvents.length > 0 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background:'rgba(25,118,210,0.25)', color:'#90CAF9' }}
          >
            {todayEvents.length}
          </span>
        )}
      </div>
      {todayEvents.length === 0 ? (
        <div className="py-5 text-center">
          <p className="text-3xl mb-2">☀️</p>
          <p className="text-white/35 text-sm">يوم هادئ، لا أحداث مجدولة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayEvents.slice(0, 5).map(ev => (
            <div key={ev.id + ev.type} className="list-row">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: EVENT_COLORS[ev.type] + '30' }}
              >
                {EVENT_ICONS[ev.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${ev.completed ? 'line-through text-white/35' : 'text-white'}`}>
                  {ev.title}
                </p>
                {ev.time && <p className="text-white/40 text-xs">{ev.time}</p>}
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: EVENT_COLORS[ev.type] }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const quickAddAR: { icon:string; label:string; type:NonNullable<AddType>; bg:string }[] = [
  { icon:'📋', label:'مهمة',    type:'task',        bg:'#1565C0' },
  { icon:'📅', label:'موعد',    type:'appointment', bg:'#2E7D32' },
  { icon:'🎉', label:'مناسبة',  type:'occasion',    bg:'#7B1FA2' },
  { icon:'🌴', label:'إجازة',   type:'vacation',    bg:'#C62828' },
  { icon:'📝', label:'ملاحظة',  type:'note',        bg:'#E65100' },
]
const quickAddFR: { icon:string; label:string; type:NonNullable<AddType>; bg:string }[] = [
  { icon:'📋', label:'Tâche',   type:'task',        bg:'#1565C0' },
  { icon:'📅', label:'RDV',     type:'appointment', bg:'#2E7D32' },
  { icon:'🎉', label:'Occasion',type:'occasion',    bg:'#7B1FA2' },
  { icon:'🌴', label:'Congé',   type:'vacation',    bg:'#C62828' },
  { icon:'📝', label:'Note',    type:'note',        bg:'#E65100' },
]

export default function Dashboard({ events, loading, onAdd, onNavigate, isLight = false, isFr = false }: Props) {
  const { profile } = useAppStore()
  const quickAdd = isFr ? quickAddFR : quickAddAR
  const h = new Date().getHours()
  const greeting   = isFr
    ? (h<6 ? 'Bonne nuit' : h<12 ? 'Bonjour' : h<17 ? 'Bon après-midi' : 'Bonsoir')
    : (h<6 ? 'ليلة طيبة' : h<12 ? 'صباح الخير' : h<17 ? 'مساء الخير' : 'مساء النور')
  const greetEmoji = h < 6 ? '🌙' : h < 12 ? '☀️' : h < 17 ? '🌤️' : '🌅'

  const taskCount   = events.filter(e => e.type === 'task').length
  const apptCount   = events.filter(e => e.type === 'appointment').length
  const vacCount    = [...new Set(events.filter(e => e.type.startsWith('vacation')).map(e => e.id))].length

  const card   = isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.06)'
  const bdr    = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'
  const txt    = isLight ? '#1A2A4A' : '#fff'
  const sub    = isLight ? '#4A6A9A' : 'rgba(255,255,255,0.50)'

  return (
    <div className="space-y-3 animate-slide-up">

      {/* Greeting */}
      <div className="rounded-[20px] p-4" style={{ background:card, border:`1px solid ${bdr}`, boxShadow: isLight?'0 2px 16px rgba(0,0,0,0.06)':'none' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-black text-white"
            style={{ background:'linear-gradient(135deg,#1565C0,#0D47A1)' }}
          >
            {profile?.fullName?.charAt(0) || greetEmoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm" style={{ color: sub }}>{greetEmoji} {greeting}</p>
            <h2 className="font-black leading-tight truncate" style={{ fontSize:20, color:txt }}>
              {profile?.fullName || (isFr ? 'Bonjour!' : 'مرحباً!')}
            </h2>
            {profile?.jobTitle && (
              <p className="text-xs truncate" style={{ color: sub }}>{profile.jobTitle}{profile.employer ? ` · ${profile.employer}` : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Clock */}
      <LiveClock />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon:'📋', label:'المهام',    count: taskCount,  color:'#1976D2', bg:'rgba(25,118,210,0.15)' },
          { icon:'📅', label:'المواعيد',  count: apptCount,  color:'#2E7D32', bg:'rgba(46,125,50,0.15)' },
          { icon:'🏖️', label:'الإجازات', count: vacCount,   color:'#F57F17', bg:'rgba(245,127,23,0.15)' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-[18px] p-3 text-center"
            style={{ background: s.bg, border:`1px solid ${s.color}30` }}
          >
            <span style={{ fontSize:22 }}>{s.icon}</span>
            <div className="font-black mt-1 text-2xl leading-none" style={{ color: s.color }}>{s.count}</div>
            <div className="text-white/50 text-xs mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Countdown */}
      {!loading && <Countdown events={events} />}

      {/* Quick Add */}
      <div className="glass-card p-4">
        <p className="text-white/50 text-xs font-semibold mb-3 tracking-wider uppercase">⚡ إضافة سريعة</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {quickAdd.map(item => (
            <button
              key={item.type}
              onClick={() => onAdd(item.type)}
              className="flex flex-col items-center gap-2 flex-shrink-0 transition-all active:scale-90"
              style={{ minWidth: 62 }}
            >
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: item.bg + '30', border:`1.5px solid ${item.bg}55` }}
              >
                {item.icon}
              </span>
              <span className="text-white/55 text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today events */}
      {!loading && <TodaySection events={events} />}

      {/* Calendar shortcut */}
      <button
        onClick={() => onNavigate('calendar')}
        className="w-full glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div className="text-right">
            <p className="text-white font-bold text-sm">التقويم الكامل</p>
            <p className="text-white/40 text-xs">عرض جميع الأحداث</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-40">
          <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* National holidays shortcut */}
      <button
        onClick={() => onNavigate('holidays')}
        className="w-full rounded-[18px] p-4 flex items-center justify-between active:scale-[0.98] transition-all"
        style={{ background:'rgba(46,125,50,0.15)', border:'1px solid rgba(46,125,50,0.25)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇩🇿</span>
          <div className="text-right">
            <p className="text-white font-bold text-sm">المناسبات الوطنية</p>
            <p className="text-white/40 text-xs">أعياد وعطل الجزائر</p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-40">
          <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

    </div>
  )
}
