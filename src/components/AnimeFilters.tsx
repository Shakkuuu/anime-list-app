import styled from 'styled-components'
import { SortOption, FilterOption } from '../hooks/useAnimeFilters'

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

interface AnimeFiltersProps {
  sortBy: SortOption
  reverseSort: boolean
  filterBy: FilterOption
  filterSeason: string
  currentPage: number
  totalPages: number
  totalCount: number
  availableSeasons: string[]
  onSortChange: (sort: SortOption) => void
  onReverseToggle: () => void
  onFilterChange: (filter: FilterOption) => void
  onSeasonChange: (season: string) => void
  onPageChange: (page: number) => void
}

const AnimeFilters = ({
  sortBy,
  reverseSort,
  filterBy,
  filterSeason,
  currentPage,
  totalPages,
  totalCount,
  availableSeasons,
  onSortChange,
  onReverseToggle,
  onFilterChange,
  onSeasonChange,
  onPageChange,
}: AnimeFiltersProps) => {
  return (
    <Controls>
      <div>
        <label htmlFor="sort">並び替え: </label>
        <Select id="sort" value={sortBy} onChange={(e) => onSortChange(e.target.value as SortOption)}>
          <option value="recent">放送時期順</option>
          <option value="title">タイトル順</option>
        </Select>
      </div>
      <ReverseButton onClick={onReverseToggle}>
        {reverseSort ? '降順' : '昇順'}
      </ReverseButton>
      <div>
        <label htmlFor="filter">評価: </label>
        <Select id="filter" value={filterBy} onChange={(e) => onFilterChange(e.target.value as FilterOption)}>
          <option value="all">すべて</option>
          <option value="favorite">めちゃ好き</option>
          <option value="recommended">おすすめ</option>
          <option value="unrated">未評価</option>
        </Select>
      </div>
      <div>
        <label htmlFor="season">クール: </label>
        <Select id="season" value={filterSeason} onChange={(e) => onSeasonChange(e.target.value)}>
          <option value="all">すべて</option>
          {availableSeasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </Select>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <PageButton onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          ← 戻る
        </PageButton>
        <PageButton onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          次へ →
        </PageButton>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
          {totalCount}件
        </span>
      </div>
    </Controls>
  )
}

export default AnimeFilters

