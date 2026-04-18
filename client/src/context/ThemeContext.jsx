import { useState, useEffect } from 'react'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'kandew-theme'
const VALID_MODES = ['light', 'dark', 'system']

function readStoredMode() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return VALID_MODES.includes(saved) ? saved : 'light'
}

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => setSystemDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const dark = mode === 'dark' || (mode === 'system' && systemDark)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ mode, setMode, dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
