import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

export function useTheme() {
  const { theme, setTheme, resolved, setResolved } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (value: 'light' | 'dark') => {
      setResolved(value)
      root.classList.toggle('dark', value === 'dark')
    }

    const update = () => {
      const next = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      apply(next)
    }

    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [theme, setTheme, setResolved])

  return { theme, setTheme, resolved }
}
