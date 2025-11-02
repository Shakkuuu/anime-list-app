import { useEffect, useState, useMemo } from 'react'
import { useAnimeStore } from '../store/animeStore'
import AnimeCard from '../components/AnimeCard'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const ReverseButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #4f46e5;
  }

  &:active {
    transform: scale(0.98);
  }
`

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #4f46e5;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #64748b;
`

const Error = styled.div`
  text-align: center;
  padding: 3rem;
  color: #ef4444;
`

type SortOption = 'recent' | 'title' | 'season'
type FilterOption = 'all' | 'favorite' | 'recommended' | 'unrated'

const ITEMS_PER_PAGE = 50

const Watching = () => {
  const { animes, isLoading, error, fetchAnimes } = useAnimeStore()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [reverseSort, setReverseSort] = useState(false)
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [filterSeason, setFilterSeason] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAnimes('watching')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    } else if (sortBy === 'season') {
      sorted.sort((a, b) => {
        const seasonA = a.season_name || a.season_name_text || ''
        const seasonB = b.season_name || b.season_name_text || ''
        return seasonB.localeCompare(seasonA, 'ja')
      })
    }
    // 'recent' の場合は既にAnnictから降順で取得されているのでそのまま

    // 逆順ソート
    if (reverseSort) {
      sorted.reverse()
    }

    return sorted
  }, [animes, sortBy, filterBy, filterSeason, reverseSort])

  const totalPages = Math.ceil(filteredAndSortedAnimes.length / ITEMS_PER_PAGE)
  const paginatedAnimes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAndSortedAnimes.slice(start, end)
  }, [filteredAndSortedAnimes, currentPage])

  // フィルター変更時に1ページ目に戻る
  useEffect(() => {
    setCurrentPage(1)
  }, [filterBy, filterSeason, sortBy, reverseSort])

  if (isLoading) {
    return <Loading>読み込み中...</Loading>
  }

  if (error) {
    return <Error>{error}</Error>
  }

  return (
    <Container>
      <Controls>
        <div>
          <label htmlFor="sort">並び替え: </label>
          <Select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="recent">放送時期順</option>
            <option value="title">タイトル順</option>
            <option value="season">クール順</option>
          </Select>
        </div>
        <ReverseButton onClick={() => setReverseSort(!reverseSort)}>
          {reverseSort ? '🔄 逆順' : '⬇️ 順'}
        </ReverseButton>
        <div>
          <label htmlFor="filter">評価: </label>
          <Select id="filter" value={filterBy} onChange={(e) => setFilterBy(e.target.value as FilterOption)}>
            <option value="all">すべて</option>
            <option value="favorite">めちゃ好き</option>
            <option value="recommended">おすすめ</option>
            <option value="unrated">未評価</option>
          </Select>
        </div>
        <div>
          <label htmlFor="season">クール: </label>
          <Select id="season" value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
            <option value="all">すべて</option>
            {availableSeasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            ← 戻る
          </PageButton>
          <PageButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            次へ →
          </PageButton>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {filteredAndSortedAnimes.length}件
          </span>
        </div>
      </Controls>
      <Grid>
        {paginatedAnimes?.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        )) || []}
      </Grid>
    </Container>
  )
}

export default Watching

