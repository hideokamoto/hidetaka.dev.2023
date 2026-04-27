'use client'
import { useEffect, useState } from 'react'

export default function ModeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !document.documentElement.classList.contains('dark')
    if (next) {
      document.documentElement.classList.add('dark')
      document.documentElement.dataset.theme = 'dark'
      window.localStorage.isDarkMode = 'true'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.dataset.theme = 'light'
      window.localStorage.isDarkMode = 'false'
    }
    setIsDark(next)
  }

  if (!mounted) return null

  return (
    <button type="button" onClick={toggle} className="ds-theme-btn" aria-label="Toggle dark mode">
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}
