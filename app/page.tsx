'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import SplashScreen from '@/components/app/SplashScreen'
import SetupScreen from '@/components/app/SetupScreen'
import MainApp from '@/components/app/MainApp'

export default function Home() {
  const { isSetup, setProfile } = useAppStore()
  const [phase, setPhase] = useState<'splash' | 'setup' | 'app'>('splash')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if profile exists in DB
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile)
          // Show splash then go to app
          setTimeout(() => setPhase('app'), 2500)
        } else {
          setTimeout(() => setPhase('setup'), 2500)
        }
        setChecking(false)
      })
      .catch(() => {
        if (isSetup) setTimeout(() => setPhase('app'), 2500)
        else setTimeout(() => setPhase('setup'), 2500)
        setChecking(false)
      })
  }, [])

  if (phase === 'splash') return <SplashScreen />
  if (phase === 'setup') return <SetupScreen onComplete={() => setPhase('app')} />
  return <MainApp />
}
