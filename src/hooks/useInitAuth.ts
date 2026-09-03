import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

export function useInitAuth() {
  const { isAuthenticated, setAuth, token } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token) {
      // Refresh user data including roles on app load
      authService.me().then((response) => {
        setAuth(response.user, token)
      }).catch(() => {
        // Token expired - handled by axios interceptor
      })
    }
  }, []) // Only run once on mount
}