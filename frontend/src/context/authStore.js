import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },

      updateUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          set({ isLoading: true })
          const { data } = await api.get('/users/me')
          set({ user: data.user })
        } catch {
          get().logout()
        } finally {
          set({ isLoading: false })
        }
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-storage', partialize: state => ({ token: state.token, user: state.user }) }
  )
)

export default useAuthStore
