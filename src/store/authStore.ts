import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  initializeAuth: () => Promise<void>
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      })

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
        })
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false })
    }
  },

  login: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/login',
      },
    })
    if (error) throw error
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, isAuthenticated: false })
  },
}))

