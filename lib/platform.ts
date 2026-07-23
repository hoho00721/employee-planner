/**
 * lib/platform.ts
 * Detects whether the app is running inside Capacitor (native Android/iOS)
 * or as a plain web/PWA.  All platform-specific code branches through here
 * so the rest of the codebase stays clean.
 */

// ─── Type augmentation for Capacitor global ───────────────────────────────────
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean
      getPlatform: () => 'android' | 'ios' | 'web'
      Plugins?: Record<string, unknown>
    }
  }
}

export function isNative(): boolean {
  if (typeof window === 'undefined') return false
  return !!window.Capacitor?.isNativePlatform()
}

export function getPlatform(): 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web'
  return window.Capacitor?.getPlatform() ?? 'web'
}

export function isAndroid(): boolean {
  return getPlatform() === 'android'
}

export function isIOS(): boolean {
  return getPlatform() === 'ios'
}

// ─── Network detection ────────────────────────────────────────────────────────

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

// ─── Safe localStorage (SSR + Capacitor compatible) ──────────────────────────

export const safeStorage = {
  get(key: string): string | null {
    try { return typeof window !== 'undefined' ? localStorage.getItem(key) : null }
    catch { return null }
  },
  set(key: string, value: string): void {
    try { if (typeof window !== 'undefined') localStorage.setItem(key, value) }
    catch {}
  },
  remove(key: string): void {
    try { if (typeof window !== 'undefined') localStorage.removeItem(key) }
    catch {}
  },
}

// ─── Vibration (web fallback, Capacitor Haptics when available) ───────────────

export function vibrate(pattern: number | number[] = 40): void {
  try {
    if (isNative()) {
      // Capacitor Haptics plugin — loaded dynamically to avoid import errors
      // when running in web mode without the plugin installed.
      import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
      }).catch(() => {})
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {}
}
