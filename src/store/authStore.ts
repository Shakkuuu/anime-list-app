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
  accessToken: string | null
  initializeAuth: () => Promise<void>
  checkAdminStatus: () => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearNotAdmin: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isNotAdmin: false,
  accessToken: null,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        accessToken: session?.access_token || null,
        isLoading: false,
        isNotAdmin: false, // セッション復元時にリセット
      })

      // 管理者チェック（セッションがある場合）
      if (session?.user) {
        await get().checkAdminStatus()
      } else {
        // セッションがない場合は状態をクリア
        set({ isAdmin: false, isNotAdmin: false })
      }

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          accessToken: session?.access_token || null,
          isNotAdmin: false, // セッション変更時にリセット
        })

        // セッションがある場合は管理者チェック
        if (session?.user) {
          await get().checkAdminStatus()
        } else {
          set({ isAdmin: false, isNotAdmin: false })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isLoading: false })
    }
  },

  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        set({ isAdmin: false, accessToken: null, isNotAdmin: false })
        return false
      }

      // アクセストークンを更新
      set({ accessToken: session.access_token })

      const response = await axios.get('/api/check-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const { isAdmin } = response.data

      // 管理者でない場合はログアウト
      if (!isAdmin) {
        await supabase.auth.signOut()
        set({ user: null, isAuthenticated: false, isAdmin: false, isNotAdmin: true, accessToken: null })
        return false
      }

      // 管理者チェック成功
      set({ isAdmin: true, isNotAdmin: false })
      return true
    } catch (error) {
      console.error('Error checking admin status:', error)
      // チェックエラーの場合は管理者扱いしないが、accessTokenは保持
      // （セッションが存在する場合はトークンを保持）
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        // セッションは存在するが管理者チェックに失敗した場合
        // セッションを保持して、isNotAdminをtrueにする
        set({ isAdmin: false, accessToken: session.access_token, isNotAdmin: true })
      } else {
        // セッションが存在しない場合
        set({ isAdmin: false, accessToken: null, isNotAdmin: false })
      }
      return false
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
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
        accessToken: data.session.access_token,
        isNotAdmin: false, // ログイン成功時にリセット
      })

      // 管理者チェックを実行して結果を返す
      const isAdmin = await get().checkAdminStatus()
      return isAdmin
    }

    return false
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, isAuthenticated: false, isAdmin: false, isNotAdmin: false, accessToken: null })
  },

  clearNotAdmin: () => {
    set({ isNotAdmin: false })
  },
}))

