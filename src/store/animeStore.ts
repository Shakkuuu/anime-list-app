import { create } from 'zustand'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import type { Anime, AnimeStatus } from '../types'

interface AnimeState {
  animes: Anime[]
  isLoading: boolean
  error: string | null
  fetchAnimes: (status: AnimeStatus) => Promise<void>
  updateRating: (annictId: number, isFavorite: boolean, isRecommended: boolean) => Promise<void>
}

export const useAnimeStore = create<AnimeState>((set, get) => ({
  animes: [],
  isLoading: false,
  error: null,

  fetchAnimes: async (status: AnimeStatus) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get<{ animes: Anime[] }>(
        `/api/list?status=${status}`
      )
      set({ animes: response.data.animes, isLoading: false })
    } catch (error) {
      console.error('Error fetching animes:', error)
      set({
        error: 'アニメデータの取得に失敗しました',
        isLoading: false,
      })
    }
  },

  updateRating: async (annictId: number, isFavorite: boolean, isRecommended: boolean) => {
    // authStoreからトークンを取得
    let { accessToken } = useAuthStore.getState()

    // accessTokenが存在しない場合、セッションから直接取得を試みる
    if (!accessToken) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.access_token) {
        throw new Error('Not authenticated')
      }
      accessToken = session.access_token
      // ストアも更新
      useAuthStore.setState({ accessToken })
    }

    // 楽観的UI更新：即座にローカル状態を更新
    const currentAnimes = get().animes || []
    const previousAnime = currentAnimes.find((anime) => anime.id === annictId)

    set({
      animes: currentAnimes.map((anime) =>
        anime.id === annictId ? { ...anime, is_favorite: isFavorite, is_recommended: isRecommended } : anime
      ),
    })

    try {
      await axios.post('/api/rate', {
        annictId,
        isFavorite,
        isRecommended,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      // エラーが発生した場合は元の状態に戻す
      if (previousAnime) {
        set({
          animes: currentAnimes.map((anime) =>
            anime.id === annictId ? previousAnime : anime
          ),
        })
      }
      console.error('Error updating rating:', error)
      throw error
    }
  },
}))

