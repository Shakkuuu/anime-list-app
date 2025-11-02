import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
`

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
`

const Message = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`

const NotAdmin = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 3秒後にトップページにリダイレクト
    const timer = setTimeout(() => {
      navigate('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Container>
      <Icon>⚠️</Icon>
      <Title>管理者ではありません</Title>
      <Message>
        このページにアクセスするには管理者権限が必要です。
        <br />
        3秒後にトップページに戻ります...
      </Message>
      <Button onClick={() => navigate('/')}>トップページに戻る</Button>
    </Container>
  )
}

export default NotAdmin

