'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserProfile = {
  id?: number
  fullName: string
  gender?: string
  birthDate?: string
  jobTitle?: string
  employer?: string
  city?: string
  language: 'ar' | 'fr'
  theme: 'dark' | 'light'
  accentColor: string
  birthdayReminderDays: number
}

type AppStore = {
  profile: UserProfile | null
  isSetup: boolean
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  language: 'ar' | 'fr'
  setProfile: (p: UserProfile) => void
  setSidebarOpen: (v: boolean) => void
  setSetup: (v: boolean) => void
  setTheme: (t: 'dark' | 'light') => void
  setLanguage: (l: 'ar' | 'fr') => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      profile: null,
      isSetup: false,
      sidebarOpen: false,
      theme: 'dark',
      language: 'ar',
      setProfile: (p) => set({ profile: p, isSetup: true }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setSetup: (v) => set({ isSetup: v }),
      setTheme: (t) => set({ theme: t }),
      setLanguage: (l) => set({ language: l }),
    }),
    { name: 'employee-planner-store' }
  )
)
