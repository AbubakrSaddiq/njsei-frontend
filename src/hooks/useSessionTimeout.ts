import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onWarning: () => void
  onTimeout: () => void
}

export function useSessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 2,
  onWarning,
  onTimeout,
}: UseSessionTimeoutOptions) {
  const { isAuthenticated, clearAuth } = useAuthStore()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isWarningActive = useRef(false)

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
  }, [])

  const logout = useCallback(async () => {
    clearTimers()
    try {
      await authService.logout()
    } catch {
      // silent fail
    } finally {
      clearAuth()
      onTimeout()
    }
  }, [clearAuth, clearTimers, onTimeout])

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return
    if (isWarningActive.current) return

    clearTimers()

    const warningDelay = (timeoutMinutes - warningMinutes) * 60 * 1000
    const timeoutDelay = timeoutMinutes * 60 * 1000

    warningRef.current = setTimeout(() => {
      isWarningActive.current = true
      onWarning()
    }, warningDelay)

    timeoutRef.current = setTimeout(() => {
      logout()
    }, timeoutDelay)
  }, [isAuthenticated, timeoutMinutes, warningMinutes, clearTimers, onWarning, logout])

  const stayLoggedIn = useCallback(() => {
    isWarningActive.current = false
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers()
      return
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      if (!isWarningActive.current) {
        resetTimer()
      }
    }

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))
    resetTimer()

    return () => {
      clearTimers()
      events.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [isAuthenticated, resetTimer, clearTimers])

  return { stayLoggedIn, logout }
}