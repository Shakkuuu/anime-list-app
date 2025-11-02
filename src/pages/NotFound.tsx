import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
`

const Icon = styled.div`
  font-size: 6rem;
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
`

const Message = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
`

const Button = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #4f46e5;
  }
`

const NotFound = () => {
  return (
    <Container>
      <Icon>🧲</Icon>
      <Title>404</Title>
      <Message>
        お探しのページは見つかりませんでした。
      </Message>
      <Button to="/">トップページに戻る</Button>
    </Container>
  )
}

export default NotFound

