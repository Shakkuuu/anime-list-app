import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Watching from './pages/Watching'
import Login from './pages/Login'
import NotAdmin from './pages/NotAdmin'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'

function App() {
  const { initializeAuth } = useAuthStore()
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    initializeAuth()
    initializeTheme()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="watching" element={<Watching />} />
          <Route path="login" element={<Login />} />
          <Route path="not-admin" element={<NotAdmin />} />
          <Route path="500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

