import { useEffect } from 'react'
import { useAnimeStore } from '../store/animeStore'
import AnimeCard from '../components/AnimeCard'
import styled from 'styled-components'

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

const Watching = () => {
  const { animes, isLoading, error, fetchAnimes } = useAnimeStore()

  useEffect(() => {
    fetchAnimes('watching')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <Loading>読み込み中...</Loading>
  }

  if (error) {
    return <Error>{error}</Error>
  }

  return (
    <Grid>
      {animes?.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      )) || []}
    </Grid>
  )
}

export default Watching

