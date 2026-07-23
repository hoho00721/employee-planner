'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import CalendarView from './CalendarView'
import Archive from './Archive'
import Statistics from './Statistics'
import ProfilePage from './ProfilePage'
import AddEventModal from './AddEventModal'
import SettingsPage from './SettingsPage'
import AboutPage from './AboutPage'
import NationalHolidays from './NationalHolidays'
import { useEvents } from '@/hooks/use-events'
import { useNetwork } from '@/hooks/use-network'
import { useNotifications } from '@/hooks/use-notifications'
import { requestNotificationPermission } from '@/lib/notifications'
import NotificationsPanel from './NotificationsPanel'
import SearchPanel from './SearchPanel'
import Image from 'next/image'

export type ActivePage =
  | 'dashboard' | 'calendar' | 'archive' | 'stats'
  | 'profile' | 'settings' | 'about' | 'holidays'

export type AddType = 'task' | 'appointment' | 'occasion' | 'vacation' | 'vacation_annual' | 'vacation_comp' | 'note' | null

const PAGE_TITLES_AR: Record<ActivePage, string> = {
  dashboard: 'الرئيسية',
  calendar: 'التقويم',
  archive: 'الأرشيف',
  stats: 'الإحصائيات',
  profile: 'الملف الشخصي',
  settings: 'الإعدادات',
  about: 'حول التطبيق',
  holidays: 'المناسبات الوطنية',
}
const PAGE_TITLES_FR: Record<ActivePage, string> = {
  dashboard: 'Accueil',
  calendar: 'Calendrier',
  archive: 'Archive',
  stats: 'Statistiques',
  profile: 'Mon Profil',
  settings: 'Paramètres',
  about: "À propos",
  holidays: 'Fêtes Nationales',
}

const NAV_TABS_AR = [
  { page: 'dashboard' as ActivePage, icon: '🏠', label: 'الرئيسية' },
  { page: 'calendar'  as ActivePage, icon: '📅', label: 'التقويم' },
  { page: 'archive'   as ActivePage, icon: '📦', label: 'الأرشيف' },
  { page: 'stats'     as ActivePage, icon: '📊', label: 'إحصائيات' },
  { page: 'profile'   as ActivePage, icon: '👤', label: 'حسابي' },
]
const NAV_TABS_FR = [
  { page: 'dashboard' as ActivePage, icon: '🏠', label: 'Accueil' },
  { page: 'calendar'  as ActivePage, icon: '📅', label: 'Agenda' },
  { page: 'archive'   as ActivePage, icon: '📦', label: 'Archive' },
  { page: 'stats'     as ActivePage, icon: '📊', label: 'Stats' },
  { page: 'profile'   as ActivePage, icon: '👤', label: 'Profil' },
]

