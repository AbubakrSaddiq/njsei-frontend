import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  hasRole: (slug: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('njsei_token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('njsei_token')
        localStorage.removeItem('njsei_user')
        set({ user: null, token: null, isAuthenticated: false })
      },

      hasRole: (slug) => {
        const user = get().user
        if (!user) return false
        return user.roles?.some((role) => role.slug === slug) ?? false
      },
    }),
    {
      name: 'njsei_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)