import { useState } from 'react'
import { useAnimeStore } from '../store/animeStore'
import { useAuthStore } from '../store/authStore'
import styled from 'styled-components'
import type { Anime, RatingValue } from '../types'

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
  background: #e2e8f0;
  overflow: hidden;
`

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const RatingBadge = styled.div<{ $rating: RatingValue }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$rating) {
      case 'favorite': return '#f59e0b'
      case 'recommended': return '#06b6d4'
      default: return 'transparent'
    }
  }};
  color: white;
  display: ${props => props.$rating ? 'block' : 'none'};
`

const Content = styled.div`
  padding: 1rem;
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Season = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
`

const RatingButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`

const RatingButton = styled.button<{ $active: boolean; $color: string }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.$active ? props.$color : '#e2e8f0'};
  background: ${props => props.$active ? props.$color : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? props.$color : `${props.$color}10`};
  }
`

const AnimeCard = ({ anime }: { anime: Anime }) => {
  const { updateRating } = useAnimeStore()
  const { isAuthenticated } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleRating = async (rating: RatingValue) => {
    if (isUpdating) return
    setIsUpdating(true)
    try {
      await updateRating(anime.id, rating)
    } catch (error) {
      console.error('Failed to update rating:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const rating = anime.rating || null

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true)
    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3C/svg%3E'
  }

  return (
    <Card>
      <ImageContainer>
        {!imageError && (
          <Image
            src={anime.images.recommended_url || ''}
            alt={anime.title}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        )}
        <RatingBadge $rating={rating}>
          {rating === 'favorite' ? '👑 めちゃ好き' : rating === 'recommended' ? '⭐ おすすめ' : ''}
        </RatingBadge>
      </ImageContainer>
      <Content>
        <Title>{anime.title}</Title>
        <Season>{anime.season_name_text || anime.season_name}</Season>
        {isAuthenticated && (
          <RatingButtons>
            <RatingButton
              $active={rating === 'favorite'}
              $color="#f59e0b"
              onClick={() => handleRating(rating === 'favorite' ? null : 'favorite')}
            >
              めちゃ好き
            </RatingButton>
            <RatingButton
              $active={rating === 'recommended'}
              $color="#06b6d4"
              onClick={() => handleRating(rating === 'recommended' ? null : 'recommended')}
            >
              おすすめ
            </RatingButton>
          </RatingButtons>
        )}
      </Content>
    </Card>
  )
}

export default AnimeCard

