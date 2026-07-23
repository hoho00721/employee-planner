'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export default function ProfilePage({ isLight = false, isFr = false }: { isLight?: boolean; isFr?: boolean }) {
  const { profile, setProfile } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: profile?.fullName || '',
    gender: profile?.gender || '',
    birthDate: profile?.birthDate || '',
    jobTitle: profile?.jobTitle || '',
    employer: profile?.employer || '',
    city: profile?.city || '',
    language: profile?.language || 'ar',
    theme: profile?.theme || 'dark',
    birthdayReminderDays: profile?.birthdayReminderDays || 1,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        gender: profile.gender || '',
        birthDate: profile.birthDate || '',
        jobTitle: profile.jobTitle || '',
        employer: profile.employer || '',
        city: profile.city || '',
        language: profile.language || 'ar',
        theme: profile.theme || 'dark',
        birthdayReminderDays: profile.birthdayReminderDays || 1,
      })
    }
  }, [profile])

  const calcAge = (birthDate: string) => {
    if (!birthDate) return null
    const diff = Date.now() - new Date(birthDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  const handleSave = async () => {
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
        toast.success('تم تحديث الملف الشخصي ✅')
        setEditing(false)
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const age = profile?.birthDate ? calcAge(profile.birthDate) : null

  return (
    <div className="space-y-3">
      {/* Profile Header */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {profile?.fullName?.charAt(0) || '؟'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl truncate">{profile?.fullName}</h2>
            {profile?.jobTitle && <p className="text-indigo-300 text-sm">{profile.jobTitle}</p>}
            {profile?.employer && <p className="text-white/50 text-xs mt-0.5">{profile.employer}</p>}
          </div>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {profile?.city && (
            <span className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">📍 {profile.city}</span>
          )}
          {age !== null && (
            <span className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">🎂 {age} سنة</span>
          )}
          {profile?.birthDate && (
            <span className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">
              🗓 {new Date(profile.birthDate).toLocaleDateString('ar-SA')}
            </span>
          )}
          {profile?.gender && (
            <span className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">
              {profile.gender === 'male' ? '👨 ذكر' : '👩 أنثى'}
            </span>
          )}
        </div>
      </div>

      {/* Edit Button */}
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl transition hover:opacity-90"
        >
          ✏️ تعديل الملف الشخصي
        </button>
      ) : (
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white font-bold text-base mb-2">تعديل البيانات</h3>

          {[
            { key: 'fullName', label: 'الاسم الكامل', type: 'text', placeholder: 'الاسم الكامل', required: true },
            { key: 'birthDate', label: 'تاريخ الميلاد', type: 'date', placeholder: '' },
            { key: 'jobTitle', label: 'الوظيفة', type: 'text', placeholder: 'المهنة أو الوظيفة' },
            { key: 'employer', label: 'جهة العمل', type: 'text', placeholder: 'اسم الشركة أو المؤسسة' },
            { key: 'city', label: 'المدينة', type: 'text', placeholder: 'المدينة أو الولاية' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-white/60 text-xs font-medium block mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition text-sm"
                placeholder={field.placeholder}
                value={(form as Record<string, string | number>)[field.key] as string}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              />
            </div>
          ))}

          {/* Gender */}
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1">الجنس</label>
            <select
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-400 transition text-sm appearance-none"
              value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            >
              <option value="" className="bg-gray-900">غير محدد</option>
              <option value="male" className="bg-gray-900">ذكر</option>
              <option value="female" className="bg-gray-900">أنثى</option>
            </select>
          </div>

          {/* Birthday reminder */}
          {form.birthDate && (
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">تذكير عيد الميلاد</label>
              <select
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-400 transition text-sm appearance-none"
                value={form.birthdayReminderDays}
                onChange={e => setForm(f => ({ ...f, birthdayReminderDays: parseInt(e.target.value) }))}
              >
                <option value={0} className="bg-gray-900">بدون تذكير</option>
                <option value={1} className="bg-gray-900">قبل يوم واحد</option>
                <option value={2} className="bg-gray-900">قبل يومين</option>
                <option value={7} className="bg-gray-900">قبل أسبوع</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-white/20 rounded-xl text-white/70 hover:bg-white/10 transition text-sm">
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm"
            >
              {loading ? 'جار الحفظ...' : '💾 حفظ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
