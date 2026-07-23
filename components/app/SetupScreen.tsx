'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import Image from 'next/image'

type Props = { onComplete: () => void }

export default function SetupScreen({ onComplete }: Props) {
  const { setProfile } = useAppStore()
  const [form, setForm] = useState({
    fullName: '', gender: '', birthDate: '', jobTitle: '',
    employer: '', city: '', language: 'ar',
    theme: 'dark', accentColor: 'blue', birthdayReminderDays: 1,
  })
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { toast.error('يرجى إدخال الاسم الكامل'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
        toast.success(`مرحباً ${form.fullName}! 🎉`)
        onComplete()
      }
    } catch { toast.error('حدث خطأ، يرجى المحاولة مجدداً') }
    finally { setLoading(false) }
  }

  return (
    <div
      className="app-bg flex flex-col relative overflow-hidden"
      style={{ minHeight: '100dvh' }}
    >
      {/* Glow blobs */}
      <div className="glow-blob" style={{ width:300,height:300,background:'#1565C0',top:-60,right:-60,position:'absolute',zIndex:0 }} />
      <div className="glow-blob" style={{ width:220,height:220,background:'#2E7D32',bottom:-40,left:-40,position:'absolute',zIndex:0 }} />

      {/* ── Header ─────────────────────────────────────────────
          paddingTop = status-bar height (safe-area) + 12px gap
          min 52px so it's never too tight on small phones     */}
      <div
        className="flex items-center gap-3 px-4 relative z-10 flex-shrink-0"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 12px, 52px)',
          paddingBottom: 14,
          background: 'rgba(10,22,40,0.65)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Image src="/app-icon.png" alt="logo" width={38} height={38} className="rounded-2xl flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-white font-black text-lg leading-none truncate">منظم الموظف</h1>
          <p className="text-white/45 text-xs mt-0.5">إعداد الملف الشخصي</p>
        </div>
      </div>

      {/* ── Scrollable Form ──────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide relative z-10"
        style={{
          padding: '16px 16px',
          /* Reserve space above gesture-nav bar */
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 24px, 40px)',
        }}
      >
        <div className="space-y-4 max-w-[480px] mx-auto">

          {/* Welcome card */}
          <div
            className="rounded-[22px] p-5 text-center"
            style={{ background:'linear-gradient(135deg,#1565C0,#0D47A1)', boxShadow:'0 8px 32px rgba(21,101,192,0.4)' }}
          >
            <p className="text-4xl mb-2">👋</p>
            <h2 className="text-white font-black text-xl">أهلاً وسهلاً!</h2>
            <p className="text-white/60 text-sm mt-1">أدخل بياناتك لتخصيص تجربتك</p>
          </div>

          {/* ── Full Name — required ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">
              الاسم الكامل <span className="text-red-400">*</span>
            </label>
            <input
              className="app-input"
              placeholder="أدخل اسمك الكامل"
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              autoComplete="name"
              /* inputMode="text" already default — explicit for clarity */
              inputMode="text"
              autoCapitalize="words"
            />
          </div>

          {/* ── Gender — min-height 48px tap targets ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">الجنس</label>
            <div className="flex gap-2">
              {[{ v:'male',l:'ذكر 👨' },{ v:'female',l:'أنثى 👩' },{ v:'',l:'غير محدد' }].map(g => (
                <button
                  key={g.v}
                  onClick={() => set('gender', g.v)}
                  className="flex-1 rounded-2xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    minHeight: 48,
                    background: form.gender === g.v ? '#1565C0' : 'rgba(255,255,255,0.06)',
                    border: form.gender === g.v ? '1.5px solid #1976D2' : '1.5px solid rgba(255,255,255,0.10)',
                    color: form.gender === g.v ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {g.l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Birth date ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">تاريخ الميلاد (اختياري)</label>
            <input
              type="date"
              className="app-input"
              value={form.birthDate}
              onChange={e => set('birthDate', e.target.value)}
              /* Android date picker requires explicit max to avoid year 2099 */
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* ── Job title ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">الوظيفة / المهنة</label>
            <input
              className="app-input"
              placeholder="مهندس، محاسب، مدير..."
              value={form.jobTitle}
              onChange={e => set('jobTitle', e.target.value)}
              autoComplete="organization-title"
              inputMode="text"
            />
          </div>

          {/* ── Employer ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">جهة العمل</label>
            <input
              className="app-input"
              placeholder="اسم الشركة أو المؤسسة"
              value={form.employer}
              onChange={e => set('employer', e.target.value)}
              autoComplete="organization"
              inputMode="text"
            />
          </div>

          {/* ── City ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">المدينة / الولاية</label>
            <input
              className="app-input"
              placeholder="الجزائر، وهران، قسنطينة..."
              value={form.city}
              onChange={e => set('city', e.target.value)}
              autoComplete="address-level2"
              inputMode="text"
            />
          </div>

          {/* ── Language — min-height 52px ── */}
          <div>
            <label className="text-white/60 text-xs font-semibold block mb-2">اللغة المفضلة</label>
            <div className="flex gap-2">
              {[{ v:'ar',l:'🇩🇿 العربية' },{ v:'fr',l:'🇫🇷 Français' }].map(lang => (
                <button
                  key={lang.v}
                  onClick={() => set('language', lang.v)}
                  className="flex-1 rounded-2xl text-sm font-bold transition-all active:scale-95"
                  style={{
                    minHeight: 52,
                    background: form.language === lang.v ? '#1565C0' : 'rgba(255,255,255,0.06)',
                    border: form.language === lang.v ? '1.5px solid #1976D2' : '1.5px solid rgba(255,255,255,0.10)',
                    color: form.language === lang.v ? '#fff' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {lang.l}
                </button>
              ))}
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary mt-2"
            style={{ minHeight: 52, fontSize: 16 }}
          >
            {loading ? '⏳ جار الحفظ...' : '🚀 بدء استخدام التطبيق'}
          </button>

        </div>
      </div>
    </div>
  )
}
