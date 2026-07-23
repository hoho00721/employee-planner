'use client'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import type { ActivePage } from './MainApp'

type Props = {
  onNavigate: (page: ActivePage) => void
  isLight: boolean
  isFr: boolean
}

const T = {
  title:       { ar:'الإعدادات',          fr:'Paramètres' },
  subtitle:    { ar:'ضبط التطبيق وتخصيصه', fr:'Personnaliser l\'application' },
  appearance:  { ar:'المظهر',             fr:'Apparence' },
  dark:        { ar:'داكن 🌙',            fr:'Sombre 🌙' },
  light:       { ar:'فاتح ☀️',            fr:'Clair ☀️' },
  lang:        { ar:'اللغة',              fr:'Langue' },
  arabic:      { ar:'العربية 🇸🇦',         fr:'Arabe 🇸🇦' },
  french:      { ar:'الفرنسية 🇫🇷',        fr:'Français 🇫🇷' },
  navigation:  { ar:'التنقل السريع',       fr:'Navigation rapide' },
  profile:     { ar:'الملف الشخصي',       fr:'Profil' },
  profileDesc: { ar:'تعديل بياناتك',      fr:'Modifier vos données' },
  stats:       { ar:'الإحصائيات',         fr:'Statistiques' },
  statsDesc:   { ar:'تقارير وإحصائيات',   fr:'Rapports et stats' },
  archive:     { ar:'الأرشيف',            fr:'Archive' },
  archiveDesc: { ar:'إدارة البيانات',     fr:'Gérer les données' },
  appInfo:     { ar:'معلومات التطبيق',     fr:'Infos application' },
  version:     { ar:'الإصدار',            fr:'Version' },
  platform:    { ar:'المنصة',             fr:'Plateforme' },
  database:    { ar:'قاعدة البيانات',     fr:'Base de données' },
  danger:      { ar:'منطقة الخطر',        fr:'Zone de danger' },
  clearAll:    { ar:'حذف جميع البيانات',   fr:'Supprimer toutes les données' },
  cleared:     { ar:'تم حذف جميع البيانات', fr:'Toutes les données supprimées' },
  confirmClear:{ ar:'هل أنت متأكد من حذف جميع البيانات؟', fr:'Confirmer la suppression de toutes les données ?' },
  error:       { ar:'حدث خطأ',            fr:'Une erreur est survenue' },
}
const t = (key: keyof typeof T, isFr: boolean) => T[key][isFr ? 'fr' : 'ar']

