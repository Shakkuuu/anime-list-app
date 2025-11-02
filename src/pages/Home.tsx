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

const Home = () => {
  const { animes, isLoading, error, fetchAnimes } = useAnimeStore()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  useEffect(() => {
    fetchAnimes('watched')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

    return sorted
  }, [animes, sortBy, filterBy])

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
            <option value="recent">放送時期順（新しい順）</option>
            <option value="title">タイトル順</option>
            <option value="season">クール順</option>
          </Select>
        </div>
        <div>
          <label htmlFor="filter">絞り込み: </label>
          <Select id="filter" value={filterBy} onChange={(e) => setFilterBy(e.target.value as FilterOption)}>
            <option value="all">すべて</option>
            <option value="favorite">めちゃ好き</option>
            <option value="recommended">おすすめ</option>
            <option value="unrated">未評価</option>
          </Select>
        </div>
        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.875rem' }}>
          {filteredAndSortedAnimes.length}件表示中
        </div>
      </Controls>
      <Grid>
        {filteredAndSortedAnimes?.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        )) || []}
      </Grid>
    </Container>
  )
}

export default Home

