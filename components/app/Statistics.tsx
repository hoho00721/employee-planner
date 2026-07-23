'use client'
import type { CalendarEvent } from '@/lib/types'
import { EVENT_COLORS, EVENT_LABELS_AR } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type Props = { events: CalendarEvent[]; isLight?: boolean; isFr?: boolean }

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

export default function Statistics({ events, isLight = false, isFr = false }: Props) {
  const tasks = events.filter(e => e.type === 'task')
  const appointments = events.filter(e => e.type === 'appointment')
  const occasions = events.filter(e => e.type === 'occasion')
  const vacationAnnual = [...new Set(events.filter(e => e.type === 'vacation_annual').map(e => e.id))]
  const vacationComp = [...new Set(events.filter(e => e.type === 'vacation_comp').map(e => e.id))]
  const notes = events.filter(e => e.type === 'note')
  const completedTasks = tasks.filter(e => e.completed)

  // By type pie data
  const typeData = [
    { name: 'مهام', value: tasks.length, color: EVENT_COLORS.task },
    { name: 'مواعيد', value: appointments.length, color: EVENT_COLORS.appointment },
    { name: 'مناسبات', value: occasions.length, color: EVENT_COLORS.occasion },
    { name: 'إجازات سنوية', value: vacationAnnual.length, color: EVENT_COLORS.vacation_annual },
    { name: 'إجازات تعويضية', value: vacationComp.length, color: EVENT_COLORS.vacation_comp },
    { name: 'ملاحظات', value: notes.length, color: EVENT_COLORS.note },
  ].filter(d => d.value > 0)

  // By month bar data (current year)
  const year = new Date().getFullYear()
  const monthData = MONTHS_AR.map((name, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`
    return {
      name: name.slice(0, 3),
      أحداث: events.filter(e => e.date?.startsWith(prefix)).length,
    }
  })

  const totalEvents = events.length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="glass-card p-4">
        <h2 className="text-white font-bold text-lg mb-1">📊 الإحصائيات</h2>
        <p className="text-white/50 text-sm">نظرة عامة على بياناتك</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400">{totalEvents}</div>
          <div className="text-white/60 text-xs mt-1">إجمالي الأحداث</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{completionRate}%</div>
          <div className="text-white/60 text-xs mt-1">نسبة إنجاز المهام</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{tasks.length}</div>
          <div className="text-white/60 text-xs mt-1">المهام</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-pink-400">{vacationAnnual.length + vacationComp.length}</div>
          <div className="text-white/60 text-xs mt-1">الإجازات</div>
        </div>
      </div>

      {/* All type counts */}
      <div className="glass-card p-4">
        <h3 className="text-white font-semibold text-sm mb-3">توزيع الأحداث</h3>
        <div className="space-y-2.5">
          {[
            { type: 'task', count: tasks.length },
            { type: 'appointment', count: appointments.length },
            { type: 'occasion', count: occasions.length },
            { type: 'vacation_annual', count: vacationAnnual.length },
            { type: 'vacation_comp', count: vacationComp.length },
            { type: 'note', count: notes.length },
          ].map(({ type, count }) => (
            <div key={type} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: EVENT_COLORS[type as keyof typeof EVENT_COLORS] }} />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-white/70 text-xs">{EVENT_LABELS_AR[type as keyof typeof EVENT_LABELS_AR]}</span>
                <span className="text-white font-bold text-sm">{count}</span>
              </div>
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${totalEvents > 0 ? (count / totalEvents) * 100 : 0}%`,
                    background: EVENT_COLORS[type as keyof typeof EVENT_COLORS],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="glass-card p-4">
        <h3 className="text-white font-semibold text-sm mb-3">الأحداث حسب الشهر ({year})</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,20,50,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8 }}
                labelStyle={{ color: 'white' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="أحداث" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      {typeData.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold text-sm mb-3">توزيع أنواع الأحداث</h3>
          <div className="flex items-center gap-3">
            {/* PieChart: use a % width so it never overflows on small screens */}
            <div style={{ width:'38%', flexShrink:0, aspectRatio:'1/1' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={3} dataKey="value">
                    {typeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {typeData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-white/60 text-xs flex-1 truncate">{d.name}</span>
                  <span className="text-white font-bold text-xs flex-shrink-0">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task completion */}
      {tasks.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold text-sm mb-3">إنجاز المهام</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs">{completedTasks.length} من {tasks.length} مهمة</span>
            <span className="text-green-400 font-bold text-sm">{completionRate}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
