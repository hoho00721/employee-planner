'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import type { AddType } from './MainApp'
import { EVENT_ICONS, EVENT_LABELS_AR, EVENT_COLORS } from '@/lib/types'

type Props = {
  type: NonNullable<AddType>
  onClose: () => void
  onSaved: () => void
  isLight?: boolean
  isFr?: boolean
}

const REMINDER_OPTIONS_AR = [
  { label:'بدون تنبيه',  value:0 },
  { label:'15 دقيقة',   value:15 },
  { label:'30 دقيقة',   value:30 },
  { label:'ساعة واحدة', value:60 },
  { label:'يوم واحد',   value:1440 },
  { label:'يومان',      value:2880 },
  { label:'أسبوع',      value:10080 },
]
const REMINDER_OPTIONS_FR = [
  { label:'Pas de rappel', value:0 },
  { label:'15 minutes',    value:15 },
  { label:'30 minutes',    value:30 },
  { label:'1 heure',       value:60 },
  { label:'1 jour',        value:1440 },
  { label:'2 jours',       value:2880 },
  { label:'1 semaine',     value:10080 },
]

const LABELS_FR: Partial<Record<NonNullable<AddType>, string>> = {
  task: 'Tâche', appointment: 'Rendez-vous', occasion: 'Occasion',
  vacation: 'Congé', vacation_annual: 'Congé annuel', vacation_comp: 'Congé compensatoire',
  note: 'Note',
}
const ICONS_FR: Partial<Record<NonNullable<AddType>, string>> = {
  vacation:'🏖️', vacation_annual:'🌴', vacation_comp:'🏖️',
}

