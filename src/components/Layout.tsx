import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import styled from 'styled-components'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #6366f1;
`

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${props => props.$active ? '#6366f1' : '#64748b'};
  text-decoration: none;
  font-weight: ${props => props.$active ? 600 : 400};
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #6366f1;
  }
`

const AuthInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
`

const Main = styled.main`
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
`

const Footer = styled.footer`
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  text-align: center;
  margin-top: auto;
`

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  font-size: 0.875rem;
  color: #64748b;
`

const FooterLink = styled.a`
  color: #6366f1;
  text-decoration: none;
  margin: 0 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`

const Layout = () => {
  const { isAuthenticated, logout } = useAuthStore()
  const location = useLocation()

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>🧲 Shakkuのアニメリスト</Logo>
          <Nav>
            <NavLink to="/" $active={location.pathname === '/'}>
              見た
            </NavLink>
            <NavLink to="/watching" $active={location.pathname === '/watching'}>
              見てる
            </NavLink>
            {isAuthenticated ? (
              <AuthInfo>
                <span>👤 管理者でログイン済み</span>
                <button onClick={logout}>ログアウト</button>
              </AuthInfo>
            ) : (
              <NavLink to="/login">管理者ログイン</NavLink>
            )}
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <FooterContent>
          このサイトは <FooterLink href="https://annict.com" target="_blank" rel="noopener noreferrer">Annict</FooterLink> を使用しています
        </FooterContent>
      </Footer>
    </Container>
  )
}

export default Layout

