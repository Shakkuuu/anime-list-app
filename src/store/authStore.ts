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
    } catch (error: any) {
      console.error('Error checking admin status:', error)

      // エラーの詳細をログに出力
      if (error.response) {
        console.error('API Error Response:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('API Request Error:', error.request)
      } else {
        console.error('Error:', error.message)
      }

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

      // エラーを再スローして、呼び出し元で処理できるようにする
      throw error
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Supabase login error:', error)
        throw error
      }

      // ログイン成功後、セッションを更新
      if (data.session?.user) {
        set({
          user: data.session.user,
          isAuthenticated: true,
          accessToken: data.session.access_token,
          isNotAdmin: false, // ログイン成功時にリセット
        })

      // 管理者チェックを実行して結果を返す
      try {
        const isAdmin = await get().checkAdminStatus()
        return isAdmin
      } catch (checkError: any) {
        // 管理者チェックでエラーが発生した場合
        console.error('Admin check failed after login:', checkError)
        // セッションは保持するが、管理者ではない
        // エラーを再スローして、Login.tsxで適切なエラーメッセージを表示できるようにする
        throw new Error('管理者権限の確認に失敗しました。管理者テーブルにユーザーが登録されているか確認してください。')
      }
      }

      return false
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
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

