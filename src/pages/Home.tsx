import { useEffect, useMemo } from 'react'
import { useAnimeStore } from '../store/animeStore'
import AnimeCard from '../components/AnimeCard'
import AnimeFilters from '../components/AnimeFilters'
import { useAnimeFilters } from '../hooks/useAnimeFilters'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const ITEMS_PER_PAGE = 50

const Home = () => {
  const { animes, isLoading, error, fetchAnimes } = useAnimeStore()
  const {
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
  } = useAnimeFilters(animes)

  useEffect(() => {
    fetchAnimes('watched')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(filteredAndSortedAnimes.length / ITEMS_PER_PAGE)
  const paginatedAnimes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredAndSortedAnimes.slice(start, end)
  }, [filteredAndSortedAnimes, currentPage])

  if (isLoading) {
    return <Loading>読み込み中...</Loading>
  }

  if (error) {
    return <Error>{error}</Error>
  }

  return (
    <Container>
      <AnimeFilters
        sortBy={sortBy}
        reverseSort={reverseSort}
        filterBy={filterBy}
        filterSeason={filterSeason}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={filteredAndSortedAnimes.length}
        availableSeasons={availableSeasons}
        onSortChange={setSortBy}
        onReverseToggle={() => setReverseSort(!reverseSort)}
        onFilterChange={setFilterBy}
        onSeasonChange={setFilterSeason}
        onPageChange={setCurrentPage}
      />
      <Grid>
        {paginatedAnimes?.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        )) || []}
      </Grid>
    </Container>
  )
}

export default Home

