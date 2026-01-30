import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import NotAdmin from './NotAdmin'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
`

const Card = styled.div`
  background: var(--card-bg);
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px var(--card-shadow);
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--text-color);
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--card-bg);
  color: var(--text-color);

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const Button = styled.button`
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Error = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #ef4444;
  color: white;
  text-align: center;
`

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isNotAdmin } = useAuthStore()
  const navigate = useNavigate()

  // 管理者でない場合はNotAdminページを表示
  if (isNotAdmin) {
    return <NotAdmin />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      // ログイン成功後、管理者チェックが自動的に実行される
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Card>
        <Title>管理者ログイン</Title>
        {error && <Error>{error}</Error>}
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </Form>
      </Card>
    </Container>
  )
}

export default Login

