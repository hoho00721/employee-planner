'use client'
import { useAppStore } from '@/lib/store'
import type { ActivePage, AddType } from './MainApp'
import Image from 'next/image'

type Props = {
  open: boolean
  activePage: ActivePage
  onNavigate: (page: ActivePage) => void
  onAdd: (type: AddType) => void
  onClose: () => void
  isLight?: boolean
  isFr?: boolean
}

const navItems: { icon: string; label: string; page: ActivePage; color: string }[] = [
  { icon: '🏠', label: 'الصفحة الرئيسية',    page: 'dashboard', color: '#1976D2' },
  { icon: '📅', label: 'التقويم',             page: 'calendar',  color: '#0288D1' },
  { icon: '🇩🇿', label: 'المناسبات الوطنية',  page: 'holidays',  color: '#2E7D32' },
  { icon: '📦', label: 'الأرشيف',             page: 'archive',   color: '#7B1FA2' },
  { icon: '📊', label: 'الإحصائيات',          page: 'stats',     color: '#E65100' },
  { icon: '👤', label: 'الملف الشخصي',        page: 'profile',   color: '#00695C' },
  { icon: '⚙️', label: 'الإعدادات',           page: 'settings',  color: '#455A64' },
  { icon: 'ℹ️', label: 'حول التطبيق',         page: 'about',     color: '#4527A0' },
]

const addItems: { icon: string; label: string; type: NonNullable<AddType>; color: string }[] = [
  { icon: '📋', label: 'إضافة مهمة',           type: 'task',             color: '#1976D2' },
  { icon: '📅', label: 'إضافة موعد',           type: 'appointment',      color: '#2E7D32' },
  { icon: '🎉', label: 'إضافة مناسبة',         type: 'occasion',         color: '#7B1FA2' },
  { icon: '🏖️', label: 'إجازة تعويضية',       type: 'vacation_comp',    color: '#F57F17' },
  { icon: '🌴', label: 'إجازة سنوية',          type: 'vacation_annual',  color: '#C62828' },
  { icon: '📝', label: 'إضافة ملاحظة',         type: 'note',             color: '#E65100' },
]

export default function Sidebar({ open, activePage, onNavigate, onAdd, onClose, isLight = false, isFr = false }: Props) {
  const { profile } = useAppStore()

  return (
    <>
      {/* Sidebar Panel */}
      <div
        className="fixed top-0 right-0 z-50 flex flex-col"
        style={{
          width: 'min(300px, 85vw)',
          height: '100dvh',  /* dvh handles Android address-bar shift */
          transform: open ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          background: 'linear-gradient(180deg, #0A1628 0%, #0D1F3E 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: open ? '-12px 0 48px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Profile Header — paddingTop includes status bar */}
        <div
          className="px-5 pb-5 flex-shrink-0"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px) + 12px, 52px)',
            borderBottom:'1px solid rgba(255,255,255,0.07)',
            background:'rgba(21,101,192,0.12)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#1565C0,#0D47A1)', boxShadow:'0 4px 16px rgba(21,101,192,0.4)' }}
            >
              {profile?.fullName?.charAt(0) || '؟'}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-base truncate leading-tight">{profile?.fullName || 'المستخدم'}</p>
              <p className="text-white/50 text-xs mt-0.5 truncate">{profile?.jobTitle || 'موظف'}</p>
              {profile?.employer && <p className="text-white/35 text-xs truncate">{profile.employer}</p>}
            </div>
          </div>
        </div>

        {/* Scrollable Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3">

          {/* Navigation section */}
          <p className="text-white/25 text-xs font-semibold tracking-widest uppercase px-2 mb-2 mt-1">القائمة الرئيسية</p>
          {navItems.map(item => {
            const active = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all active:scale-95 text-right"
                style={{
                  background: active ? item.color + '2A' : 'transparent',
                  border: active ? `1px solid ${item.color}40` : '1px solid transparent',
                }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: item.color + '22' }}
                >
                  {item.icon}
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.65)' }}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="mr-auto w-1.5 h-5 rounded-full" style={{ background: item.color }} />
                )}
              </button>
            )
          })}

          {/* Divider */}
          <div className="my-3 border-t border-white/[0.06]" />

          {/* Add section */}
          <p className="text-white/25 text-xs font-semibold tracking-widest uppercase px-2 mb-2">إضافة جديد</p>
          {addItems.map(item => (
            <button
              key={item.type}
              onClick={() => onAdd(item.type)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all active:scale-95 text-right"
              style={{ background:'transparent', border:'1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = item.color + '18')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: item.color + '22', border:`1px solid ${item.color}44` }}
              >
                {item.icon}
              </span>
              <span className="text-white/65 font-medium text-sm">{item.label}</span>
              <svg className="mr-auto opacity-30" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          ))}
        </div>

        {/* Footer — safe-bottom for gesture nav bar */}
        <div
          className="px-4 flex items-center gap-3 flex-shrink-0"
          style={{
            paddingTop: 12, paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 8px, 16px)',
            borderTop:'1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Image src="/app-icon.png" alt="logo" width={30} height={30} className="rounded-xl" />
          <div>
            <p className="text-white/60 text-xs font-semibold">منظم الموظف EP</p>
            <p className="text-white/25 text-xs">الإصدار 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
