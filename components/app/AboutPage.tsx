'use client'
import Image from 'next/image'

export default function AboutPage({ isLight = false, isFr = false }: { isLight?: boolean; isFr?: boolean }) {
  const cardBg  = isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.06)'
  const cardBdr = isLight ? 'rgba(0,0,0,0.07)'       : 'rgba(255,255,255,0.09)'
  const txtClr  = isLight ? '#1A2A4A'                 : '#ffffff'
  const subClr  = isLight ? '#4A6A9A'                 : 'rgba(255,255,255,0.55)'

  return (
    <div className="space-y-3">

      {/* App identity card */}
      <div
        className="rounded-[22px] p-6 text-center"
        style={{ background: cardBg, border: `1px solid ${cardBdr}`, boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.06)' : 'none' }}
      >
        {/* App logo */}
        <div className="flex justify-center mb-4">
          <div
            className="w-24 h-24 rounded-[28px] overflow-hidden flex items-center justify-center"
            style={{ boxShadow: '0 8px 32px rgba(21,101,192,0.35)', border: '3px solid rgba(21,101,192,0.25)' }}
          >
            <Image
              src="/app-icon.png"
              alt="منظم الموظف"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>

        <h2 className="font-black text-2xl mb-1" style={{ color: txtClr }}>منظم الموظف</h2>
        <p className="text-sm font-medium" style={{ color: '#1976D2' }}>Employee Planner</p>
        <p className="text-xs mt-1" style={{ color: subClr }}>الإصدار 1.0.0</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3">🎯 عن التطبيق</h3>
        <p className="text-white/60 text-sm leading-relaxed">
          منظم الموظف هو مساعد شخصي ذكي لإدارة الحياة المهنية والشخصية للموظف.
          يهدف التطبيق إلى مساعدتك على تنظيم وقتك وإجازاتك ومهامك ومواعيدك بكل سهولة ويسر.
        </p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3">✨ المميزات الرئيسية</h3>
        <div className="space-y-2.5">
          {[
            { icon: '📅', text: 'تقويم تفاعلي ذكي مع ترميز لوني' },
            { icon: '📋', text: 'إدارة المهام والمواعيد والمناسبات' },
            { icon: '🌴', text: 'إدارة الإجازات السنوية والتعويضية' },
            { icon: '📝', text: 'ملاحظات ذكية مرتبطة بالتقويم' },
            { icon: '📊', text: 'إحصائيات ورسوم بيانية احترافية' },
            { icon: '🔔', text: 'نظام تنبيهات ذكي لجميع الأحداث' },
            { icon: '📦', text: 'أرشيف متكامل مع بحث وفلترة' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-white/60 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3">🛠️ التقنيات المستخدمة</h3>
        <div className="flex flex-wrap gap-2">
          {['Next.js', 'React 19', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS', 'Recharts'].map(tech => (
            <span key={tech} className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
