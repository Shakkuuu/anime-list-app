import { create } from 'zustand'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import type { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isNotAdmin: boolean
  initializeAuth: () => Promise<void>
  checkAdminStatus: () => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearNotAdmin: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isNotAdmin: false,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      })

      // 管理者チェック（セッションがある場合）
      if (session?.user) {
        const store = useAuthStore.getState()
        await store.checkAdminStatus()
      }

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
        })

        // セッションがある場合は管理者チェック
        if (session?.user) {
          const store = useAuthStore.getState()
          await store.checkAdminStatus()
        } else {
          set({ isAdmin: false })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false })
    }
  },

  checkAdminStatus: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        set({ isAdmin: false })
        return false
      }

      const response = await axios.get('/api/check-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const { isAdmin } = response.data

      // 管理者でない場合はログアウト
      if (!isAdmin) {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false, isAdmin: false, isNotAdmin: true })
        return false
      }

      set({ isAdmin })
      return true
    } catch (error) {
      console.error('Error checking admin status:', error)
      // チェックエラーの場合は管理者扱いしない
      set({ isAdmin: false })
      return false
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    // ログイン成功後、セッションを更新
    if (data.session?.user) {
      set({
        user: data.session.user,
        isAuthenticated: true,
      })

      // 管理者チェックを実行して結果を返す
      const store = useAuthStore.getState()
      const isAdmin = await store.checkAdminStatus()
      return isAdmin
    }

    return false
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, isAuthenticated: false, isAdmin: false, isNotAdmin: false })
  },

  clearNotAdmin: () => {
    set({ isNotAdmin: false })
  },
}))

