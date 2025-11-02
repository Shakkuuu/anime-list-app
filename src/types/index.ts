export interface Anime {
  id: number
  title: string
  season_name: string
  season_name_text: string
  released_on: string
  images: {
    recommended_url: string
  }
  is_favorite: boolean
  is_recommended: boolean
}

export interface AuthUser {
  id: string
  email?: string
}

export type AnimeStatus = 'watched' | 'watching'

export interface Season {
  year: string
  name: string
  label: string
}

