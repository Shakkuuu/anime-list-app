import { useState, useMemo, useEffect } from 'react'
import type { Anime } from '../types'

export type SortOption = 'recent' | 'title'
export type FilterOption = 'all' | 'favorite' | 'recommended' | 'unrated'

export const useAnimeFilters = (animes: Anime[]) => {
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [reverseSort, setReverseSort] = useState(false)
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [filterSeason, setFilterSeason] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const availableSeasons = useMemo(() => {
    if (!animes || animes.length === 0) return []
    const seasons = new Set<string>()
    animes.forEach(a => {
      const season = a.season_name_text || a.season_name || ''
      if (season) seasons.add(season)
    })
    return Array.from(seasons).sort().reverse()
  }, [animes])

  const filteredAndSortedAnimes = useMemo(() => {
    if (!animes || animes.length === 0) return []

    // フィルタリング
    let filtered = animes
    if (filterBy === 'favorite') {
      filtered = animes.filter(a => a.rating === 'favorite')
    } else if (filterBy === 'recommended') {
      filtered = animes.filter(a => a.rating === 'recommended')
    } else if (filterBy === 'unrated') {
      filtered = animes.filter(a => !a.rating)
    }

    // クールでの絞り込み
    if (filterSeason !== 'all') {
      filtered = filtered.filter(a => {
        const season = a.season_name_text || a.season_name || ''
        return season === filterSeason
      })
    }

    // ソート
    const sorted = [...filtered]
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
    }

    // 逆順ソート
    if (reverseSort) {
      sorted.reverse()
    }

    return sorted
  }, [animes, sortBy, filterBy, filterSeason, reverseSort])

  // フィルター変更時に1ページ目に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [filterBy, filterSeason, sortBy, reverseSort])

  return {
    sortBy,
    setSortBy,
    reverseSort,
    setReverseSort,
    filterBy,
    setFilterBy,
    filterSeason,
    setFilterSeason,
    currentPage,
    setCurrentPage,
    availableSeasons,
    filteredAndSortedAnimes,
  }
}

