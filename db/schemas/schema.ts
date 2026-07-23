import { pgTable, serial, text, timestamp, integer, boolean, varchar, date } from 'drizzle-orm/pg-core'

export const userProfile = pgTable('user_profile', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  gender: varchar('gender', { length: 20 }),
  birthDate: date('birth_date'),
  jobTitle: text('job_title'),
  employer: text('employer'),
  city: text('city'),
  language: varchar('language', { length: 10 }).default('ar'),
  theme: varchar('theme', { length: 20 }).default('dark'),
  accentColor: varchar('accent_color', { length: 20 }).default('indigo'),
  birthdayReminderDays: integer('birthday_reminder_days').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  time: varchar('time', { length: 10 }),
  notes: text('notes'),
  reminderTime: varchar('reminder_time', { length: 10 }),
  reminderMinutesBefore: integer('reminder_minutes_before').default(30),
  completed: boolean('completed').default(false),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  time: varchar('time', { length: 10 }),
  notes: text('notes'),
  reminderMinutesBefore: integer('reminder_minutes_before').default(30),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const occasions = pgTable('occasions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  time: varchar('time', { length: 10 }),
  notes: text('notes'),
  reminderMinutesBefore: integer('reminder_minutes_before').default(30),
  recurring: boolean('recurring').default(false),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const vacations = pgTable('vacations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'annual' | 'compensatory'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  days: integer('days').notNull(),
  notes: text('notes'),
  reminderDaysBefore: integer('reminder_days_before').default(1),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  date: date('date').notNull(),
  time: varchar('time', { length: 10 }),
  reminderMinutesBefore: integer('reminder_minutes_before'),
  archived: boolean('archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