export default function MainApp() {
  const { sidebarOpen, setSidebarOpen, theme, language } = useAppStore()
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [addType, setAddType] = useState<AddType>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { events, loading, offline, refetch } = useEvents()
  const { online, pendingSync } = useNetwork()
  const { notifications, unreadCount } = useNotifications(events)

  const isLight = theme === 'light'
  const isFr = language === 'fr'
  const PAGE_TITLES = isFr ? PAGE_TITLES_FR : PAGE_TITLES_AR
  const NAV_TABS = isFr ? NAV_TABS_FR : NAV_TABS_AR

  // Apply theme class to html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Request notification permission once after setup
  useEffect(() => {
    const timer = setTimeout(() => {
      requestNotificationPermission().catch(() => {})
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page)
    setSidebarOpen(false)
  }
  const handleAdd = (type: AddType) => {
    setAddType(type)
    setSidebarOpen(false)
  }

  const isBottomNavPage = NAV_TABS.some(t => t.page === activePage)

  // Theme colors
  const bg = isLight
    ? 'linear-gradient(160deg,#E8EEF8 0%,#D6E4F5 40%,#EDF2FB 100%)'
    : 'linear-gradient(160deg,#0D1B3E 0%,#0F2550 30%,#112240 60%,#0A1628 100%)'

  const headerBg = isLight
    ? 'rgba(255,255,255,0.88)'
    : 'rgba(10,22,40,0.88)'
  const headerBorder = isLight
    ? 'rgba(0,0,0,0.07)'
    : 'rgba(255,255,255,0.07)'
  const titleColor    = isLight ? '#1A2A4A' : '#fff'
  const iconBg        = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'
  const iconStroke    = isLight ? 'rgba(30,40,80,0.7)' : 'rgba(255,255,255,0.85)'
  const bottomNavBg   = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,22,40,0.95)'
  const bottomNavBorder= isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.09)'
  const fabBg         = 'linear-gradient(135deg,#1565C0,#1976D2)'

  return (
    <div style={{ background: bg, minHeight:'100dvh' }}>

      {/* Background glow blobs (only in dark) */}
      {!isLight && (
        <>
          <div className="glow-blob" style={{ width:340,height:340,background:'#1565C0',top:-80,right:-80,position:'fixed',zIndex:0 }} />
          <div className="glow-blob" style={{ width:260,height:260,background:'#2E7D32',bottom:-60,left:-60,position:'fixed',zIndex:0 }} />
          <div className="glow-blob" style={{ width:200,height:200,background:'#1976D2',top:'45%',left:'10%',position:'fixed',zIndex:0 }} />
        </>
      )}

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/55 z-40"
          style={{ backdropFilter:'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        activePage={activePage}
        onNavigate={handleNavigate}
        onAdd={handleAdd}
        onClose={() => setSidebarOpen(false)}
        isLight={isLight}
        isFr={isFr}
      />

      {/* Mobile Shell */}
      <div className="mobile-shell">

        {/* Top App Bar — 60px min-height + status bar safe area */}
        <header
          className="flex items-center justify-between px-3 relative z-20 flex-shrink-0"
          style={{
            minHeight: 60,
            paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
            paddingBottom: 8,
            background: headerBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${headerBorder}`,
            boxShadow: isLight ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {/* Hamburger — 44×44 tap target */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-2xl transition-all active:scale-90 flex-shrink-0"
            style={{ width:44, height:44, background: iconBg }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5"  width="16" height="2" rx="1" fill={iconStroke} />
              <rect x="2" y="9"  width="11" height="2" rx="1" fill={iconStroke} />
              <rect x="2" y="13" width="14" height="2" rx="1" fill={iconStroke} />
            </svg>
          </button>

          {/* Title — centered, min-w-0 prevents overflow */}
          <div className="flex items-center gap-2 flex-1 justify-center min-w-0 px-2">
            <Image
              src="/app-icon.png"
              alt="منظم الموظف"
              width={28} height={28}
              className="rounded-xl flex-shrink-0"
              style={{ objectFit:'cover' }}
            />
            <span className="font-bold truncate" style={{ fontSize:15, letterSpacing:'-0.3px', color: titleColor }}>
              {PAGE_TITLES[activePage]}
            </span>
          </div>

          {/* Right actions — 44×44 each */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center rounded-2xl transition-all active:scale-90"
              style={{ width:44, height:44, background: iconBg }}
              aria-label="بحث"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke={iconStroke} strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke={iconStroke} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <button
              onClick={() => setNotifOpen(v => !v)}
              className="flex items-center justify-center rounded-2xl transition-all active:scale-90 relative"
              style={{ width:44, height:44, background: notifOpen ? 'rgba(239,68,68,0.18)' : iconBg }}
              aria-label="الإشعارات"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V10c0-3.07-1.64-5.64-4.5-6.32V3a1.5 1.5 0 0 0-3 0v.68C7.63 4.36 6 6.92 6 10v6l-2 2v1h16v-1l-2-2z"
                  fill={notifOpen ? '#EF4444' : iconStroke}
                />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center font-black"
                  style={{
                    top:4, right:4,
                    minWidth:16, height:16,
                    borderRadius:99, fontSize:9,
                    background:'#EF4444', color:'#fff',
                    border:`2px solid ${isLight ? '#fff' : '#0a1628'}`,
                    lineHeight:1,
                    paddingInline: unreadCount > 9 ? 3 : 1,
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content — scrollable, reserves space for fixed bottom-nav */}
        <main
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{
            paddingBottom: isBottomNavPage
              ? 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 12px)'
              : '20px',
          }}
        >
          <div className="px-3 pt-3">
            {/* Offline / pending-sync banner */}
            {(!online || pendingSync > 0) && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-3 text-sm font-semibold"
                style={{
                  background: !online ? 'rgba(245,127,23,0.18)' : 'rgba(21,101,192,0.18)',
                  border: `1px solid ${!online ? 'rgba(245,127,23,0.40)' : 'rgba(21,101,192,0.40)'}`,
                  color: !online ? '#FB8C00' : '#60A5FA',
                }}
              >
                <span style={{ fontSize: 18 }}>{!online ? '📵' : '🔄'}</span>
                <span className="leading-tight">
                  {!online
                    ? (isFr ? 'Hors ligne — données en cache' : 'وضع عدم الاتصال — البيانات محلية')
                    : (isFr ? `${pendingSync} opération(s) en attente` : `${pendingSync} عملية في انتظار المزامنة`)}
                </span>
              </div>
            )}

            {activePage === 'dashboard' && <Dashboard events={events} loading={loading} onAdd={handleAdd} onNavigate={handleNavigate} isLight={isLight} isFr={isFr} />}
            {activePage === 'calendar'  && <CalendarView events={events} loading={loading} onAdd={handleAdd} isLight={isLight} isFr={isFr} />}
            {activePage === 'archive'   && <Archive refetch={refetch} isLight={isLight} isFr={isFr} />}
            {activePage === 'stats'     && <Statistics events={events} isLight={isLight} isFr={isFr} />}
            {activePage === 'profile'   && <ProfilePage isLight={isLight} isFr={isFr} />}
            {activePage === 'settings'  && <SettingsPage onNavigate={handleNavigate} isLight={isLight} isFr={isFr} />}
            {activePage === 'about'     && <AboutPage isLight={isLight} isFr={isFr} />}
            {activePage === 'holidays'  && <NationalHolidays isLight={isLight} isFr={isFr} />}
          </div>

          {/* ============ FOOTER BAR ============ */}
          <footer
            className="mx-3 mb-4 mt-6 rounded-2xl px-4 py-3 text-center"
            style={{
              background: isLight ? 'rgba(21,101,192,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isLight ? 'rgba(21,101,192,0.15)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <p
              className="font-semibold leading-relaxed"
              style={{ fontSize:12, color: isLight ? '#1A3A6A' : 'rgba(255,255,255,0.45)' }}
            >
              تم التطوير بواسطة{' '}
              <span style={{ color: isLight ? '#1565C0' : '#60A5FA', fontWeight:700 }}>
                El Hocine Birech
              </span>
            </p>
            <p style={{ fontSize:11, color: isLight ? '#3A5A8A' : 'rgba(255,255,255,0.30)', marginTop:2 }}>
              الإصدار 1.0.0 &nbsp;·&nbsp; © 2026
            </p>
          </footer>
        </main>

        {/* Bottom Navigation Bar — 64px + safe area bottom */}
        {isBottomNavPage && (
          <nav
            className="bottom-nav"
            style={{
              background: bottomNavBg,
              borderTop: `1px solid ${bottomNavBorder}`,
              boxShadow: isLight ? '0 -4px 20px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div
              className="flex items-center justify-around"
              style={{ height:'var(--bottom-nav-h)' }}
            >
              {NAV_TABS.map(tab => {
                const active = activePage === tab.page
                return (
                  <button
                    key={tab.page}
                    onClick={() => handleNavigate(tab.page)}
                    className="flex flex-col items-center justify-center transition-all active:scale-90"
                    style={{
                      flex:1, height:'100%',
                      background: active ? 'rgba(21,101,192,0.18)' : 'transparent',
                      borderRadius:12,
                    }}
                  >
                    <span style={{ fontSize:22, lineHeight:1 }}>{tab.icon}</span>
                    <span style={{
                      fontSize:10,
                      fontWeight: active ? 700 : 500,
                      color: active ? '#1976D2' : isLight ? 'rgba(30,50,90,0.45)' : 'rgba(255,255,255,0.45)',
                      marginTop:3,
                    }}>
                      {tab.label}
                    </span>
                    {active && (
                      <div style={{ width:4,height:4,borderRadius:'50%',background:'#1976D2',marginTop:2 }} />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      {/* FAB — anchored above bottom-nav using CSS variable */}
      {isBottomNavPage && activePage !== 'profile' && (
        <button
          onClick={() => handleAdd('task')}
          className="fixed z-30 flex items-center justify-center active:scale-90 transition-all"
          style={{
            bottom:'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom,0px) + 12px)',
            left:'50%', transform:'translateX(-50%)',
            width:52, height:52, borderRadius:'50%',
            background: fabBg,
            boxShadow:'0 6px 24px rgba(21,101,192,0.55)',
            border:'2px solid rgba(255,255,255,0.15)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        open={notifOpen}
        notifications={notifications}
        onClose={() => setNotifOpen(false)}
        isLight={isLight}
        isFr={isFr}
      />

      {/* Search Panel */}
      <SearchPanel
        open={searchOpen}
        events={events}
        onClose={() => setSearchOpen(false)}
        isLight={isLight}
        isFr={isFr}
      />

      {addType && (
        <AddEventModal
          type={addType}
          onClose={() => setAddType(null)}
          onSaved={() => { setAddType(null); refetch() }}
          isLight={isLight}
          isFr={isFr}
        />
      )}
    </div>
  )
}
