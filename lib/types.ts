export type EventType = 'task' | 'appointment' | 'occasion' | 'vacation_annual' | 'vacation_comp' | 'note' | 'birthday'

export const EVENT_COLORS: Record<EventType, string> = {
  task: '#3B82F6',           // blue
  appointment: '#22C55E',    // green
  occasion: '#A855F7',       // purple
  vacation_annual: '#EF4444',// red
  vacation_comp: '#EAB308',  // yellow
  note: '#F97316',           // orange
  birthday: '#EC4899',       // pink
}

export const EVENT_ICONS: Record<EventType, string> = {
  task: '📋',
  appointment: '📅',
  occasion: '🎉',
  vacation_annual: '🌴',
  vacation_comp: '🏖️',
  note: '📝',
  birthday: '🎂',
}

export const EVENT_LABELS_AR: Record<EventType, string> = {
  task: 'مهمة',
  appointment: 'موعد',
  occasion: 'مناسبة',
  vacation_annual: 'عطلة سنوية',
  vacation_comp: 'عطلة تعويضية',
  note: 'ملاحظة',
  birthday: 'عيد ميلاد',
}

export type CalendarEvent = {
  id: number
  type: EventType
  title: string
  date: string
  endDate?: string
  time?: string
  notes?: string
  completed?: boolean
  archived?: boolean
}
