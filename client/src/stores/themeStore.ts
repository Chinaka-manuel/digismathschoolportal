import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolved: 'light' | 'dark'
  setResolved: (resolved: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      resolved: 'light',
      setResolved: (resolved) => set({ resolved }),
    }),
    { name: 'northbridge-theme' }
  )
)