export default function AddEventModal({ type, onClose, onSaved, isLight = false, isFr = false }: Props) {
  // "vacation" is the unified type from the dashboard quick-add
  const isVacationUnified = type === 'vacation'
  const isVacation = type.startsWith('vacation')

  // For vacation_annual / vacation_comp coming from sidebar, derive initial subtype
  const initialSubtype: 'annual' | 'compensatory' =
    type === 'vacation_comp' ? 'compensatory' : 'annual'

  const [vacationType, setVacationType] = useState<'annual' | 'compensatory'>(initialSubtype)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:  '',
    date:   new Date().toISOString().split('T')[0],
    time:   '',
    notes:  '',
    days:   1,
    recurring: false,
    reminderMinutesBefore: 30,
    reminderDaysBefore:    1,
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  // Resolved type for display (color, icon, label)
  const resolvedType: NonNullable<AddType> = isVacationUnified
    ? (vacationType === 'annual' ? 'vacation_annual' : 'vacation_comp')
    : type

  const color = EVENT_COLORS[resolvedType] ?? '#1565C0'
  const icon  = ICONS_FR[resolvedType] ?? EVENT_ICONS[resolvedType] ?? '🏖️'

  // Label
  const label = isFr
    ? (LABELS_FR[resolvedType] ?? 'Congé')
    : (resolvedType === 'vacation' || resolvedType === 'vacation_annual' || resolvedType === 'vacation_comp')
      ? 'إجازة'
      : EVENT_LABELS_AR[resolvedType as keyof typeof EVENT_LABELS_AR] ?? ''

  const REMINDER_OPTIONS = isFr ? REMINDER_OPTIONS_FR : REMINDER_OPTIONS_AR

  // Sheet & input colors
  const sheetBg    = isLight ? '#F0F4FB'                : 'linear-gradient(180deg,#0D1B3E 0%,#0A1628 100%)'
  const inputBg    = isLight ? 'rgba(0,0,0,0.05)'       : 'rgba(255,255,255,0.06)'
  const inputBorder= isLight ? 'rgba(0,0,0,0.12)'       : 'rgba(255,255,255,0.12)'
  const inputColor = isLight ? '#1A2A4A'                : '#fff'
  const labelColor = isLight ? '#4A6A9A'                : 'rgba(255,255,255,0.55)'
  const placeholderStyle = isLight ? { color:'rgba(0,0,0,0.30)' } : { color:'rgba(255,255,255,0.28)' }

  const handleSave = async () => {
    if (!form.title.trim() && !isVacationUnified) { toast.error(isFr ? 'Veuillez saisir un titre' : 'يرجى إدخال العنوان'); return }
    setLoading(true)
    try {
      let endpoint = '/api/vacations'
      let body: Record<string, unknown> = {}

      if (type === 'task') {
        endpoint = '/api/tasks'
        body = { title:form.title, date:form.date, time:form.time||null, notes:form.notes||null, reminderMinutesBefore:form.reminderMinutesBefore }
      } else if (type === 'appointment') {
        endpoint = '/api/appointments'
        body = { title:form.title, date:form.date, time:form.time||null, notes:form.notes||null, reminderMinutesBefore:form.reminderMinutesBefore }
      } else if (type === 'occasion') {
        endpoint = '/api/occasions'
        body = { title:form.title, date:form.date, time:form.time||null, notes:form.notes||null, recurring:form.recurring, reminderMinutesBefore:form.reminderMinutesBefore }
      } else if (type === 'note') {
        endpoint = '/api/notes'
        body = { title:form.title, date:form.date, time:form.time||null, content:form.notes||null }
      } else if (isVacation) {
        endpoint = '/api/vacations'
        const end = new Date(form.date); end.setDate(end.getDate() + form.days - 1)
        const vType = isVacationUnified ? vacationType : (type === 'vacation_annual' ? 'annual' : 'compensatory')
        const autoTitle = isFr
          ? (vType === 'annual' ? 'Congé annuel' : 'Congé compensatoire')
          : (vType === 'annual' ? 'عطلة سنوية'  : 'عطلة تعويضية')
        body = {
          title: form.title.trim() || autoTitle,
          type:  vType,
          startDate: form.date,
          endDate:   end.toISOString().split('T')[0],
          days:      form.days,
          notes:     form.notes||null,
          reminderDaysBefore: form.reminderDaysBefore,
        }
      }

      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      if (res.ok) { toast.success(isFr ? 'Enregistré ✅' : 'تم الحفظ ✅'); onSaved() }
      else toast.error(isFr ? 'Erreur lors de l\'enregistrement' : 'خطأ في الحفظ')
    } catch { toast.error(isFr ? 'Erreur réseau' : 'خطأ في الاتصال') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/65"
        style={{ backdropFilter:'blur(6px)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[480px] rounded-t-[28px] z-10 overflow-y-auto scrollbar-hide"
        style={{
          /* 92dvh keeps the sheet below the status bar.
             On Android, dvh already accounts for the on-screen keyboard. */
          maxHeight: '92dvh',
          background: sheetBg,
          border: '1px solid rgba(255,255,255,0.10)',
          borderBottom: 'none',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom:`1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'}` }}
        >
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background:color+'30', border:`1.5px solid ${color}55` }}
          >
            {icon}
          </span>
          <div>
            <h3 className="font-black text-lg" style={{ color: isLight ? '#1A2A4A' : '#fff' }}>
              {isFr ? `Ajouter ${label}` : `إضافة ${label}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="mr-auto w-9 h-9 rounded-xl flex items-center justify-center transition"
            style={{ background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)', color: isLight ? '#4A6A9A' : 'rgba(255,255,255,0.45)' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 pb-8">

          {/* ── VACATION TYPE SELECTOR (shown when type is 'vacation' or any vacation_*) ── */}
          {isVacation && (
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
                {isFr ? 'Type de congé *' : 'نوع الإجازة *'}
              </label>
              <div className="flex gap-2">
                {[
                  { val:'annual'       as const, ar:'🌴 عطلة سنوية',       fr:'🌴 Congé annuel' },
                  { val:'compensatory' as const, ar:'🏖️ عطلة تعويضية',     fr:'🏖️ Congé compensatoire' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setVacationType(opt.val)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 text-center"
                    style={{
                      background: vacationType === opt.val ? color : inputBg,
                      border: vacationType === opt.val ? `1.5px solid ${color}` : `1.5px solid ${inputBorder}`,
                      color: vacationType === opt.val ? '#fff' : labelColor,
                    }}
                  >
                    {isFr ? opt.fr : opt.ar}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title — optional for unified vacation, required otherwise */}
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
              {isFr ? (isVacation ? 'Intitulé (optionnel)' : 'Titre *') : (isVacation ? 'ملاحظة / اسم (اختياري)' : 'العنوان *')}
            </label>
            <input
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
              style={{
                background: inputBg,
                border: `1.5px solid ${form.title ? color+'66' : inputBorder}`,
                color: inputColor,
                fontFamily:'Cairo,sans-serif',
                ...placeholderStyle,
              }}
              placeholder={isFr
                ? (isVacation ? 'Ex: Congé été 2026' : `Titre de ${label}`)
                : (isVacation ? 'مثال: عطلة صيف 2026' : `عنوان ${label}`)
              }
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus={!isVacation}
            />
          </div>

          {/* Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
                {isFr ? (isVacation ? 'Début *' : 'Date *') : (isVacation ? 'تاريخ البداية *' : 'التاريخ *')}
              </label>
              <input
                type="date"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor, fontFamily:'Cairo,sans-serif' }}
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
            {isVacation ? (
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
                  {isFr ? 'Nb. jours' : 'عدد الأيام'}
                </label>
                <input
                  type="number" min={1} max={365}
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                  style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor, fontFamily:'Cairo,sans-serif' }}
                  value={form.days}
                  onChange={e => set('days', parseInt(e.target.value)||1)}
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
                  {isFr ? 'Heure' : 'الوقت'}
                </label>
                <input
                  type="time"
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                  style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor }}
                  value={form.time}
                  onChange={e => set('time', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* End date preview */}
          {isVacation && form.date && (
            <div
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background:color+'18', border:`1px solid ${color}40` }}
            >
              <span className="text-sm" style={{ color: isLight ? '#1A2A4A' : 'rgba(255,255,255,0.60)' }}>
                {isFr ? 'Fin du congé' : 'تاريخ الانتهاء'}
              </span>
              <span className="font-bold text-sm" style={{ color: isLight ? '#1A2A4A' : '#fff' }}>
                {(() => {
                  const e = new Date(form.date); e.setDate(e.getDate() + form.days - 1)
                  return e.toLocaleDateString('fr-DZ',{ year:'numeric', month:'long', day:'numeric' })
                })()}
              </span>
            </div>
          )}

          {/* Recurring toggle */}
          {type === 'occasion' && (
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)', border:`1px solid ${inputBorder}` }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: inputColor }}>
                  {isFr ? 'Récurrent annuel' : 'تكرار سنوي'}
                </p>
                <p className="text-xs" style={{ color: labelColor }}>
                  {isFr ? 'Se répète chaque année' : 'يتكرر هذا الحدث كل سنة'}
                </p>
              </div>
              <button
                onClick={() => set('recurring', !form.recurring)}
                className="toggle-track"
                style={{ background: form.recurring ? '#1565C0' : isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }}
              >
                <div className="toggle-thumb" style={{ left: form.recurring ? 24 : 3 }} />
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
              {isFr ? (type==='note' ? 'Contenu' : 'Notes') : (type==='note' ? 'المحتوى' : 'ملاحظات')}
            </label>
            <textarea
              rows={3}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition resize-none"
              style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor, fontFamily:'Cairo,sans-serif', ...placeholderStyle }}
              placeholder={isFr ? 'Ajouter des détails...' : 'أضف تفاصيل...'}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="text-xs font-semibold block mb-2" style={{ color: labelColor }}>
              🔔 {isFr ? 'Rappel' : 'التنبيه'}
            </label>
            {isVacation ? (
              <select
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition appearance-none"
                style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor, fontFamily:'Cairo,sans-serif' }}
                value={form.reminderDaysBefore}
                onChange={e => set('reminderDaysBefore', parseInt(e.target.value))}
              >
                {[
                  { v:0,ar:'بدون تنبيه',fr:'Pas de rappel' },
                  { v:1,ar:'قبل يوم',   fr:'1 jour avant' },
                  { v:2,ar:'قبل يومين', fr:'2 jours avant' },
                  { v:3,ar:'قبل 3 أيام',fr:'3 jours avant' },
                  { v:7,ar:'قبل أسبوع', fr:'1 semaine avant' },
                ].map(o=>(
                  <option key={o.v} value={o.v} style={{ background:'#0F2550' }}>
                    {isFr ? o.fr : o.ar}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition appearance-none"
                style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:inputColor, fontFamily:'Cairo,sans-serif' }}
                value={form.reminderMinutesBefore}
                onChange={e => set('reminderMinutesBefore', parseInt(e.target.value))}
              >
                {REMINDER_OPTIONS.map(o=>(
                  <option key={o.value} value={o.value} style={{ background:'#0F2550' }}>{o.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-[14px] font-bold text-sm transition-all active:scale-95"
              style={{ background:inputBg, border:`1.5px solid ${inputBorder}`, color:labelColor }}
            >
              {isFr ? 'Annuler' : 'إلغاء'}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 rounded-[14px] font-black text-white transition-all active:scale-95"
              style={{ background:`linear-gradient(135deg,${color},${color}cc)`, boxShadow:`0 4px 20px ${color}55`, opacity:loading?0.6:1 }}
            >
              {loading ? '⏳' : (isFr ? '💾 Enregistrer' : '💾 حفظ')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
