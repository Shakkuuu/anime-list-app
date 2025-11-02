import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initializeTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (theme) => {
    set({ theme })
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(newTheme)
  },
  initializeTheme: () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const theme = savedTheme || 'light'
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  },
}))

