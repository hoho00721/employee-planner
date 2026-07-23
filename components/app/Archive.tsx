'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { EVENT_COLORS, EVENT_ICONS, EVENT_LABELS_AR } from '@/lib/types'
import type { EventType } from '@/lib/types'

type ArchiveItem = {
  id: number
  type: EventType
  title: string
  date?: string
  time?: string
  notes?: string | null
  completed?: boolean
  startDate?: string
  endDate?: string
  days?: number
  recurring?: boolean
  content?: string | null
  archived?: boolean
}

type FilterType = 'all' | EventType

export default function Archive({ refetch, isLight = false, isFr = false }: { refetch: () => void; isLight?: boolean; isFr?: boolean }) {
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, a, o, v, n] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/occasions').then(r => r.json()),
        fetch('/api/vacations').then(r => r.json()),
        fetch('/api/notes').then(r => r.json()),
      ])
      const all: ArchiveItem[] = [
        ...(t.tasks || []).map((x: ArchiveItem) => ({ ...x, type: 'task' as EventType })),
        ...(a.appointments || []).map((x: ArchiveItem) => ({ ...x, type: 'appointment' as EventType })),
        ...(o.occasions || []).map((x: ArchiveItem) => ({ ...x, type: 'occasion' as EventType })),
        ...(v.vacations || []).map((x: ArchiveItem) => ({
          ...x,
          type: x.type === 'annual' ? 'vacation_annual' as EventType : 'vacation_comp' as EventType,
          date: x.startDate,
        })),
        ...(n.notes || []).map((x: ArchiveItem) => ({ ...x, type: 'note' as EventType })),
      ]
      all.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      setItems(all)
    } catch {
      toast.error('خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (item: ArchiveItem) => {
    const endpointMap: Partial<Record<EventType, string>> = {
      task: '/api/tasks',
      appointment: '/api/appointments',
      occasion: '/api/occasions',
      vacation_annual: '/api/vacations',
      vacation_comp: '/api/vacations',
      note: '/api/notes',
    }
    const ep = endpointMap[item.type]
    if (!ep) return
    await fetch(`${ep}?id=${item.id}`, { method: 'DELETE' })
    toast.success('تم الحذف')
    load()
    refetch()
  }

  const handleToggleTask = async (item: ArchiveItem) => {
    if (item.type !== 'task') return
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, completed: !item.completed }),
    })
    load()
    refetch()
  }

  const filters: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'الكل', icon: '📋' },
    { type: 'task', label: 'المهام', icon: '📋' },
    { type: 'appointment', label: 'المواعيد', icon: '📅' },
    { type: 'occasion', label: 'المناسبات', icon: '🎉' },
    { type: 'vacation_annual', label: 'الإجازات السنوية', icon: '🌴' },
    { type: 'vacation_comp', label: 'الإجازات التعويضية', icon: '🏖️' },
    { type: 'note', label: 'الملاحظات', icon: '📝' },
  ]

  const filtered = items.filter(item => {
    const matchFilter = filter === 'all' || item.type === filter
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-3">
      <div className="glass-card p-4">
        <h2 className="text-white font-bold text-lg mb-1">📦 الأرشيف</h2>
        <p className="text-white/50 text-sm">جميع بياناتك المسجلة</p>
      </div>

      {/* Search */}
      <div className="glass-card p-3">
        <input
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition text-sm"
          placeholder="🔍 بحث..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => (
          <button
            key={f.type}
            onClick={() => setFilter(f.type)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === f.type
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <p className="text-white/40 text-sm">جار التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/40 text-sm">لا توجد بيانات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={`${item.type}-${item.id}`} className="glass-card p-3 flex items-center gap-3">
              {/* Toggle task */}
              {item.type === 'task' ? (
                <button
                  onClick={() => handleToggleTask(item)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  {item.completed && <span className="text-white text-xs">✓</span>}
                </button>
              ) : (
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: EVENT_COLORS[item.type] + '33' }}
                >
                  {EVENT_ICONS[item.type]}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-white/40' : 'text-white'}`}>
                  {item.title}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {EVENT_LABELS_AR[item.type]}
                  {item.date ? ` · ${item.date}` : ''}
                  {item.time ? ` ${item.time}` : ''}
                  {item.days ? ` · ${item.days} يوم` : ''}
                </p>
                {(item.notes || item.content) && (
                  <p className="text-white/30 text-xs mt-0.5 truncate">{item.notes || item.content}</p>
                )}
              </div>

              <button
                onClick={() => handleDelete(item)}
                className="w-8 h-8 rounded-xl bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition flex-shrink-0 text-sm"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
