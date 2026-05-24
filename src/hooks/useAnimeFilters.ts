import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Anime } from '../types'

export type SortOption = 'recent' | 'title'
export type FilterOption = 'all' | 'favorite' | 'recommended' | 'unrated'

const SORT_OPTIONS: SortOption[] = ['recent', 'title']
const FILTER_OPTIONS: FilterOption[] = ['all', 'favorite', 'recommended', 'unrated']

function parseSortParam(value: string | null): SortOption {
  if (value && SORT_OPTIONS.includes(value as SortOption)) {
    return value as SortOption
  }
  return 'recent'
}

function parseFilterParam(value: string | null): FilterOption {
  if (value && FILTER_OPTIONS.includes(value as FilterOption)) {
    return value as FilterOption
  }
  return 'all'
}

function parsePageParam(value: string | null): number {
  const page = parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page >= 1 ? page : 1
}

type FilterState = {
  sortBy: SortOption
  reverseSort: boolean
  filterBy: FilterOption
  filterSeason: string
  currentPage: number
}

function buildSearchParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.sortBy !== 'recent') params.set('sort', state.sortBy)
  if (state.reverseSort) params.set('order', 'desc')
  if (state.filterBy !== 'all') params.set('filter', state.filterBy)
  if (state.filterSeason !== 'all') params.set('season', state.filterSeason)
  if (state.currentPage > 1) params.set('page', String(state.currentPage))
  return params
}

function readFilterState(searchParams: URLSearchParams): FilterState {
  return {
    sortBy: parseSortParam(searchParams.get('sort')),
    reverseSort: searchParams.get('order') === 'desc',
    filterBy: parseFilterParam(searchParams.get('filter')),
    filterSeason: searchParams.get('season') ?? 'all',
    currentPage: parsePageParam(searchParams.get('page')),
  }
}

export const useAnimeFilters = (animes: Anime[]) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sortBy, reverseSort, filterBy, filterSeason, currentPage } =
    readFilterState(searchParams)

  const updateState = useCallback(
    (partial: Partial<FilterState>) => {
      const next = { ...readFilterState(searchParams), ...partial }
      setSearchParams(buildSearchParams(next), { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setSortBy = useCallback(
    (sort: SortOption) => updateState({ sortBy: sort, currentPage: 1 }),
    [updateState],
  )

  const setReverseSort = useCallback(
    (reverse: boolean) => updateState({ reverseSort: reverse, currentPage: 1 }),
    [updateState],
  )

  const setFilterBy = useCallback(
    (filter: FilterOption) => updateState({ filterBy: filter, currentPage: 1 }),
    [updateState],
  )

  const setFilterSeason = useCallback(
    (season: string) => updateState({ filterSeason: season, currentPage: 1 }),
    [updateState],
  )

  const setCurrentPage = useCallback(
    (page: number) => updateState({ currentPage: page }),
    [updateState],
  )

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
      filtered = animes.filter(a => a.is_favorite)
    } else if (filterBy === 'recommended') {
      filtered = animes.filter(a => a.is_recommended)
    } else if (filterBy === 'unrated') {
      filtered = animes.filter(a => !a.is_favorite && !a.is_recommended)
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