export default function SettingsPage({ onNavigate, isLight, isFr }: Props) {
  const { theme, language, setTheme, setLanguage } = useAppStore()

  const card    = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.06)'
  const border  = isLight ? 'rgba(0,0,0,0.07)'       : 'rgba(255,255,255,0.09)'
  const title   = isLight ? '#1A2A4A'                 : '#fff'
  const sub     = isLight ? '#4A6A9A'                 : 'rgba(255,255,255,0.50)'
  const divider = isLight ? 'rgba(0,0,0,0.07)'        : 'rgba(255,255,255,0.07)'

  const handleClearData = async () => {
    if (!confirm(t('confirmClear', isFr))) return
    try {
      const [tsk, apt, occ, vac, nts] = await Promise.all([
        fetch('/api/tasks').then(r=>r.json()),
        fetch('/api/appointments').then(r=>r.json()),
        fetch('/api/occasions').then(r=>r.json()),
        fetch('/api/vacations').then(r=>r.json()),
        fetch('/api/notes').then(r=>r.json()),
      ])
      await Promise.all([
        ...(tsk.tasks||[]).map((x:{id:number})=>fetch(`/api/tasks?id=${x.id}`,{method:'DELETE'})),
        ...(apt.appointments||[]).map((x:{id:number})=>fetch(`/api/appointments?id=${x.id}`,{method:'DELETE'})),
        ...(occ.occasions||[]).map((x:{id:number})=>fetch(`/api/occasions?id=${x.id}`,{method:'DELETE'})),
        ...(vac.vacations||[]).map((x:{id:number})=>fetch(`/api/vacations?id=${x.id}`,{method:'DELETE'})),
        ...(nts.notes||[]).map((x:{id:number})=>fetch(`/api/notes?id=${x.id}`,{method:'DELETE'})),
      ])
      toast.success(t('cleared', isFr))
    } catch { toast.error(t('error', isFr)) }
  }

  const shortcutItems = [
    { icon:'👤', titleKey:'profile' as const, descKey:'profileDesc' as const, page:'profile' as ActivePage, color:'#1565C0' },
    { icon:'📊', titleKey:'stats'   as const, descKey:'statsDesc'   as const, page:'stats'   as ActivePage, color:'#2E7D32' },
    { icon:'📦', titleKey:'archive' as const, descKey:'archiveDesc' as const, page:'archive' as ActivePage, color:'#7B1FA2' },
  ]

  const SectionTitle = ({ label }: { label: string }) => (
    <p className="text-xs font-bold uppercase tracking-widest px-1 mb-2" style={{ color: sub }}>
      {label}
    </p>
  )

  const OptionRow = ({
    active, onClick, children,
  }: { active: boolean; onClick: ()=>void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
      style={{
        background: active ? '#1565C0' : isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
        border: active ? '1.5px solid #1976D2' : `1.5px solid ${border}`,
        color: active ? '#fff' : sub,
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Header */}
      <div
        className="rounded-[20px] p-4"
        style={{ background: card, border:`1px solid ${border}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <h2 className="font-black text-lg" style={{ color: title }}>⚙️ {t('title', isFr)}</h2>
        <p className="text-sm mt-0.5" style={{ color: sub }}>{t('subtitle', isFr)}</p>
      </div>

      {/* ─── Appearance ─── */}
      <div
        className="rounded-[20px] p-4 space-y-3"
        style={{ background: card, border:`1px solid ${border}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <SectionTitle label={t('appearance', isFr)} />
        <div className="flex gap-2">
          <OptionRow active={theme === 'dark'}  onClick={() => setTheme('dark')}>
            {t('dark', isFr)}
          </OptionRow>
          <OptionRow active={theme === 'light'} onClick={() => setTheme('light')}>
            {t('light', isFr)}
          </OptionRow>
        </div>
      </div>

      {/* ─── Language ─── */}
      <div
        className="rounded-[20px] p-4 space-y-3"
        style={{ background: card, border:`1px solid ${border}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <SectionTitle label={t('lang', isFr)} />
        <div className="flex gap-2">
          <OptionRow active={language === 'ar'} onClick={() => setLanguage('ar')}>
            {t('arabic', isFr)}
          </OptionRow>
          <OptionRow active={language === 'fr'} onClick={() => setLanguage('fr')}>
            {t('french', isFr)}
          </OptionRow>
        </div>
      </div>

      {/* ─── Navigation shortcuts ─── */}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: card, border:`1px solid ${border}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <div className="px-4 pt-4 pb-2">
          <SectionTitle label={t('navigation', isFr)} />
        </div>
        {shortcutItems.map((s, i) => (
          <button
            key={s.page}
            onClick={() => onNavigate(s.page)}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-all active:scale-[0.98] text-right"
            style={{
              borderTop: i > 0 ? `1px solid ${divider}` : 'none',
              background: 'transparent',
            }}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: s.color + '22' }}
            >
              {s.icon}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: title }}>{t(s.titleKey, isFr)}</p>
              <p className="text-xs" style={{ color: sub }}>{t(s.descKey, isFr)}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity:0.3 }}>
              <path d="M15 18l-6-6 6-6" stroke={title} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>

      {/* ─── App Info ─── */}
      <div
        className="rounded-[20px] p-4"
        style={{ background: card, border:`1px solid ${border}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <SectionTitle label={t('appInfo', isFr)} />
        <div className="space-y-2.5">
          {[
            { key: t('version',  isFr), val: '1.0.0' },
            { key: t('platform', isFr), val: 'Web App' },
            { key: t('database', isFr), val: 'PostgreSQL' },
          ].map(info => (
            <div key={info.key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: sub }}>{info.key}</span>
              <span className="text-sm font-semibold" style={{ color: title }}>{info.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Danger zone ─── */}
      <div
        className="rounded-[20px] p-4"
        style={{ background: card, border:'1px solid rgba(239,68,68,0.20)', boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        <SectionTitle label={t('danger', isFr)} />
        <button
          onClick={handleClearData}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
          style={{ border:'1.5px solid rgba(239,68,68,0.35)', color:'#EF4444', background:'rgba(239,68,68,0.06)' }}
        >
          🗑️ {t('clearAll', isFr)}
        </button>
      </div>

    </div>
  )
}
