import { create } from 'zustand'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import type { Anime, AnimeStatus, RatingValue } from '../types'

interface AnimeState {
  animes: Anime[]
  isLoading: boolean
  error: string | null
  fetchAnimes: (status: AnimeStatus) => Promise<void>
  updateRating: (annictId: number, rating: RatingValue) => Promise<void>
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

  updateRating: async (annictId: number, rating: RatingValue) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      await axios.post('/api/rate', {
        annictId,
        rating,
      })

      // ローカル状態を更新
      const currentAnimes = get().animes || []
      set({
        animes: currentAnimes.map((anime) =>
          anime.id === annictId ? { ...anime, rating } : anime
        ),
      })
    } catch (error) {
      console.error('Error updating rating:', error)
      throw error
    }
  },
}))

